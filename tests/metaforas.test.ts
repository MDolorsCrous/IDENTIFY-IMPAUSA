/**
 * Las metáforas del informe.
 *
 * Vienen del catálogo de la skill metaforas-coaching, que trae sus propias
 * reglas escritas. Estas pruebas cuidan que se respeten.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { construirModelo } from "../src/services/pipeline.ts";
import { metaforasParaInforme } from "../src/services/render-informe.js";
import { cargarRecursos, cargarEjemplo } from "../tools/recursos.mjs";
import type { Responses } from "../src/services/scoring.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

const metaforas = leer("src/config/interpretation/metaforas.json");
const facetas = (leer("src/config/facets.json") as { id: string }[]).map((f) => f.id);
const recursos = cargarRecursos();

test("el mapa cubre las 15 facetas en sus dos niveles", () => {
  assert.deepEqual(Object.keys(metaforas.mapa).sort(), [...facetas].sort());
  for (const [id, niveles] of Object.entries(metaforas.mapa) as [string, any][]) {
    for (const nivel of ["bajo", "alto"]) {
      assert.ok(niveles[nivel]?.length > 0, `${id}.${nivel} no apunta a ninguna categoría`);
    }
  }
});

test("todas las categorías del mapa existen y traen metáforas", () => {
  for (const niveles of Object.values(metaforas.mapa) as any[]) {
    for (const id of [...niveles.bajo, ...niveles.alto]) {
      const c = metaforas.categorias[id];
      assert.ok(c, `la categoría ${id} no está en el fichero`);
      assert.ok(c.metaforas.length >= 6, `la categoría ${id} trae ${c.metaforas.length} metáforas`);
      for (const m of c.metaforas) {
        assert.ok(m.nombre?.length > 2 && m.texto?.length > 20, `metáfora incompleta en ${id}`);
      }
    }
  }
});

test("ninguna categoría delicada entra en el informe", () => {
  // Regla de la propia skill: duelo, trauma, adicción, niño interior, soledad y
  // las demás transversales solo se abren cuando la persona las ha nombrado, y
  // un test de personalidad no lo hace nunca.
  const excluidas = Object.keys(metaforas.excluidas).filter((k) => !k.startsWith("_"));
  assert.ok(excluidas.length >= 10, "la lista de excluidas parece incompleta");
  for (const niveles of Object.values(metaforas.mapa) as any[]) {
    for (const id of [...niveles.bajo, ...niveles.alto]) {
      assert.ok(!excluidas.includes(id), `el mapa usa la categoría excluida ${id}`);
    }
    }
  for (const id of excluidas) {
    assert.ok(!metaforas.categorias[id], `la categoría excluida ${id} se ha colado en el fichero`);
  }
});

test("un perfil recibe como mucho tres imágenes, una de ellas el ancla", () => {
  const respuestas = Object.fromEntries(
    Object.entries(cargarEjemplo().responses).map(([k, v]) => [Number(k), v]),
  ) as Responses;
  const elegidas = metaforasParaInforme(construirModelo(respuestas, recursos), metaforas);

  assert.ok(elegidas, "el caso de ejemplo no recibe ninguna imagen");
  assert.ok(elegidas.imagenes.length + 1 <= metaforas.reglas.maximoPorInforme);
  assert.ok(elegidas.ancla?.texto?.length > 20);

  // Nunca dos imágenes de la misma categoría: seria repetirse
  const categorias = [...elegidas.imagenes, elegidas.ancla].map((m: any) => m.categoria);
  assert.equal(new Set(categorias).size, categorias.length);
});

test("solo se ilustran las facetas en banda extrema", () => {
  const respuestas = Object.fromEntries(
    Object.entries(cargarEjemplo().responses).map(([k, v]) => [Number(k), v]),
  ) as Responses;
  const modelo = construirModelo(respuestas, recursos);
  const bandas = Object.fromEntries(
    modelo.domains.flatMap((d) => d.facets).map((f) => [f.id, f.band]),
  );
  const elegidas = metaforasParaInforme(modelo, metaforas)!;

  for (const m of [...elegidas.imagenes, elegidas.ancla] as any[]) {
    assert.ok(
      bandas[m.faceta] === "baja" || bandas[m.faceta] === "alta",
      `${m.faceta} está en banda ${bandas[m.faceta]} y no debería llevar imagen`,
    );
  }
});

test("un perfil sin extremos no recibe ninguna imagen", () => {
  // Contestar 3 a todo deja las quince facetas en el punto medio.
  const todoTres = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [i + 1, 3])) as Responses;
  const modelo = construirModelo(todoTres, recursos);
  assert.equal(metaforasParaInforme(modelo, metaforas), null);
});

test("la elección es estable: el mismo perfil recibe siempre lo mismo", () => {
  const respuestas = Object.fromEntries(
    Object.entries(cargarEjemplo().responses).map(([k, v]) => [Number(k), v]),
  ) as Responses;
  const modelo = construirModelo(respuestas, recursos);
  const a = metaforasParaInforme(modelo, metaforas)!;
  const b = metaforasParaInforme(modelo, metaforas)!;
  assert.deepEqual(a, b);
});
