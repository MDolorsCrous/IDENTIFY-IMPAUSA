// Empaqueta una carpeta de skill en un fichero .skill listo para subir a claude.ai.
//
//   node tools/empaquetar-skill.mjs laia-coach metaforas-coaching
//   node tools/empaquetar-skill.mjs --todas
//   node tools/empaquetar-skill.mjs ../otra/carpeta --salida C:/donde/sea
//
// Un nombre suelto se busca en ~/.claude/skills/. Tambien vale una ruta.
//
// Existe porque Compress-Archive de PowerShell guarda las rutas con barra
// invertida y el formato ZIP las quiere hacia delante: un .skill hecho asi no
// sube. Aqui los nombres de entrada se controlan uno a uno.
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

import { crearZip } from "./zip.mjs";

const SKILLS = path.join(homedir(), ".claude", "skills");
const SALIDA_POR_DEFECTO = path.join(SKILLS, "paquetes-para-subir");
const LIMITE_DESCRIPCION = 1024; // lo que acepta claude.ai al cargar la skill

function morir(mensaje) {
  console.error("\n✖ " + mensaje + "\n");
  process.exit(1);
}

/** Todos los ficheros de una carpeta, con su ruta relativa en barras hacia delante. */
function ficheros(raiz, rel = "") {
  const salida = [];
  for (const entrada of readdirSync(path.join(raiz, rel), { withFileTypes: true })) {
    const hijo = rel ? rel + "/" + entrada.name : entrada.name;
    if (entrada.isDirectory()) salida.push(...ficheros(raiz, hijo));
    else salida.push(hijo);
  }
  return salida;
}

/** Una carpeta es una skill si tiene SKILL.md con su frontmatter. */
function esSkill(dir) {
  try {
    return readFileSync(path.join(dir, "SKILL.md"), "utf8").startsWith("---");
  } catch {
    return false;
  }
}

const args = process.argv.slice(2);
const iSalida = args.indexOf("--salida");
const salida = iSalida >= 0 ? args[iSalida + 1] : SALIDA_POR_DEFECTO;
const nombres = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--salida");

let carpetas;
if (args.includes("--todas")) {
  carpetas = readdirSync(SKILLS)
    .map((n) => path.join(SKILLS, n))
    .filter((d) => statSync(d).isDirectory() && esSkill(d));
} else if (nombres.length) {
  carpetas = nombres.map((n) => (n.includes("/") || n.includes("\\") ? n : path.join(SKILLS, n)));
} else {
  morir("Dime qué empaqueto.\n  node tools/empaquetar-skill.mjs <nombre|ruta>…   ·   --todas");
}

mkdirSync(salida, { recursive: true });

// Una skill mal no puede impedir empaquetar las demas: se apunta y se sigue.
const rechazadas = [];

for (const carpeta of carpetas) {
  const nombre = path.basename(carpeta);
  if (!esSkill(carpeta)) {
    rechazadas.push(`${nombre}: no tiene un SKILL.md con frontmatter`);
    continue;
  }

  const skillMd = readFileSync(path.join(carpeta, "SKILL.md"), "utf8");
  const bruto = skillMd.slice(0, skillMd.indexOf("\n---", 4));

  // El nombre del frontmatter y el de la carpeta tienen que coincidir: si no,
  // la skill se sube con una identidad y se busca con otra.
  const declarado = (bruto.match(/^name:\s*(.+)$/m) ?? [])[1];
  if (declarado?.trim() !== nombre) {
    rechazadas.push(`${nombre}: el frontmatter dice name: ${declarado}`);
    continue;
  }

  // claude.ai rechaza el paquete si la descripcion pasa de 1024 caracteres, y lo
  // dice al subir, no antes. Mejor enterarse aqui.
  const desc = (bruto.match(/description:\s*>?-?\s*\n?([\s\S]*?)(?=\n[a-zA-Z_-]+:\s|$)/) ?? [])[1];
  const largo = (desc ?? "").replace(/\s+/g, " ").trim().length;
  if (largo > LIMITE_DESCRIPCION) {
    rechazadas.push(
      `${nombre}: la descripción ocupa ${largo} caracteres, ` +
        `${largo - LIMITE_DESCRIPCION} más de los ${LIMITE_DESCRIPCION} que admite claude.ai`,
    );
    continue;
  }
  if (largo > LIMITE_DESCRIPCION - 60) {
    console.warn(`  ⚠ ${nombre}: descripción a ${LIMITE_DESCRIPCION - largo} caracteres del tope`);
  }

  const lista = ficheros(carpeta).map((rel) => ({
    nombre: `${nombre}/${rel}`,
    datos: readFileSync(path.join(carpeta, rel)),
  }));
  const paquete = crearZip(lista);
  // El mismo fichero con las dos extensiones. Son dos vias de subida distintas y
  // cada una quiere la suya: «Customize > Skills» pide .zip; arrastrarlo al chat
  // y pulsar «Save skill» acepta .skill. El contenido es identico.
  writeFileSync(path.join(salida, `${nombre}.skill`), paquete);
  writeFileSync(path.join(salida, `${nombre}.zip`), paquete);
  console.log(
    `  ${nombre.padEnd(30)} ${String(lista.length).padStart(2)} ficheros  ` +
      `${(paquete.length / 1024).toFixed(1)} KB`,
  );
}

console.log(`\nEn ${salida}, cada uno como .zip y como .skill.`);

if (rechazadas.length) {
  console.error(`\n✖ Sin empaquetar, ${rechazadas.length}:`);
  for (const r of rechazadas) console.error("  " + r);
  console.error("");
  process.exit(1);
}
