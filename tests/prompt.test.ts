import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { construirModelo, type Recursos } from "../src/services/pipeline.ts";
import {
  INSTRUCCIONES,
  esquemaSalida,
  materialParaRedactar,
  promptCompleto,
  validarProsa,
  type FichaFaceta,
} from "../src/services/prompt.ts";
import type { Responses } from "../src/services/scoring.ts";

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
const facetas = leer("src/config/interpretation/facetas.json") as Record<string, FichaFaceta>;
const fixture = leer("tests/fixtures/ejemplo-excel.json");
const prosa = leer("tests/fixtures/prosa-ejemplo.json");

const respuestas = Object.fromEntries(
  Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
) as Responses;
const modelo = construirModelo(respuestas, recursos, { persona: "Persona de ejemplo" });

test("Claude nunca ve las respuestas al cuestionario", () => {
  // La regla de oro de la arquitectura: el modelo recibe el perfil ya
  // interpretado, no los datos crudos. Si esto se rompe, podría reinterpretar
  // el test por su cuenta y el informe dejaría de ser reproducible.
  const material = JSON.stringify(materialParaRedactar(modelo, facetas));
  assert.ok(!material.includes('"respuestas"'), "el material lleva las respuestas");
  assert.ok(!material.includes('"recoded"'), "el material lleva las respuestas recodificadas");

  // Y una comprobación por contenido: la secuencia de las 60 respuestas no aparece
  const secuencia = Object.values(fixture.responses).join(",");
  assert.ok(!material.includes(secuencia));
});

test("el material lleva lo que hace falta para redactar", () => {
  const m = materialParaRedactar(modelo, facetas) as any;
  assert.equal(m.dominios.length, 5);
  for (const d of m.dominios) {
    assert.equal(d.facetas.length, 3);
    for (const f of d.facetas) {
      assert.ok(f.queSignificaEsteNivel?.length > 50, `${f.id} sin la lectura de su nivel`);
      assert.ok(f.definicion?.length > 10, `${f.id} sin definición`);
      assert.equal(typeof f.cercaDelPuntoMedio, "boolean");
    }
  }
  assert.ok(Array.isArray(m.senales));
  assert.ok(m.comparacion.length > 20);
});

test("las puntuaciones van redondeadas, sin cola decimal", () => {
  const material = JSON.stringify(materialParaRedactar(modelo, facetas));
  assert.ok(!material.includes("3.1666666666666665"));
  assert.ok(material.includes('"puntuacion":3.17'));
});

test("las instrucciones llevan las reglas que no se pueden perder", () => {
  for (const regla of ["No diagnosticas", "Matiza", "condicional", "No inventas referencias"]) {
    assert.ok(INSTRUCCIONES.includes(regla), `las instrucciones no dicen «${regla}»`);
  }
});

test("el esquema exige un texto por cada dominio", () => {
  const e = esquemaSalida(modelo) as any;
  assert.deepEqual(
    e.properties.dominios.required.sort(),
    modelo.domains.map((d) => d.id).sort(),
  );
  assert.equal(e.additionalProperties, false);
  assert.equal(e.properties.planAccion.minItems, 3);
  assert.equal(e.properties.planAccion.maxItems, 3);
});

test("el encargo lleva instrucciones, esquema y perfil", () => {
  const p = promptCompleto(modelo, facetas);
  assert.ok(p.includes("## Esquema de la respuesta"));
  assert.ok(p.includes("## El perfil"));
  assert.ok(p.includes("No diagnosticas"));
  assert.ok(p.length > 5000, "el encargo parece incompleto");
});

test("una redacción completa pasa la validación", () => {
  assert.deepEqual(validarProsa(prosa, modelo), []);
});

test("una redacción a la que le falta algo se rechaza, y dice qué", () => {
  const mala = structuredClone(prosa);
  delete mala.conclusion;
  delete mala.dominios.extraversion;
  mala.preguntas = mala.preguntas.slice(0, 2);
  mala.planAccion = mala.planAccion.slice(0, 2);

  const fallos = validarProsa(mala, modelo);
  assert.equal(fallos.length, 4);
  assert.ok(fallos.some((f) => f.includes("conclusion")));
  assert.ok(fallos.some((f) => f.includes("extraversion")));
  assert.ok(fallos.some((f) => f.includes("preguntas")));
  assert.ok(fallos.some((f) => f.includes("planAccion")));
});

test("a un paso del plan sin indicador se le ve el fallo", () => {
  const mala = structuredClone(prosa);
  delete mala.planAccion[1].indicador;
  const fallos = validarProsa(mala, modelo);
  assert.ok(fallos.some((f) => f.includes("paso 2") && f.includes("indicador")));
});

test("el encargo lleva el método de la casa, no solo el tono", () => {
  // Las preguntas y el plan se apoyan en los marcos de executive-coach-senior.
  // Si esto desaparece, la redacción vuelve a salir de lo que le parezca al modelo.
  for (const marco of [
    "marco de asertividad",
    "marco de conflicto",
    "regulación emocional ANTES",
    "no recetes el rasgo que falta",
  ]) {
    assert.ok(INSTRUCCIONES.includes(marco), `las instrucciones no traen «${marco}»`);
  }
});
