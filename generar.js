// Genera el informe a partir de las respuestas de un test.
//
//   node generar.js --clipboard                    lee el JSON del portapapeles
//   node generar.js datos/marta-2026-08-27.json    lo lee de un fichero
//   node generar.js ... --prompt                   copia el encargo para Claude
//   node generar.js ... --prompt --corto           el encargo breve, con la skill cargada
//   node generar.js ... --prosa textos.json        con la redacción ya hecha
//   node generar.js ... --redactar                 se la pide a Claude por API
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
import {
  avisosDeLongitud,
  promptCompleto,
  promptCorto,
  validarProsa,
} from "./src/services/prompt.ts";
import { renderInforme } from "./src/services/render-informe.js";
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
const pedirPrompt = args.includes("--prompt");
// Con la skill identify-bfi2-knowledge cargada, el tono y el metodo ya los sabe:
// el encargo se queda en el perfil y el esquema.
const encargoCorto = args.includes("--corto");
// Pide la redacción a la API en vez de al portapapeles. Necesita
// ANTHROPIC_API_KEY en el entorno y el SDK instalado.
const pedirRedaccion = args.includes("--redactar");
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

// ---- La redacción ----
let prosa = {};
if (ficheroProsa) {
  try {
    prosa = JSON.parse(leerFichero(ficheroProsa));
  } catch (e) {
    morir("El fichero de redacción no es un JSON válido.", e.message);
  }
  const fallos = validarProsa(prosa, modelo);
  if (fallos.length) {
    morir(
      "La redacción no encaja con el esquema, así que no la meto en el informe.",
      fallos.join("\n  "),
    );
  }
}

// Redacción automática por API. El módulo se carga aquí dentro y no arriba a
// propósito: es el único que necesita el SDK instalado, así que sin --redactar
// el comando sigue funcionando en un proyecto sin node_modules.
let costeRedaccion = null;
if (pedirRedaccion && !Object.keys(prosa).length) {
  const { redactar, ErrorDeRedaccion } = await import("./tools/redactar.mjs").catch(() => {
    morir("Falta el SDK de Anthropic.", "Instálalo con:  npm install @anthropic-ai/sdk");
  });
  try {
    const r = await redactar(modelo, recursos.facetas, {
      alEmpezar: () => process.stdout.write("  Redactando con Claude… "),
    });
    prosa = r.prosa;
    costeRedaccion = r;
    console.log("hecho.\n");
  } catch (e) {
    if (e instanceof ErrorDeRedaccion) morir(e.message, e.pista);
    throw e;
  }
}

const avisos = Object.keys(prosa).length ? avisosDeLongitud(prosa, modelo) : [];

const html = renderInforme(modelo, prosa, recursos.labels, {
  facetas: recursos.facetas,
  metaforas: recursos.metaforas,
  fuentes: recursos.fuentes,
  fecha: fechaLarga(fecha),
});

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

// La redacción que ha venido de la API se guarda como si la hubieras pegado a
// mano: así el informe se puede regenerar con --prosa sin volver a pagarla.
let copiaProsa = null;
if (costeRedaccion) {
  copiaProsa = join(RAIZ, "datos", nombre + ".prosa.json");
  writeFileSync(copiaProsa, JSON.stringify(prosa, null, 2) + "\n", "utf8");
}

const salidaHtml = join(RAIZ, `informe-${nombre}.html`);
writeFileSync(salidaHtml, html, "utf8");

// ---- El encargo para Claude ----
// Se escribe siempre: sirve de encargo cuando falta la redacción, y de registro
// de qué se le pidió cuando ya está. Es la trazabilidad que pide docs/04.
const salidaPrompt = join(RAIZ, "datos", nombre + ".prompt.md");
const prompt = (encargoCorto ? promptCorto : promptCompleto)(modelo, recursos.facetas);
writeFileSync(salidaPrompt, prompt, "utf8");

let copiado = false;
if (pedirPrompt) {
  try {
    execFileSync("powershell", ["-NoProfile", "-Command", "$input | Set-Clipboard"], {
      input: prompt,
      encoding: "utf8",
    });
    copiado = true;
  } catch {
    // Si el portapapeles falla, el fichero ya está escrito: no es un error fatal.
  }
}

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
  Redacción: ${
    costeRedaccion
      ? `escrita por ${costeRedaccion.modelo} · ` +
        `${costeRedaccion.uso.input_tokens} tokens de entrada, ${costeRedaccion.uso.output_tokens} de salida · ` +
        `${costeRedaccion.coste.toFixed(3)} $`
      : Object.keys(prosa).length
        ? "incluida"
        : "pendiente, marcada en el informe"
  }${avisos.length ? "\n\n  Se desvía del encargo en:\n    " + avisos.join("\n    ") : ""}

  Copia de las respuestas en ${copiaJson}${
    copiaProsa
      ? `\n  Y la redacción en ${copiaProsa}\n  Para rehacer el informe sin volver a pagarla:  node generar.js ${
          delPortapapeles ? "datos/" + nombre + ".json" : ficheroEntrada
        } --prosa ${copiaProsa.replace(RAIZ, "").replace(/\\/g, "/")}`
      : ""
  }
${
  Object.keys(prosa).length
    ? "  El encargo que se le pasó a Claude queda en " + salidaPrompt
    : pedirPrompt
      ? `
  ── Para la redacción ──────────────────────────────────────────
  ${copiado ? "El encargo está en el portapapeles." : "El encargo está en " + salidaPrompt}
  1. Pégalo en una conversación con Claude${
    encargoCorto ? " que tenga cargada la skill identify-bfi2-knowledge" : ""
  }.
  2. Guarda el JSON que devuelva, por ejemplo en datos/${nombre}.prosa.json
  3. Vuelve a generar:  node generar.js ${delPortapapeles ? "datos/" + nombre + ".json" : ficheroEntrada} --prosa datos/${nombre}.prosa.json
`
      : "  Para la redacción, vuelve a lanzarlo con --prompt"
}`);
