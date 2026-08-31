// Genera el informe a partir de las respuestas de un test.
//
//   node generar.js --clipboard                    lee el JSON del portapapeles
//   node generar.js datos/marta-2026-08-27.json    lo lee de un fichero
//   node generar.js ... --prosa textos.json        con la capa de redacción
//
// Sin --prosa, el informe sale con todo lo que calcula el código y los pasajes
// redactados marcados como pendientes. Es deliberado: mejor un informe honesto
// al que le falta la redacción que uno que no se puede generar.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { construirModelo } from "./src/services/pipeline.ts";
import { ScoringError } from "./src/services/scoring.ts";
import { renderInforme } from "./tools/render-informe.mjs";
import { cargarRecursos } from "./tools/recursos.mjs";

const RAIZ = fileURLToPath(new URL(".", import.meta.url));

function morir(mensaje, detalle) {
  console.error("\n✖ " + mensaje);
  if (detalle) console.error("  " + detalle);
  console.error("");
  process.exit(1);
}

// ---- Argumentos ----
const args = process.argv.slice(2);
const delPortapapeles = args.includes("--clipboard");
const iProsa = args.indexOf("--prosa");
const ficheroProsa = iProsa >= 0 ? args[iProsa + 1] : null;
const ficheroEntrada = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--prosa");

if (!delPortapapeles && !ficheroEntrada) {
  morir(
    "Dime de dónde saco las respuestas.",
    "node generar.js --clipboard   ·   node generar.js datos/fichero.json",
  );
}

// ---- Leer las respuestas ----
function leerPortapapeles() {
  try {
    return execFileSync("powershell", ["-NoProfile", "-Command", "Get-Clipboard -Raw"], {
      encoding: "utf8",
      maxBuffer: 1 << 24,
    });
  } catch {
    morir("No he podido leer el portapapeles.", "Guarda el resultado en un fichero y pásamelo por ruta.");
  }
}

function leerFichero(ruta) {
  try {
    return readFileSync(ruta, "utf8");
  } catch (e) {
    morir(
      e.code === "ENOENT" ? `No existe el fichero «${ruta}».` : `No he podido leer «${ruta}».`,
      e.code === "ENOENT" ? "Comprueba la ruta, o usa --clipboard." : e.message,
    );
  }
}

const bruto = delPortapapeles ? leerPortapapeles() : leerFichero(ficheroEntrada);

let entrada;
try {
  entrada = JSON.parse(bruto);
} catch (e) {
  morir(
    "Eso no es un JSON válido.",
    delPortapapeles
      ? "Copia otra vez desde el botón «Copiar para el informe» de la pantalla de resultados."
      : e.message,
  );
}

if (!entrada || typeof entrada.respuestas !== "object") {
  morir("Al JSON le falta el bloque «respuestas».", "Debe tener la forma { test, fecha, persona, respuestas }.");
}
if (entrada.test && entrada.test !== "identify-bfi2") {
  morir(`Este resultado es de otro test: «${entrada.test}».`, "Este comando solo genera informes de Identify.");
}

const respuestas = Object.fromEntries(
  Object.entries(entrada.respuestas).map(([k, v]) => [Number(k), Number(v)]),
);

// ---- Construir ----
const recursos = cargarRecursos();
const persona = (entrada.persona || "").trim();
const fecha = entrada.fecha || new Date().toISOString().slice(0, 10);

let modelo;
try {
  modelo = construirModelo(respuestas, recursos, { persona: persona || undefined });
} catch (e) {
  if (e instanceof ScoringError) {
    const explicacion = {
      missing_responses: "El test está incompleto: no se puede puntuar a medias.",
      invalid_response: "Hay respuestas fuera de la escala de 1 a 5.",
      unknown_item: "Llegan ítems que no existen en el test.",
    }[e.code];
    morir(explicacion ?? "Las respuestas no son válidas.", e.message);
  }
  throw e;
}

const prosa = ficheroProsa ? JSON.parse(leerFichero(ficheroProsa)) : {};

const html = renderInforme(modelo, prosa, recursos.labels, { fecha: fechaLarga(fecha) });

// ---- Guardar ----
const slug = (s) =>
  (s || "sin-nombre")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // los acentos, ya separados por NFD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "sin-nombre";

const nombre = `${slug(persona)}-${fecha}`;

mkdirSync(join(RAIZ, "datos"), { recursive: true });
const copiaJson = join(RAIZ, "datos", nombre + ".json");
writeFileSync(copiaJson, JSON.stringify({ ...entrada, fecha, persona }, null, 2) + "\n", "utf8");

const salidaHtml = join(RAIZ, `informe-${nombre}.html`);
writeFileSync(salidaHtml, html, "utf8");

function fechaLarga(iso) {
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const [a, m, d] = iso.split("-").map(Number);
  return Number.isFinite(d) ? `${d} de ${meses[m - 1]} de ${a}` : iso;
}

console.log(`
✔ Informe generado
  ${salidaHtml}

  Persona:   ${persona || "(sin nombre)"}
  Bandas:    ${modelo.meta.method === "baremo" ? "percentiles" : "posición en la escala, aún sin baremos"}
  Reglas:    ${modelo.fired.length} disparadas · ${modelo.nearMisses.length} señales
  Redacción: ${Object.keys(prosa).length ? "incluida" : "pendiente, marcada en el informe"}

  Copia de las respuestas en ${copiaJson}
`);
