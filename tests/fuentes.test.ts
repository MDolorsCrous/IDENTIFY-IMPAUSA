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

const fuentes = cargarRecursos().fuentes;
const facetas = cargarRecursos().facetas as Record<string, any>;
const reglas = cargarRecursos().rules as any[];

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
    textos: recursos.textos.informe,
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

test("el informe se firma: logotipo, contacto y copyright", () => {
  const recursos = cargarRecursos();
  const respuestas = Object.fromEntries(
    Object.entries(cargarEjemplo().responses).map(([k, v]) => [Number(k), v]),
  );
  const html = renderInforme(construirModelo(respuestas as any, recursos), {}, recursos.labels, {
    facetas: recursos.facetas,
    textos: recursos.textos.informe,
    metaforas: recursos.metaforas,
    fuentes: recursos.fuentes,
    marca: recursos.marca,
    fecha: "1 de enero de 2026",
  });

  assert.ok(html.includes("hola@impausa.com"), "falta el correo");
  assert.ok(html.includes("www.impausa.com"), "falta la web");
  assert.ok(html.includes("IMPAUSA POWER, S.L."), "falta la razón social");
  assert.ok(html.includes("Todos los derechos reservados"), "falta la reserva de derechos");

  // Los dos logotipos van DENTRO del fichero, no enlazados: el informe se manda
  // por correo, se guarda y se imprime, y tiene que verse igual sin conexión.
  // Son SVG: vectoriales, nítidos en el papel, y los dos juntos pesan 34 KB
  // frente a los 161 del PNG que había antes.
  assert.ok(html.includes('class="firma__logo" src="data:image/svg+xml,'), "el logotipo no viaja dentro");
  assert.ok(html.includes('class="firma__live" src="data:image/svg+xml,'), "falta LivePausa en el cierre");
  assert.ok(!html.includes('firma__logo" src="http'), "el logotipo está enlazado en vez de incrustado");
});

test("el informe abre y cierra con la marca, y todo sobre el mismo eje", () => {
  const recursos = cargarRecursos();
  const respuestas = Object.fromEntries(
    Object.entries(cargarEjemplo().responses).map(([k, v]) => [Number(k), v]),
  );
  const html = renderInforme(construirModelo(respuestas as any, recursos), {}, recursos.labels, {
    facetas: recursos.facetas,
    textos: recursos.textos.informe,
    metaforas: recursos.metaforas,
    fuentes: recursos.fuentes,
    marca: recursos.marca,
    fecha: "1 de enero de 2026",
  });

  // Cabecera: la banda de color y el logotipo, como en los informes de Connect.
  assert.ok(html.includes('class="cabecera__banda"'), "falta la banda de la cabecera");
  assert.ok(html.includes('class="cabecera__logo"'), "falta el logotipo de la cabecera");
  assert.ok(html.indexOf('class="cabecera"') < html.indexOf('class="portada"'), "la cabecera no va primero");

  // Y la regla que costó ver: los párrafos llevan un ancho máximo, así que en los
  // bloques centrados hay que anularlo o el texto no cuadra con el eje del logo.
  assert.ok(html.includes(".firma p,.portada p{max-width:none"), "el texto centrado volverá a irse a la izquierda");
});
