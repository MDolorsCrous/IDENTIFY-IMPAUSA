/**
 * La costura entre la estructura y la prosa por idioma.
 *
 * La fase 2 del plan del inglés partió la interpretación en dos: lo que el
 * motor usa para calcular (condiciones, ids, citas) vive una sola vez en los
 * ficheros neutros, y la prosa vive en los .es.json. Estas pruebas cuidan que
 * ningún idioma pierda una pieza: cada id de la estructura tiene su prosa y
 * ninguna prosa apunta a un id que no exista. Cuando llegue el inglés, se
 * añade su idioma a la lista y las mismas pruebas lo cubren.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { cargarRecursos } from "../tools/recursos.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

const IDIOMAS = ["es"];

const reglas = leer("src/config/interpretation/combinations.json") as { id: string }[];
const fichas = leer("src/config/interpretation/facetas.json") as Record<string, unknown>;
const metaforas = leer("src/config/interpretation/metaforas.json");
const fuentes = leer("src/config/fuentes.json");

for (const idioma of IDIOMAS) {
  test(`cada regla tiene su prosa en «${idioma}», y ninguna prosa sobra`, () => {
    const prosa = leer(`src/config/interpretation/combinations.${idioma}.json`) as Record<string, any>;
    for (const r of reglas) {
      const p = prosa[r.id];
      assert.ok(p, `la regla «${r.id}» no tiene prosa`);
      for (const campo of ["effect", "summary", "scope", "evidence"]) {
        assert.ok(p[campo], `a «${r.id}» le falta ${campo}`);
      }
    }
    const ids = new Set(reglas.map((r) => r.id));
    for (const id of Object.keys(prosa)) {
      assert.ok(ids.has(id), `la prosa de «${id}» no corresponde a ninguna regla`);
    }
  });

  test(`cada faceta tiene su prosa en «${idioma}», y ninguna prosa sobra`, () => {
    const prosa = leer(`src/config/interpretation/facetas.${idioma}.json`) as Record<string, any>;
    const ids = Object.keys(fichas).filter((k) => !k.startsWith("_"));
    for (const id of ids) {
      const p = prosa[id];
      assert.ok(p, `la faceta «${id}» no tiene prosa`);
      for (const campo of ["definicion", "bajo", "alto"]) {
        assert.ok(p[campo], `a «${id}» le falta ${campo}`);
      }
    }
    for (const id of Object.keys(prosa)) {
      assert.ok(ids.includes(id), `la prosa de «${id}» no corresponde a ninguna faceta`);
    }
  });

  test(`cada categoría del mapa de metáforas existe en «${idioma}»`, () => {
    const prosa = leer(`src/config/interpretation/metaforas.${idioma}.json`);
    const usadas = new Set(
      Object.values(metaforas.mapa as Record<string, { bajo: string[]; alto: string[] }>)
        .flatMap((n) => [...n.bajo, ...n.alto]),
    );
    for (const id of usadas) {
      const c = prosa.categorias[id];
      assert.ok(c, `el mapa usa la categoría «${id}» y el idioma no la tiene`);
      assert.ok(c.nombre && c.metaforas?.length, `la categoría «${id}» está vacía`);
    }
  });

  test(`cada fuente tiene su papel en «${idioma}»`, () => {
    const prosa = leer(`src/config/fuentes.${idioma}.json`);
    assert.ok(prosa._atribucion, "falta la atribución");
    const entradas = [fuentes.instrumento, fuentes.adaptacion, ...fuentes.interpretacion];
    for (const f of entradas) {
      assert.ok(prosa.papeles[f.cita], `la fuente «${f.cita}» no tiene papel`);
    }
    const citas = new Set(entradas.map((f: any) => f.cita));
    for (const cita of Object.keys(prosa.papeles)) {
      assert.ok(citas.has(cita), `el papel de «${cita}» no corresponde a ninguna fuente`);
    }
  });
}

test("la estructura no lleva prosa: ni resúmenes ni lecturas en los ficheros neutros", () => {
  // Si alguien vuelve a escribir un summary en combinations.json o un texto en
  // facetas.json, habrá dos versiones que un día divergirán sin que nadie lo note.
  for (const r of reglas as any[]) {
    assert.equal(r.summary, undefined, `«${r.id}» lleva summary en el fichero neutro`);
    assert.equal(r.effect, undefined, `«${r.id}» lleva effect en el fichero neutro`);
  }
  for (const [id, v] of Object.entries(fichas) as [string, any][]) {
    if (id.startsWith("_")) continue;
    assert.equal(v.definicion, undefined, `«${id}» lleva definicion en el fichero neutro`);
    assert.equal(v.bajo?.texto, undefined, `«${id}» lleva texto en el fichero neutro`);
  }
  assert.equal(metaforas.categorias, undefined, "metaforas.json lleva las categorías dentro");
});

test("cargarRecursos rechaza un idioma que no existe", () => {
  assert.throws(() => cargarRecursos("en" as any), /no hay textos para el idioma/);
});
