/**
 * La prueba que importa: el motor tiene que reproducir exactamente los números
 * que el Excel oficial ya traía calculados con su juego de respuestas de ejemplo.
 *
 *   node --test tests/
 *
 * Node 24 ejecuta TypeScript directamente, así que no hace falta compilar nada.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { score, validate, round2, ScoringError, type Responses } from "../src/services/scoring.ts";
import { recode } from "../src/services/reverseScoring.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

const config = {
  questions: leer("src/config/questions.json"),
  facets: leer("src/config/facets.json"),
  domains: leer("src/config/domains.json"),
};
const fixture = leer("tests/fixtures/ejemplo-excel.json");
const respuestas = Object.fromEntries(
  Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
) as Responses;

test("la configuración tiene la forma del BFI-2", () => {
  assert.equal(config.questions.length, 60);
  assert.equal(config.facets.length, 15);
  assert.equal(config.domains.length, 5);
  assert.equal(config.questions.filter((q: { reverse: boolean }) => q.reverse).length, 30);
  for (const facet of config.facets) assert.equal(facet.items.length, 4, `faceta ${facet.id}`);
  for (const domain of config.domains) assert.equal(domain.items.length, 12, `dominio ${domain.id}`);
});

test("cada ítem pertenece exactamente a una faceta y a un dominio", () => {
  const enFacetas = config.facets.flatMap((f: { items: number[] }) => f.items).sort((a, b) => a - b);
  const enDominios = config.domains.flatMap((d: { items: number[] }) => d.items).sort((a, b) => a - b);
  const todos = Array.from({ length: 60 }, (_, i) => i + 1);
  assert.deepEqual(enFacetas, todos);
  assert.deepEqual(enDominios, todos);
});

test("la recodificación inversa es 6 − respuesta", () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((r) => recode(r as 1, true)), [5, 4, 3, 2, 1]);
  assert.deepEqual([1, 2, 3, 4, 5].map((r) => recode(r as 1, false)), [1, 2, 3, 4, 5]);
});

test("recodifica los 60 ítems igual que el Excel", () => {
  const { recoded } = score(respuestas, config);
  for (let id = 1; id <= 60; id++) {
    assert.equal(recoded[id], fixture.recodedEsperado[id], `ítem ${id}`);
  }
});

test("reproduce las 15 facetas del Excel", () => {
  const { facets } = score(respuestas, config);
  for (const [id, esperado] of Object.entries(fixture.facetsEsperado)) {
    assert.equal(facets[id], esperado, `faceta ${id}`);
  }
});

test("reproduce los 5 dominios del Excel", () => {
  const { domains } = score(respuestas, config);
  for (const [id, esperado] of Object.entries(fixture.domainsEsperado)) {
    assert.equal(domains[id], esperado, `dominio ${id}`);
  }
});

test("el dominio da lo mismo como media de ítems que como media de facetas", () => {
  const { facets, domains } = score(respuestas, config);
  for (const domain of config.domains) {
    const porFacetas =
      domain.facets.reduce((a: number, f: string) => a + facets[f], 0) / domain.facets.length;
    assert.ok(Math.abs(porFacetas - domains[domain.id]) < 1e-12, `dominio ${domain.id}`);
  }
});

test("todas las puntuaciones caen dentro de 1–5", () => {
  const { facets, domains } = score(respuestas, config);
  for (const v of [...Object.values(facets), ...Object.values(domains)]) {
    assert.ok(v >= 1 && v <= 5, `fuera de rango: ${v}`);
  }
});

test("los extremos dan 1 y 5", () => {
  const reverse = new Set(config.questions.filter((q: { reverse: boolean }) => q.reverse).map((q: { id: number }) => q.id));
  const todoMinimo = Object.fromEntries(
    Array.from({ length: 60 }, (_, i) => [i + 1, reverse.has(i + 1) ? 5 : 1]),
  ) as Responses;
  const todoMaximo = Object.fromEntries(
    Array.from({ length: 60 }, (_, i) => [i + 1, reverse.has(i + 1) ? 1 : 5]),
  ) as Responses;
  for (const v of Object.values(score(todoMinimo, config).domains)) assert.equal(v, 1);
  for (const v of Object.values(score(todoMaximo, config).domains)) assert.equal(v, 5);
});

test("un test incompleto falla en vez de puntuar a medias", () => {
  const incompleto = { ...respuestas };
  delete (incompleto as Record<number, unknown>)[7];
  delete (incompleto as Record<number, unknown>)[42];
  assert.throws(
    () => validate(incompleto, config),
    (e: ScoringError) => e.code === "missing_responses" && e.items.join() === "7,42",
  );
});

test("una respuesta fuera de la escala falla", () => {
  const malo = { ...respuestas, 3: 0 } as unknown as Responses;
  assert.throws(() => validate(malo, config), (e: ScoringError) => e.code === "invalid_response");
});

test("un ítem que no existe falla", () => {
  const malo = { ...respuestas, 61: 3 } as unknown as Responses;
  assert.throws(() => validate(malo, config), (e: ScoringError) => e.code === "unknown_item");
});

test("round2 solo redondea para mostrar", () => {
  assert.equal(round2(3.1666666666666665), 3.17);
  assert.equal(round2(2.6666666666666665), 2.67);
  assert.equal(round2(2.75), 2.75);
});
