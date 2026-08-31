/**
 * El viaje completo: respuestas → modelo de informe.
 *
 * Es la prueba que cierra el círculo. Si la tubería se desviara del motor, los
 * números del informe dejarían de ser los del Excel oficial y esto se pondría rojo.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { construirModelo, type Recursos } from "../src/services/pipeline.ts";
import { AMPLIO, type Norm } from "../src/services/interpretation.ts";
import { ScoringError, type Responses } from "../src/services/scoring.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

const recursos: Recursos = {
  config: {
    questions: leer("src/config/questions.json"),
    facets: leer("src/config/facets.json"),
    domains: leer("src/config/domains.json"),
  },
  labels: leer("src/i18n/es-informe.json"),
  rules: leer("src/config/interpretation/combinations.json"),
};

const fixture = leer("tests/fixtures/ejemplo-excel.json");
const respuestas = Object.fromEntries(
  Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
) as Responses;

test("las respuestas del Excel dan el informe con los valores del Excel", () => {
  const modelo = construirModelo(respuestas, recursos);

  for (const dominio of modelo.domains) {
    assert.ok(
      Math.abs(dominio.score - fixture.domainsEsperado[dominio.id]) < 1e-9,
      `dominio ${dominio.id}: ${dominio.score} en vez de ${fixture.domainsEsperado[dominio.id]}`,
    );
    for (const faceta of dominio.facets) {
      assert.ok(
        Math.abs(faceta.score - fixture.facetsEsperado[faceta.id]) < 1e-9,
        `faceta ${faceta.id}: ${faceta.score} en vez de ${fixture.facetsEsperado[faceta.id]}`,
      );
    }
  }

  // Las quince facetas están, ninguna se ha quedado por el camino
  const facetas = modelo.domains.flatMap((d) => d.facets.map((f) => f.id));
  assert.equal(facetas.length, 15);
  assert.equal(new Set(facetas).size, 15);
});

test("el nombre de la persona llega a la portada", () => {
  const modelo = construirModelo(respuestas, recursos, { persona: "Marta" });
  assert.equal(modelo.meta.generatedFor, "Marta");
  assert.equal(construirModelo(respuestas, recursos).meta.generatedFor, undefined);
});

test("sin baremos avisa de que compara con la escala", () => {
  const modelo = construirModelo(respuestas, recursos);
  assert.equal(modelo.meta.method, "escala");
  assert.match(modelo.meta.comparisonNotice, /no respecto a una población/);
});

test("con baremos pasa a percentiles sin tocar nada más", () => {
  const norms: Record<string, Norm> = {};
  for (const f of recursos.config.facets) norms[f.id] = { mean: 3.4, sd: 0.7 };
  for (const d of recursos.config.domains) norms[d.id] = { mean: 3.4, sd: 0.6 };

  const modelo = construirModelo(respuestas, recursos, { norms });
  assert.equal(modelo.meta.method, "baremo");
  for (const d of modelo.domains) assert.ok(d.percentile !== undefined, d.id);
});

test("la calibración se puede cambiar desde fuera", () => {
  const estricto = construirModelo(respuestas, recursos);
  const amplio = construirModelo(respuestas, recursos, { strictness: AMPLIO });
  const total = (m: typeof estricto) => m.fired.length + m.nearMisses.length;
  assert.ok(total(amplio) > total(estricto));
});

test("un test incompleto no llega a producir informe", () => {
  const incompleto = { ...respuestas };
  delete (incompleto as Record<number, unknown>)[13];
  assert.throws(
    () => construirModelo(incompleto, recursos),
    (e: ScoringError) => e.code === "missing_responses" && e.items.join() === "13",
  );
});
