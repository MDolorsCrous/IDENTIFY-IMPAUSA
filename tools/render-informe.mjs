// Genera la maqueta del informe con el caso de ejemplo del Excel.
//
//   node tools/render-informe.mjs salida.html
//
// El renderizador vive en src/services/render-informe.js, que no sabe nada de
// Node: aqui solo esta lo que hace falta para escribirlo en disco.
import { writeFileSync } from "node:fs";
import { construirModelo } from "../src/services/pipeline.ts";
import { renderInforme } from "../src/services/render-informe.js";
import { cargarRecursos, cargarEjemplo, leer } from "./recursos.mjs";

// Ejecutado directamente, genera la maqueta con el caso de ejemplo del Excel.
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  const recursos = cargarRecursos();
  const fixture = cargarEjemplo();
  const prosa = leer("tests/fixtures/prosa-ejemplo.json");
  const respuestas = Object.fromEntries(Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]));
  const modelo = construirModelo(respuestas, recursos);
  const html = renderInforme(modelo, prosa, recursos.labels, {
    facetas: recursos.facetas,
    metaforas: recursos.metaforas,
    fuentes: recursos.fuentes,
    fecha: "27 de agosto de 2026",
    aviso: "Maqueta · datos del caso de ejemplo del Excel oficial · los textos redactados son de muestra",
  });

  const salida = process.argv[2] ?? "informe-ejemplo.html";
  writeFileSync(new URL("../" + salida, import.meta.url), html, "utf8");
  console.log(
    `escrito ${salida}\n` +
      `  ${modelo.domains.length} dominios · ${modelo.fired.length} reglas disparadas · ` +
      `${modelo.nearMisses.length} señales · leyenda: ${modelo.legend.length} entradas`,
  );
}

