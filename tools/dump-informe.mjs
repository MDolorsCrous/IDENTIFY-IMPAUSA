// Vuelca el modelo del informe para un caso, para inspeccionarlo sin montar la app.
//   node tools/dump-informe.mjs
import { readFileSync } from "node:fs";
import { score } from "../src/services/scoring.ts";
import { bands, interpret } from "../src/services/interpretation.ts";
import { buildReport } from "../src/services/report.ts";

const leer = (p) => JSON.parse(readFileSync(new URL("../" + p, import.meta.url), "utf8"));
const config = {
  questions: leer("src/config/questions.json"),
  facets: leer("src/config/facets.json"),
  domains: leer("src/config/domains.json"),
};
const reglas = leer("src/config/interpretation/combinations.json");
const labels = leer("src/i18n/es-informe.json");
const fixture = leer("tests/fixtures/ejemplo-excel.json");

const respuestas = Object.fromEntries(Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]));
const puntuaciones = score(respuestas, config);
const banded = bands(puntuaciones);
const informe = buildReport(puntuaciones, banded, interpret(banded.facets, reglas), config.domains, labels);

for (const d of informe.domains) {
  console.log(`\n${d.label.toUpperCase()}  ${d.score.toFixed(2)}  (${d.band})`);
  for (const f of d.facets) {
    const marca = d.divergentFacet?.id === f.id ? "  <- se separa" : "";
    console.log(`   ${f.label.padEnd(30)} ${f.score.toFixed(2)}  ${f.band}${marca}`);
  }
}
console.log(`\nTitular: alto=${informe.headline.highestDomain} bajo=${informe.headline.lowestDomain} distintivo=${informe.headline.mostDistinctiveFacet}`);
console.log(`Seguridad: clinico=${informe.safety.clinical} delicado=${informe.safety.delicate}`);
console.log(`\nREGLAS DISPARADAS (${informe.fired.length}):`);
for (const m of informe.fired) console.log(`  · ${m.rule.effect}  [${m.rule.id}] ${m.rule.safety ? "(" + m.rule.safety + ")" : ""}`);
console.log(`\nSEÑALES, les falta una condición (${informe.nearMisses.length}):`);
for (const m of informe.nearMisses) {
  const f = m.unmet[0];
  console.log(`  · ${m.rule.effect} — falta ${f.condition.facet} ${f.condition.level}, está ${f.band}`);
}
