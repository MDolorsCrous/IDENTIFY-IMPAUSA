import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { score, type Responses } from "../src/services/scoring.ts";
import { bands, interpret, type Norm, type Rule } from "../src/services/interpretation.ts";
import { buildReport, type Labels } from "../src/services/report.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

const config = {
  questions: leer("src/config/questions.json"),
  facets: leer("src/config/facets.json"),
  domains: leer("src/config/domains.json"),
};
const reglas = leer("src/config/interpretation/combinations.json") as Rule[];
const labels = leer("src/i18n/es-informe.json") as Labels;
const fixture = leer("tests/fixtures/ejemplo-excel.json");

const respuestas = Object.fromEntries(
  Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
) as Responses;

function construir(norms: Record<string, Norm> = {}) {
  const puntuaciones = score(respuestas, config);
  const banded = bands(puntuaciones, norms);
  const interpretacion = interpret(banded.facets, reglas);
  return buildReport(puntuaciones, banded, interpretacion, config.domains, labels, "Persona de ejemplo");
}

test("el informe tiene los 5 dominios con sus 3 facetas", () => {
  const informe = construir();
  assert.equal(informe.domains.length, 5);
  for (const d of informe.domains) {
    assert.equal(d.facets.length, 3, d.id);
    assert.ok(d.label.length > 0);
  }
});

test("los nombres visibles sustituyen a los técnicos donde toca", () => {
  const informe = construir();
  const emocional = informe.domains.find((d) => d.id === "negative_emotionality")!;
  assert.equal(emocional.label, "Sensibilidad emocional");
  assert.equal(emocional.technicalLabel, "Emocionalidad negativa");

  const nombres = emocional.facets.map((f) => f.label);
  assert.deepEqual(nombres, ["Sensibilidad a la preocupación", "Tono anímico", "Reactividad emocional"]);
  // Los nombres que asustan no aparecen como etiqueta visible en ninguna parte
  const visibles = informe.domains.flatMap((d) => [d.label, ...d.facets.map((f) => f.label)]);
  assert.ok(!visibles.includes("Depresión"));
  assert.ok(!visibles.includes("Ansiedad"));
});

test("la leyenda recoge todos los renombrados, y solo esos", () => {
  const informe = construir();
  for (const e of informe.legend) {
    assert.notEqual(e.label, e.technicalLabel, `${e.label} está en la leyenda sin haber cambiado`);
  }
  const etiquetas = informe.legend.map((e) => e.technicalLabel);
  assert.ok(etiquetas.includes("Depresión"));
  assert.ok(etiquetas.includes("Emocionalidad negativa"));
});

test("sin baremo, el aviso dice que se compara con la escala", () => {
  const informe = construir();
  assert.equal(informe.meta.method, "escala");
  assert.match(informe.meta.comparisonNotice, /no respecto a una población/);
});

test("con baremo, el aviso cambia y aparecen los percentiles", () => {
  const norms: Record<string, Norm> = {};
  for (const f of config.facets as { id: string }[]) norms[f.id] = { mean: 3.4, sd: 0.7 };
  for (const d of config.domains as { id: string }[]) norms[d.id] = { mean: 3.4, sd: 0.6 };

  const informe = construir(norms);
  assert.equal(informe.meta.method, "baremo");
  assert.match(informe.meta.comparisonNotice, /percentiles/);
  for (const d of informe.domains) assert.ok(d.percentile !== undefined, d.id);
});

test("detecta la faceta que se separa de las otras dos de su dominio", () => {
  const informe = construir();
  // Responsabilidad: Organización 1,75 · Productividad 3,75 · Sentido del deber 2,50.
  // La que más se aparta de la media de las otras dos es Productividad:
  // |3,75 − 2,125| = 1,625, por encima de |1,75 − 3,125| = 1,375.
  const responsabilidad = informe.domains.find((d) => d.id === "conscientiousness")!;
  assert.equal(responsabilidad.divergentFacet?.id, "productiveness");

  // Sensibilidad emocional: 4,50 / 3,00 / 3,00 → se separa la preocupación
  const emocional = informe.domains.find((d) => d.id === "negative_emotionality")!;
  assert.equal(emocional.divergentFacet?.id, "anxiety");
});

test("no marca divergencia cuando las tres facetas van juntas", () => {
  // Contestar 3 a todo deja las quince facetas en 3,00 exactas
  const todoTres = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [i + 1, 3])) as Responses;
  const puntuaciones = score(todoTres, config);
  const banded = bands(puntuaciones);
  const informe = buildReport(
    puntuaciones,
    banded,
    interpret(banded.facets, reglas),
    config.domains,
    labels,
  );
  for (const d of informe.domains) {
    assert.equal(d.divergentFacet, undefined, `${d.id} marca divergencia con todo igual`);
  }
});

test("el titular señala el dominio más alto, el más bajo y lo más distintivo", () => {
  const informe = construir();
  const puntuaciones = Object.fromEntries(informe.domains.map((d) => [d.id, d.score]));
  const alto = informe.headline.highestDomain;
  const bajo = informe.headline.lowestDomain;
  for (const d of informe.domains) {
    assert.ok(puntuaciones[alto] >= d.score);
    assert.ok(puntuaciones[bajo] <= d.score);
  }
  // La más lejos del centro de la escala es la preocupación: |4,50 − 3| = 1,50,
  // por encima de Organización, |1,75 − 3| = 1,25.
  assert.equal(informe.headline.mostDistinctiveFacet, "anxiety");
});

test("las banderas de seguridad reflejan las reglas que han disparado", () => {
  const informe = construir();
  const clinicas = informe.fired.some((m) => m.rule.safety === "clinico");
  const delicadas = informe.fired.some((m) => m.rule.safety === "delicado");
  assert.equal(informe.safety.clinical, clinicas);
  assert.equal(informe.safety.delicate, delicadas);
});

test("las señales nunca se cuelan entre las reglas disparadas", () => {
  const informe = construir();
  const disparadas = new Set(informe.fired.map((m) => m.rule.id));
  for (const m of informe.nearMisses) {
    assert.ok(!disparadas.has(m.rule.id), `${m.rule.id} está en los dos sitios`);
    assert.equal(m.unmet.length, 1);
  }
});
