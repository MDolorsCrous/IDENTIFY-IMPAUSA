/**
 * La clave de corrección oficial, copiada de la página 3 del PDF
 * `Spanish BFI-2 Form.pdf` — sección «Escalas de las facetas del BFI-2».
 * La R marca ítem inverso.
 *
 * Esto es la fuente de verdad de la psicometría. Si alguien toca la configuración
 * y se desvía de esta clave, estas pruebas se ponen rojas.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

/** Tal cual aparece en el PDF, con las erres donde están. */
const CLAVE_OFICIAL: Record<string, string> = {
  sociability: "1, 16R, 31R, 46",
  assertiveness: "6, 21, 36R, 51R",
  energy_level: "11R, 26R, 41, 56",
  compassion: "2, 17R, 32, 47R",
  respectfulness: "7, 22R, 37R, 52",
  trust: "12R, 27, 42R, 57",
  organization: "3R, 18, 33, 48R",
  productiveness: "8R, 23R, 38, 53",
  responsibility: "13, 28R, 43, 58R",
  anxiety: "4R, 19, 34, 49R",
  depression: "9R, 24R, 39, 54",
  emotional_volatility: "14, 29R, 44R, 59",
  intellectual_curiosity: "10, 25R, 40, 55R",
  aesthetic_sensitivity: "5R, 20, 35, 50R",
  creative_imagination: "15, 30R, 45R, 60",
};

/** "16R" -> { id: 16, reverse: true } */
function parsear(clave: string) {
  return clave.split(",").map((trozo) => {
    const t = trozo.trim();
    const reverse = t.endsWith("R");
    return { id: Number(reverse ? t.slice(0, -1) : t), reverse };
  });
}

const questions = leer("src/config/questions.json") as { id: number; facet: string; reverse: boolean }[];
const facets = leer("src/config/facets.json") as { id: string; items: number[] }[];
const reverseItems = leer("src/config/reverseItems.json") as number[];

test("cada faceta tiene exactamente los ítems que dice la clave oficial", () => {
  for (const [facetId, clave] of Object.entries(CLAVE_OFICIAL)) {
    const esperados = parsear(clave).map((x) => x.id);
    const facet = facets.find((f) => f.id === facetId);
    assert.ok(facet, `falta la faceta ${facetId}`);
    assert.deepEqual([...facet.items].sort((a, b) => a - b), [...esperados].sort((a, b) => a - b), facetId);
  }
});

test("la polaridad de los 60 ítems coincide con la clave oficial", () => {
  const oficial = new Map<number, boolean>();
  for (const clave of Object.values(CLAVE_OFICIAL)) {
    for (const { id, reverse } of parsear(clave)) oficial.set(id, reverse);
  }
  assert.equal(oficial.size, 60, "la clave oficial no cubre los 60 ítems");

  for (const q of questions) {
    assert.equal(q.reverse, oficial.get(q.id), `ítem ${q.id}`);
  }
});

test("reverseItems.json es exactamente la lista de erres de la clave", () => {
  const esperados: number[] = [];
  for (const clave of Object.values(CLAVE_OFICIAL)) {
    for (const { id, reverse } of parsear(clave)) if (reverse) esperados.push(id);
  }
  assert.equal(esperados.length, 30);
  assert.deepEqual([...reverseItems].sort((a, b) => a - b), esperados.sort((a, b) => a - b));
});

test("cada ítem está asignado a la faceta que dice la clave", () => {
  for (const [facetId, clave] of Object.entries(CLAVE_OFICIAL)) {
    for (const { id } of parsear(clave)) {
      const q = questions.find((x) => x.id === id);
      assert.equal(q?.facet, facetId, `ítem ${id}`);
    }
  }
});

// ---- Los enunciados que lee la persona ----

const oficiales = leer("src/config/enunciados-oficiales.json").enunciados as Record<string, string>;
const visibles = leer("src/i18n/es.json").questions as Record<string, string>;

test("los 60 enunciados visibles son los del PDF oficial", () => {
  for (let n = 1; n <= 60; n++) {
    assert.ok(oficiales[n], `falta el enunciado oficial ${n}`);
    assert.equal(visibles[n], oficiales[n], `el ítem ${n} no coincide con el oficial`);
  }
});

test("no han vuelto las erratas del Excel", () => {
  // Estas once venían del Excel y se leían en pantalla. Si reaparecen, es que
  // alguien ha vuelto a generar los textos desde el Excel en vez del PDF.
  const erratas = [
    "entusiamado",
    "Metóidico",
    "IServicial",
    "desconfia ",
    "A quién le cuesta",
    "A quién le es difícil",
    "A veces tímido,",
  ];
  const todo = Object.values(visibles).join(" | ");
  for (const errata of erratas) {
    assert.ok(!todo.includes(errata), `ha vuelto la errata «${errata}»`);
  }
});

test("ningún enunciado arrastra restos de la maquetación del PDF", () => {
  for (const [n, texto] of Object.entries(oficiales)) {
    assert.ok(!/SPANISH ADAPTATION|Por favor/i.test(texto), `el ítem ${n} lleva pie de página`);
    assert.ok(texto.length < 70, `el ítem ${n} es sospechosamente largo`);
    assert.ok(!/\d/.test(texto), `el ítem ${n} lleva un número`);
  }
});

test("la única diferencia con el PDF son las desviaciones declaradas", () => {
  // Se puede apartar del texto oficial, pero solo a propósito y dejándolo escrito.
  const fichero = leer("src/config/enunciados-oficiales.json");
  const declaradas = new Set(fichero.desviaciones.map((d: { item: number }) => String(d.item)));

  for (let n = 1; n <= 60; n++) {
    const oficial = fichero.oficiales[n];
    const mostrado = fichero.enunciados[n];
    if (declaradas.has(String(n))) {
      assert.notEqual(mostrado, oficial, `el ítem ${n} está declarado como desviación y no lo es`);
    } else {
      assert.equal(mostrado, oficial, `el ítem ${n} se aparta del oficial sin declararlo`);
    }
  }

  for (const d of fichero.desviaciones) {
    assert.ok(d.motivo?.length > 15, `la desviación del ítem ${d.item} no explica por qué`);
  }
});
