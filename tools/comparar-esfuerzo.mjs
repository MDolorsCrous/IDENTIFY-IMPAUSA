// Genera el mismo perfil a los tres niveles de esfuerzo y los pone al lado.
//
//   node tools/comparar-esfuerzo.mjs datos/fichero.json
//
// Existe porque `output_config.effort` es la perilla que mas manda en lo que
// cuesta y tarda un informe —en una medicion real, la mitad de los tokens de
// salida eran razonamiento, no texto— y esa decision no se toma estimando.
// Se genera, se lee y se decide.
//
// Cuesta unos 0,45 $ en total. Deja un HTML con los tres textos enfrentados.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { construirModelo } from "../src/services/pipeline.ts";
import { pasosDelPlan } from "../src/services/prompt.ts";
import { cargarRecursos } from "./recursos.mjs";
import { claveDeApi, NOMBRES } from "./clave-api.mjs";
import { pedirRedaccion } from "./pedir-redaccion.mjs";

const NIVELES = ["low", "medium", "high"];
const RAIZ = fileURLToPath(new URL("../", import.meta.url));

const fichero = process.argv[2];
if (!fichero) {
  console.error("\n✖ Dime de qué perfil.\n  node tools/comparar-esfuerzo.mjs datos/fichero.json\n");
  process.exit(1);
}
if (!claveDeApi()) {
  console.error(`\n✖ No hay clave de API. Ponla en ${NOMBRES[0]}.\n`);
  process.exit(1);
}

const recursos = cargarRecursos();
const entrada = JSON.parse(readFileSync(fichero, "utf8"));
const respuestas = Object.fromEntries(
  Object.entries(entrada.respuestas).map(([k, v]) => [Number(k), Number(v)]),
);
const modelo = construirModelo(respuestas, recursos, { persona: entrada.persona || undefined });

const esc = (s) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
const palabras = (t) => String(t).trim().split(/\s+/).length;

/** Todo lo que Claude ha escrito, junto, para poder contarlo. */
function textoEntero(p) {
  return [
    p.titular,
    p.perfilEnUnaFrase,
    ...Object.values(p.dominios),
    p.senales,
    p.enElTrabajo,
    ...p.preguntas,
    ...pasosDelPlan(p.planAccion).map((x) => `${x.titulo} ${x.texto} ${x.indicador}`),
    p.conclusion,
  ].join(" ");
}

const resultados = [];
for (const nivel of NIVELES) {
  process.stdout.write(`  esfuerzo ${nivel.padEnd(6)} … `);
  try {
    const r = await pedirRedaccion(modelo, recursos.facetas, () => {}, nivel);
    const texto = textoEntero(r.prosa);
    // Los tokens de texto se estiman por caracteres; el resto de la salida es
    // razonamiento. Es la resta que explica por que un informe tarda lo que tarda.
    const tokensTexto = Math.round(texto.length / 3.6);
    resultados.push({
      nivel,
      prosa: r.prosa,
      segundos: r.segundos,
      coste: r.coste,
      entrada: r.uso.input_tokens,
      salida: r.uso.output_tokens,
      tokensTexto,
      razonamiento: Math.max(0, r.uso.output_tokens - tokensTexto),
      palabras: palabras(texto),
    });
    console.log(`${r.segundos.toFixed(0)} s · ${r.uso.output_tokens} tokens · ${r.coste.toFixed(3)} $`);
  } catch (e) {
    console.log(`falló: ${e.message}`);
    resultados.push({ nivel, error: e.message });
  }
}

const buenos = resultados.filter((r) => !r.error);
if (!buenos.length) {
  console.error("\n✖ No ha salido ninguna. Nada que comparar.\n");
  process.exit(1);
}

// Las secciones que mas se notan al leer. Las demas quedan en el JSON completo.
const SECCIONES = [
  ["titular", (p) => p.titular],
  ["perfilEnUnaFrase", (p) => p.perfilEnUnaFrase],
  ["dominio · emocionalidad negativa", (p) => p.dominios.negative_emotionality],
  ["enElTrabajo", (p) => p.enElTrabajo],
  ["planAccion · paso 1", (p) => { const x = pasosDelPlan(p.planAccion)[0]; return `${x.titulo}. ${x.texto} — ${x.indicador}`; }],
  ["conclusion", (p) => p.conclusion],
];

const html = `<title>Esfuerzo: low · medium · high</title>
<style>
 body{font:16px/1.6 system-ui,sans-serif;margin:0;background:#F7F2EB;color:#1F2A25}
 .hoja{max-width:70rem;margin:0 auto;padding:2rem 1.5rem 4rem}
 h1{font-size:1.8rem;margin:0 0 .3rem} .sub{color:#5E6B64;margin:0 0 2rem}
 table.n{border-collapse:collapse;margin-bottom:2.5rem;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07)}
 table.n th,table.n td{border:1px solid #E0D9D0;padding:.5rem .9rem;text-align:right}
 table.n th:first-child,table.n td:first-child{text-align:left}
 table.n thead th{background:#1A4A3A;color:#F7F2EB;border-color:#1A4A3A}
 h2{font-size:1.05rem;margin:2rem 0 .6rem;color:#1A4A3A}
 .fila{display:grid;grid-template-columns:repeat(${buenos.length},1fr);gap:1rem}
 .col{background:#fff;border:1px solid #E0D9D0;border-radius:6px;padding:.9rem 1rem;font-size:.93rem}
 .col b{display:block;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#2D6B57;margin-bottom:.5rem}
</style>
<div class="hoja">
<h1>El mismo perfil, tres esfuerzos</h1>
<p class="sub">${esc(entrada.persona || "sin nombre")} · generado el ${new Date().toLocaleString("es-ES")}</p>

<table class="n"><thead><tr>
  <th>esfuerzo</th><th>segundos</th><th>tokens salida</th><th>de eso, texto</th>
  <th>razonamiento</th><th>palabras</th><th>coste $</th>
</tr></thead><tbody>
${buenos
  .map(
    (r) => `<tr><td><b>${r.nivel}</b></td><td>${r.segundos.toFixed(0)}</td><td>${r.salida}</td>
    <td>${r.tokensTexto}</td><td>${r.razonamiento}</td><td>${r.palabras}</td><td>${r.coste.toFixed(3)}</td></tr>`,
  )
  .join("\n")}
</tbody></table>

${SECCIONES.map(
  ([nombre, saca]) => `<h2>${esc(nombre)}</h2>
<div class="fila">${buenos
    .map((r) => `<div class="col"><b>${r.nivel}</b>${esc(saca(r.prosa))}</div>`)
    .join("")}</div>`,
).join("\n")}
</div>`;

const salida = RAIZ + "comparacion-esfuerzo.html";
writeFileSync(salida, html, "utf8");
for (const r of buenos) {
  writeFileSync(RAIZ + `datos/comparacion-${r.nivel}.prosa.json`, JSON.stringify(r.prosa, null, 2) + "\n", "utf8");
}

console.log(`\n✔ ${salida}`);
console.log("  Y cada redacción entera en datos/comparacion-<nivel>.prosa.json\n");
