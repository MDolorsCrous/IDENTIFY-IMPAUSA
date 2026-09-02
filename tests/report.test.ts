import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { score, type Responses } from "../src/services/scoring.ts";
import { bands, interpret, type Norm, type Rule } from "../src/services/interpretation.ts";
import { buildReport, type Labels } from "../src/services/report.ts";
import { construirModelo } from "../src/services/pipeline.ts";
import { renderInforme } from "../src/services/render-informe.js";
import { cargarRecursos } from "../tools/recursos.mjs";

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

const recursos = { config, labels, rules: reglas };

function construir(norms: Record<string, Norm> = {}) {
  return construirModelo(respuestas, recursos, { norms, persona: "Persona de ejemplo" });
}

test("el informe tiene los 5 dominios con sus 3 facetas", () => {
  const informe = construir();
  assert.equal(informe.domains.length, 5);
  for (const d of informe.domains) {
    assert.equal(d.facets.length, 3, d.id);
    assert.ok(d.label.length > 0);
  }
});

test("se conserva la nomenclatura original del BFI-2", () => {
  // Decisión de la autora: nada de renombrar. Los nombres del informe son los del
  // instrumento, para que se puedan contrastar con cualquier otra fuente.
  const informe = construir();
  const emocional = informe.domains.find((d) => d.id === "negative_emotionality")!;
  assert.equal(emocional.label, "Emocionalidad negativa");
  assert.equal(emocional.technicalLabel, undefined);
  assert.deepEqual(emocional.facets.map((f) => f.label), ["Ansiedad", "Depresión", "Volatilidad emocional"]);
});

test("sin renombrados, la leyenda de equivalencias queda vacía", () => {
  // Si un día se renombra algo, la leyenda vuelve sola: no hay que tocar el código.
  const informe = construir();
  assert.deepEqual(informe.legend, []);
});

test("la nomenclatura clínica lleva su aclaración donde aparece", () => {
  // Al conservar los nombres originales, la explicación de que Ansiedad y Depresión
  // son facetas y no diagnósticos no puede vivir escondida en una leyenda.
  const notas = leer("src/i18n/es-informe.json").notas;
  assert.ok(notas.negative_emotionality, "falta la aclaración del dominio");
  assert.match(notas.negative_emotionality, /no son condiciones clínicas|No son condiciones clínicas/);
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

test("las señales las escribe el código, y nunca las da por ciertas", () => {
  // Era el apartado donde más fácil resultaba afirmar como hecho una combinación
  // que NO se ha cumplido. Escrito por el código, no puede pasar: se dice cuántas
  // son, qué facetas las dejan fuera, y que no describen el perfil de hoy.
  const recursos = cargarRecursos();
  const respuestasEjemplo = Object.fromEntries(
    Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
  ) as Responses;
  const modelo = construirModelo(respuestasEjemplo, recursos, {});
  const html = renderInforme(modelo, {}, recursos.labels, {
    facetas: recursos.facetas,
    metaforas: recursos.metaforas,
    fuentes: recursos.fuentes,
    fecha: "1 de enero de 2026",
  });
  const seccion = html.slice(html.indexOf('id="senales"'), html.indexOf("</section>", html.indexOf('id="senales"')));

  assert.ok(!seccion.includes("Pendiente de redacción"), "las señales siguen esperando a Claude");
  assert.ok(seccion.includes("no describen tu perfil de hoy"), "no se dice que no describen el perfil");
  assert.ok(
    seccion.includes(`${modelo.nearMisses.length} combinaciones se quedan`),
    "no se dice cuántas se quedan cerca",
  );
});

test("un pasaje largo se parte en párrafos", () => {
  // Doscientas palabras en un solo bloque se leen mal por bien escritas que
  // estén. Los textos llegan con una línea en blanco donde cambia la idea.
  const recursos = cargarRecursos();
  const respuestasEjemplo = Object.fromEntries(
    Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
  ) as Responses;
  const modelo = construirModelo(respuestasEjemplo, recursos, {});
  const prosa = {
    enElTrabajo: "Lo que aporta.\n\nLo que cuesta.\n\nQué hacer con ello.",
    conclusion: "Un párrafo.\n\nY otro.",
  };
  const html = renderInforme(modelo, prosa as any, recursos.labels, {
    facetas: recursos.facetas,
    metaforas: recursos.metaforas,
    fecha: "1 de enero de 2026",
  });

  const seccion = html.slice(html.indexOf('id="trabajo"'), html.indexOf("</section>", html.indexOf('id="trabajo"')));
  assert.equal((seccion.match(/<p>/g) ?? []).length, 3, "el pasaje no se ha partido en tres");

  // Y una redacción antigua, sin líneas en blanco, sigue saliendo entera.
  const vieja = renderInforme(modelo, { conclusion: "Todo seguido, sin cortes." } as any, recursos.labels, {
    facetas: recursos.facetas,
    metaforas: recursos.metaforas,
    fecha: "1 de enero de 2026",
  });
  assert.ok(vieja.includes("<p>Todo seguido, sin cortes.</p>"));
});
