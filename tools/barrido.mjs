// ¿Es responsive toda la aplicacion? Se mide, no se mira.
//
//   node tools/barrido.mjs            todas las pantallas a todos los anchos
//   node tools/barrido.mjs --fotos    y ademas una foto de cada combinacion
//
// Por cada pantalla y cada ancho se mira:
//   · desborde horizontal del documento (scrollWidth > clientWidth)
//   · elementos que se salen por la derecha del viewport
//   · objetivos tactiles (botones, enlaces, campos) de menos de 44 px
//   · texto visible de menos de 12 px
// Solo se fotografia lo que falla, para que la carpeta diga algo.
//
// El informe se mide dos veces: dentro de la aplicacion (en su iframe) y
// suelto, como fichero, que es como se guarda y se manda. Dentro de un iframe
// el documento se maqueta al ancho del marco y un fallo de viewport no se ve.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { capturar } from "./captura.mjs";
import { construirModelo } from "../src/services/pipeline.ts";
import { renderInforme } from "../src/services/render-informe.js";
import { cargarRecursos, cargarEjemplo, leer } from "./recursos.mjs";

const RAIZ = fileURLToPath(new URL("../", import.meta.url));
const SALIDA = RAIZ + "salidas/barrido/";
mkdirSync(SALIDA, { recursive: true });
const FOTOS = process.argv.includes("--fotos");

const ANCHOS = [320, 360, 390, 414, 768, 1024, 1280, 1440];
const PAGINA = "file:///" + RAIZ.replace(/\\/g, "/") + "test-identify.html";

/** Lo que se mide en un documento. Se ejecuta DENTRO de la pagina. */
const MEDIR = `
  function medir(doc, win) {
    const vw = win.innerWidth;
    const visible = (el) => { const r = el.getBoundingClientRect(); const s = win.getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    const nombre = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
      (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\\s+/).join(".") : "");
    const desborde = doc.documentElement.scrollWidth - doc.documentElement.clientWidth;
    const fuera = [], tactilMal = [], tactil = [], letra = [], letraRotulo = [];
    for (const el of doc.querySelectorAll("body *")) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 && r.width > 2) fuera.push(nombre(el) + " " + Math.round(r.right - vw) + "px fuera");
      if (el.matches("button, a[href], input, select, textarea, [role=radio]") && (r.height < 44 || r.width < 44)) {
        // Menos de 24 px es un fallo (WCAG 2.2 lo exige); entre 24 y 43, un aviso:
        // se puede tocar, pero no con holgura.
        const lado = Math.min(r.width, r.height);
        (lado < 24 ? tactilMal : tactil).push(nombre(el) + " " + Math.round(r.width) + "x" + Math.round(r.height) + " «" + (el.textContent || el.value || "").trim().slice(0, 30) + "»");
      }
      const tieneTexto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (tieneTexto) {
        const s = win.getComputedStyle(el); const fs = parseFloat(s.fontSize);
        // Un rotulo en mayusculas con tracking es una convencion a 10-11 px;
        // texto corriente por debajo de 12 no lo es.
        if (fs < 12) (s.textTransform === "uppercase" ? letraRotulo : letra).push(nombre(el) + " " + fs.toFixed(1) + "px");
      }
    }
    const u = (a) => [...new Set(a)].slice(0, 8);
    return { desborde, fuera: u(fuera), tactilMal: u(tactilMal), tactil: u(tactil), letra: u(letra), letraRotulo: u(letraRotulo) };
  }
`;

const prosa = leer("tests/fixtures/prosa-ejemplo.json");
const respuestasEjemplo = JSON.stringify(cargarEjemplo().responses);

/** Cada pantalla: como se llega a ella desde la pagina ya cargada. */
const PANTALLAS = {
  "portada arriba": `pantalla = "portada"; pintar(); window.scrollTo(0, 0);`,
  "portada final": `pantalla = "portada"; pintar(); window.scrollTo(0, document.body.scrollHeight);`,
  "test pregunta 1": `for (const k in respuestas) delete respuestas[k]; indice = 0; pantalla = "test"; pintar();`,
  "test pregunta 60 contestada": `for (const k in respuestas) delete respuestas[k]; CFG.questions.forEach((q) => { respuestas[q.id] = 3; }); indice = 59; pantalla = "test"; pintar();`,
  "puntuaciones": `for (const k in respuestas) delete respuestas[k]; Object.assign(respuestas, ${respuestasEjemplo}); pantalla = "resultados"; pintar();`,
  "puntuaciones final": `for (const k in respuestas) delete respuestas[k]; Object.assign(respuestas, ${respuestasEjemplo}); pantalla = "resultados"; pintar(); window.scrollTo(0, document.body.scrollHeight);`,
  "informe en la app": `for (const k in respuestas) delete respuestas[k]; Object.assign(respuestas, ${respuestasEjemplo}); prosa = ${JSON.stringify(prosa)}; informeGuardado = "11111111-2222-3333-4444-555555555555"; pantalla = "informe"; pintar();`,
};

// El informe suelto, con toda la prosa, como fichero.
const recursos = cargarRecursos();
const modelo = construirModelo(
  Object.fromEntries(Object.entries(cargarEjemplo().responses).map(([k, v]) => [Number(k), v])),
  recursos, { persona: "Marta" },
);
const informeHtml = renderInforme(modelo, prosa, recursos.labels, {
  facetas: recursos.facetas, textos: recursos.textos.informe, metaforas: recursos.metaforas,
  fuentes: recursos.fuentes, marca: recursos.marca, fecha: "20 de octubre de 2026",
});
writeFileSync(SALIDA + "informe-suelto.html", informeHtml, "utf8");
const INFORME = "file:///" + SALIDA.replace(/\\/g, "/") + "informe-suelto.html";

const fallos = [];
const filas = [];
const apodo = (s) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

async function una(nombre, url, preparar, ancho, extra = {}) {
  const guion = `(async () => { ${MEDIR} ${preparar} await new Promise((r) => setTimeout(r, 350));
    const propio = medir(document, window);
    const marco = document.getElementById("marco");
    const dentro = marco && marco.contentDocument && marco.contentDocument.body ? medir(marco.contentDocument, marco.contentWindow) : null;
    return { propio, dentro }; })()`;
  const foto = FOTOS ? SALIDA + apodo(nombre) + "-" + ancho + ".png" : "";
  const { valor } = await capturar(url, foto, { ancho, alto: 900, espera: 2500, guion, ...extra });
  for (const [donde, m] of [["", valor.propio], [" (dentro del iframe)", valor.dentro]]) {
    if (!m) continue;
    // Fallos: lo que hace que la pantalla NO sea responsive, o no se pueda tocar.
    const problemas = [];
    if (m.desborde > 0) problemas.push("desborde " + m.desborde + "px");
    if (m.fuera.length) problemas.push("se salen: " + m.fuera.join(" | "));
    // En papel no hay nada que tocar y la letra pequena es la de cualquier
    // documento impreso: al imprimir solo cuenta que nada se salga de la hoja.
    const papel = extra.medio === "print";
    if (!papel && m.tactilMal.length) problemas.push("tactil<24: " + m.tactilMal.join(" | "));
    if (!papel && m.letra.length) problemas.push("letra<12: " + m.letra.join(" | "));
    // Avisos: se puede mejorar, pero no esta roto.
    const avisos = [];
    if (m.tactil.length) avisos.push("tactil 24-43: " + m.tactil.join(" | "));
    if (m.letraRotulo.length) avisos.push("rotulo<12: " + m.letraRotulo.join(" | "));
    filas.push({ pantalla: nombre + donde, ancho, ok: !problemas.length, problemas, avisos });
    if (problemas.length) {
      fallos.push(`${nombre}${donde} @${ancho}: ${problemas.join(" · ")}`);
      if (!FOTOS) await capturar(url, SALIDA + "FALLO-" + apodo(nombre) + "-" + ancho + ".png", { ancho, alto: 900, espera: 2500, guion: `(async () => { ${preparar} })()`, ...extra });
    }
  }
}

for (const ancho of ANCHOS) {
  for (const [nombre, preparar] of Object.entries(PANTALLAS)) await una(nombre, PAGINA, preparar, ancho);
  await una("informe suelto", INFORME, "", ancho);
}
// El informe suelto tambien en oscuro y al imprimir, a un ancho representativo.
await una("informe suelto, oscuro", INFORME, "", 390, { oscuro: true });
await una("informe suelto, impresion", INFORME, "", 794, { medio: "print" });
await una("portada arriba, oscuro", PAGINA, PANTALLAS["portada arriba"], 390, { oscuro: true });

// El resumen: una linea por pantalla con los anchos en los que falla.
console.log("\nBARRIDO · " + ANCHOS.length + " anchos × " + (Object.keys(PANTALLAS).length + 1) + " pantallas\n");
const porPantalla = new Map();
for (const f of filas) (porPantalla.get(f.pantalla) ?? porPantalla.set(f.pantalla, []).get(f.pantalla)).push(f);
for (const [p, fs] of porPantalla) {
  const malos = fs.filter((f) => !f.ok).map((f) => f.ancho);
  console.log((malos.length ? "✖ " : "✔ ") + p.padEnd(42) + (malos.length ? "falla a " + malos.join(", ") : "bien a todos los anchos"));
}
if (fallos.length) {
  console.log("\nQUE FALLA\n" + fallos.map((f) => "  · " + f).join("\n"));
  console.log("\nfotos de los fallos en salidas/barrido/");
}
// Los avisos, agrupados por elemento: en cuantas mediciones sale cada uno.
const cuenta = new Map();
for (const f of filas) for (const a of f.avisos) {
  const [tipo, resto] = a.split(": ");
  for (const e of resto.split(" | ")) { const k = tipo + " · " + e.replace(/\d+x\d+/, "WxH"); cuenta.set(k, (cuenta.get(k) ?? 0) + 1); }
}
if (cuenta.size) {
  console.log("\nAVISOS (no rompen nada; en cuantas de las " + filas.length + " mediciones salen)");
  for (const [k, v] of [...cuenta].sort((a, b) => b[1] - a[1])) console.log("  " + String(v).padStart(3) + "  " + k);
}
writeFileSync(SALIDA + "barrido.json", JSON.stringify(filas, null, 2), "utf8");
console.log("\ndetalle en salidas/barrido/barrido.json");
