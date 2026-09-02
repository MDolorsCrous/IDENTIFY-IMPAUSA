/**
 * Las fuentes del informe.
 *
 * El informe cita autores dentro del texto —«Danner & Lechner, 2024»— y al final
 * dice qué son. Estas pruebas cuidan de que las dos cosas no se separen: una cita
 * sin referencia deja al lector colgado, y una referencia que ya nadie usa engorda
 * la bibliografía con humo.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { construirModelo } from "../src/services/pipeline.ts";
import { renderInforme } from "../src/services/render-informe.js";
import { cargarRecursos, cargarEjemplo } from "../tools/recursos.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

const fuentes = leer("src/config/fuentes.json");
const facetas = leer("src/config/interpretation/facetas.json") as Record<string, any>;
const reglas = leer("src/config/interpretation/combinations.json") as any[];

/** Todas las entradas, vengan de donde vengan dentro del fichero. */
const todas = [fuentes.instrumento, fuentes.adaptacion, ...fuentes.interpretacion];

/** Todas las citas cortas que aparecen en la capa de interpretación. */
const citadas = new Set<string>();
for (const [id, f] of Object.entries(facetas)) {
  if (id.startsWith("_")) continue;
  for (const nivel of ["bajo", "alto"] as const) {
    for (const r of f[nivel].referencias as string[]) citadas.add(r);
  }
}
for (const r of reglas) for (const ref of r.references as string[]) citadas.add(ref);

test("ninguna cita se queda sin su referencia completa", () => {
  const conocidas = new Set(todas.map((f) => f.cita));
  for (const cita of citadas) {
    assert.ok(conocidas.has(cita), `«${cita}» se cita pero no está en fuentes.json`);
  }
});

test("ninguna referencia sobra", () => {
  // El instrumento y la adaptación siempre van: son sobre lo que está construido
  // el test, se citen o no dentro del texto.
  for (const f of fuentes.interpretacion) {
    assert.ok(citadas.has(f.cita), `«${f.cita}» está en fuentes.json y no la usa nadie`);
  }
});

test("cada referencia está completa, y con su DOI", () => {
  for (const f of todas) {
    for (const campo of ["cita", "autores", "anio", "titulo", "publicacion", "doi", "papel"]) {
      assert.ok(f[campo], `a «${f.cita ?? "?"}» le falta ${campo}`);
    }
    // Un DOI mal escrito es peor que ninguno: promete comprobación y no la da.
    assert.match(f.doi, /^10\.\d{4,}\/\S+$/, `el DOI de «${f.cita}» no tiene forma de DOI`);
    assert.ok(Number.isInteger(f.anio) && f.anio > 1990 && f.anio <= 2026);
  }
});

test("el instrumento se atribuye a quien es", () => {
  // No es cortesía: es lo primero que pide cualquier licencia, y el BFI-2 tiene
  // dueños. Ver docs/licencia-bfi2.md.
  assert.match(fuentes._atribucion, /Oliver P\. John/);
  assert.match(fuentes._atribucion, /Christopher J\. Soto/);
});

test("el informe generado lleva la bibliografía entera", () => {
  // Las fuentes viajan por `opciones` hasta el renderizador. Si un día alguien
  // añade una vía de generar informes y se olvida de pasarlas, la sección
  // desaparece sin decir nada: esta prueba es la que lo nota.
  const recursos = cargarRecursos();
  const respuestas = Object.fromEntries(
    Object.entries(cargarEjemplo().responses).map(([k, v]) => [Number(k), v]),
  );
  const html = renderInforme(construirModelo(respuestas as any, recursos), {}, recursos.labels, {
    facetas: recursos.facetas,
    metaforas: recursos.metaforas,
    fuentes: recursos.fuentes,
    fecha: "1 de enero de 2026",
  });

  for (const f of todas) {
    assert.ok(html.includes(f.doi), `al informe le falta el DOI de «${f.cita}»`);
    assert.ok(html.includes(f.autores), `al informe le faltan los autores de «${f.cita}»`);
  }
  assert.ok(html.includes("Oliver P. John"), "el informe no atribuye el instrumento");
});
