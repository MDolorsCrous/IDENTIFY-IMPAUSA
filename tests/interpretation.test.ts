import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { band, bands, interpret, type Rule, type Norm } from "../src/services/interpretation.ts";
import { score, type Responses } from "../src/services/scoring.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

const config = {
  questions: leer("src/config/questions.json"),
  facets: leer("src/config/facets.json"),
  domains: leer("src/config/domains.json"),
};
const reglas = leer("src/config/interpretation/combinations.json") as Rule[];
const fixture = leer("tests/fixtures/ejemplo-excel.json");

test("sin baremo, la banda sale de la escala y queda marcada como tal", () => {
  assert.deepEqual(band(1.2), { score: 1.2, band: "baja", method: "escala" });
  assert.equal(band(2.75).band, "media-baja");
  assert.equal(band(3.25).band, "media-alta");
  assert.equal(band(4.9).band, "alta");
  assert.equal(band(3.0).method, "escala");
});

test("con baremo, la banda sale del percentil y trae z, percentil y T", () => {
  const norm: Norm = { mean: 3.0, sd: 0.5 };
  const media = band(3.0, norm);
  assert.equal(media.method, "baremo");
  assert.ok(Math.abs(media.z! - 0) < 1e-9);
  assert.ok(Math.abs(media.percentile! - 50) < 0.1);
  assert.ok(Math.abs(media.T! - 50) < 1e-9);

  const alta = band(4.0, norm); // z = +2
  assert.equal(alta.band, "alta");
  assert.ok(alta.percentile! > 97);
  assert.ok(Math.abs(alta.T! - 70) < 1e-9);

  const baja = band(2.0, norm); // z = -2
  assert.equal(baja.band, "baja");
  assert.ok(baja.percentile! < 3);
});

test("una desviación típica de cero no rompe: cae a la escala", () => {
  assert.equal(band(3.4, { mean: 3, sd: 0 }).method, "escala");
});

test("el mismo dato puede dar bandas distintas según haya baremo o no", () => {
  // 3,4 es «media-alta» mirando solo la escala. Frente a una población con media 3,8
  // cae en el percentil 21: banda baja. Es justo por esto que los baremos importan.
  assert.equal(band(3.4).band, "media-alta");
  const conBaremo = band(3.4, { mean: 3.8, sd: 0.5 });
  assert.equal(conBaremo.band, "baja");
  assert.ok(conBaremo.percentile! > 20 && conBaremo.percentile! < 23);
});

test("una regla dispara solo con todas sus condiciones", () => {
  const regla: Rule[] = [
    {
      id: "prueba",
      effect: "x",
      conditions: [
        { facet: "sociability", level: "high" },
        { facet: "assertiveness", level: "high" },
      ],
      summary: "s",
      scope: "laboral",
      evidence: "E2",
      references: ["r"],
      sourceSlides: [1],
      appearsIn: ["sociability"],
    },
  ];
  const dos = { sociability: band(4.5), assertiveness: band(4.5) };
  assert.equal(interpret(dos, regla).fired.length, 1);

  const una = { sociability: band(4.5), assertiveness: band(1.5) };
  const r = interpret(una, regla);
  assert.equal(r.fired.length, 0);
  assert.equal(r.nearMisses.length, 1);
  assert.equal(r.nearMisses[0].unmet[0].condition.facet, "assertiveness");
});

test("a lo que le faltan dos condiciones no aparece ni como señal", () => {
  const regla: Rule[] = [
    {
      id: "prueba",
      effect: "x",
      conditions: [
        { facet: "sociability", level: "high" },
        { facet: "assertiveness", level: "high" },
        { facet: "trust", level: "high" },
      ],
      summary: "s",
      scope: "laboral",
      evidence: "E2",
      references: ["r"],
      sourceSlides: [1],
      appearsIn: ["sociability"],
    },
  ];
  const b = { sociability: band(4.5), assertiveness: band(1.5), trust: band(1.5) };
  const r = interpret(b, regla);
  assert.equal(r.fired.length, 0);
  assert.equal(r.nearMisses.length, 0);
});

test("las reglas disparadas salen ordenadas de más específica a menos", () => {
  const todoAlto = Object.fromEntries(
    (config.facets as { id: string }[]).map((f) => [f.id, band(5)]),
  );
  const { fired } = interpret(todoAlto, reglas);
  assert.ok(fired.length > 0);
  for (let i = 1; i < fired.length; i++) {
    assert.ok(fired[i - 1].rule.conditions.length >= fired[i].rule.conditions.length);
  }
});

test("un perfil de todo alto no dispara ninguna regla que pida algo bajo", () => {
  const todoAlto = Object.fromEntries(
    (config.facets as { id: string }[]).map((f) => [f.id, band(5)]),
  );
  for (const m of interpret(todoAlto, reglas).fired) {
    assert.ok(
      m.rule.conditions.every((c) => c.level === "high"),
      `${m.rule.id} pide algo bajo y ha disparado con todo alto`,
    );
  }
});

test("el caso de ejemplo del Excel se puede interpretar de punta a punta", () => {
  const respuestas = Object.fromEntries(
    Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
  ) as Responses;
  const puntuaciones = score(respuestas, config);
  const { facets, domains } = bands(puntuaciones);

  assert.equal(Object.keys(facets).length, 15);
  assert.equal(Object.keys(domains).length, 5);
  assert.equal(facets.organization.score, 1.75);
  assert.equal(facets.organization.band, "baja");
  assert.equal(facets.anxiety.score, 4.5);
  assert.equal(facets.anxiety.band, "alta");

  const { fired, nearMisses } = interpret(facets, reglas);
  for (const m of [...fired, ...nearMisses]) {
    assert.ok(m.rule.references.length > 0, `${m.rule.id} sin referencia`);
  }
  // No se comprueba cuántas disparan: depende de los cortes, que son provisionales.
  assert.ok(fired.length + nearMisses.length > 0, "el perfil no activa nada, algo va mal");
});

test("la calibración cambia cuánto dispara, y por eso es un parámetro", async () => {
  const { AMPLIO, ESTRICTO } = await import("../src/services/interpretation.ts");
  const respuestas = Object.fromEntries(
    Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
  ) as Responses;
  const b = bands(score(respuestas, config)).facets;

  const estricto = interpret(b, reglas, ESTRICTO);
  const amplio = interpret(b, reglas, AMPLIO);

  // Con el mismo perfil, lo amplio activa bastante más que lo estricto
  const totalEstricto = estricto.fired.length + estricto.nearMisses.length;
  const totalAmplio = amplio.fired.length + amplio.nearMisses.length;
  assert.ok(totalAmplio > totalEstricto, `amplio ${totalAmplio} debería superar a estricto ${totalEstricto}`);

  // Y lo estricto nunca dispara nada que lo amplio no dispare también
  const disparaAmplio = new Set(amplio.fired.map((m) => m.rule.id));
  for (const m of estricto.fired) {
    assert.ok(disparaAmplio.has(m.rule.id), `${m.rule.id} dispara estricto pero no amplio`);
  }
});

test("por defecto es estricto", async () => {
  const { ESTRICTO } = await import("../src/services/interpretation.ts");
  const b = { sociability: band(3.2), assertiveness: band(3.2) }; // ambas media-alta
  const regla: Rule[] = [
    {
      id: "p",
      effect: "x",
      conditions: [
        { facet: "sociability", level: "high" },
        { facet: "assertiveness", level: "high" },
      ],
      summary: "s",
      scope: "laboral",
      evidence: "E2",
      references: ["r"],
      sourceSlides: [1],
      appearsIn: ["sociability"],
    },
  ];
  assert.equal(interpret(b, regla).fired.length, 0);
  assert.equal(interpret(b, regla, ESTRICTO).fired.length, 0);
});
