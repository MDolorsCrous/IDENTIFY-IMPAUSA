/**
 * El paquete que se lleva la página del test.
 *
 * La página no tiene una copia del motor: tiene el motor. Estas pruebas cuidan
 * que siga siendo así y que el paquete pueda ejecutarse en un navegador.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { empaquetarMotor } from "../tools/empaquetar.mjs";
import { construirModelo } from "../src/services/pipeline.ts";
import { renderInforme } from "../src/services/render-informe.js";
import { cargarRecursos, cargarEjemplo } from "../tools/recursos.mjs";
import type { Responses } from "../src/services/scoring.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const recursos = cargarRecursos();
const respuestas = Object.fromEntries(
  Object.entries(cargarEjemplo().responses).map(([k, v]) => [Number(k), v]),
) as Responses;

const paquete = empaquetarMotor();

test("el paquete no lleva imports ni exports", () => {
  // Un import suelto deja la página en blanco sin decir por qué.
  assert.equal(paquete.match(/^\s*import\s/m), null);
  assert.equal(paquete.match(/^\s*export\s/m), null);
});

test("el paquete no cierra el bloque de script que lo contiene", () => {
  // El renderizador lleva un <script> dentro de una plantilla. Sin escapar,
  // corta la página a media función.
  assert.equal(paquete.includes("</script"), false);
});

test("ningún nombre está declarado dos veces", () => {
  const vistos = new Set<string>();
  for (const m of paquete.matchAll(/^(?:const|let|class|function)\s+([A-Za-z_$][\w$]*)/gm)) {
    assert.ok(!vistos.has(m[1]), `«${m[1]}» está declarado dos veces`);
    vistos.add(m[1]);
  }
});

test("trae todo lo que la página necesita", () => {
  for (const pieza of [
    "function score",
    "function construirModelo",
    "function renderInforme",
    "function promptCompleto",
    "function validarProsa",
    "function metaforasParaInforme",
  ]) {
    assert.ok(paquete.includes(pieza), `al paquete le falta ${pieza}`);
  }
});

test("no arrastra nada de Node", () => {
  for (const rastro of ["node:fs", "readFileSync", "process.argv", "import.meta"]) {
    assert.ok(!paquete.includes(rastro), `el paquete lleva ${rastro}, que no existe en el navegador`);
  }
});

test("el informe del paquete es idéntico al del motor", () => {
  // La prueba que cierra el circulo: si la pagina y el comando se separaran,
  // dos personas con el mismo perfil recibirian informes distintos.
  const opciones = { facetas: recursos.facetas, metaforas: recursos.metaforas, fecha: "1 de enero de 2026" };

  const enNode = renderInforme(
    construirModelo(respuestas, recursos, { persona: "Marta" }),
    {},
    recursos.labels,
    opciones,
  );

  const enPaquete = new Function(
    "recursos",
    "respuestas",
    "opciones",
    paquete +
      "\n return renderInforme(construirModelo(respuestas, recursos, { persona: 'Marta' }), {}, recursos.labels, opciones);",
  )(recursos, respuestas, opciones);

  assert.equal(enPaquete, enNode);
});

test("la página generada lleva el paquete y no se corta", () => {
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  assert.ok(pagina.includes("function construirModelo"), "la página no lleva el motor");
  assert.ok(pagina.includes('id="informe"'), "falta el botón del informe");
  assert.ok(pagina.includes('id="ver"'), "falta el botón del JSON");
  // Dos bloques de script: el motor y la aplicación
  assert.ok((pagina.match(/<script>/g) ?? []).length >= 2);
});

test("el motor empotrado en la página no sabe nada de la API ni de la clave", () => {
  // La página es un HTML suelto que se abre con doble clic: cualquier clave que
  // llevara dentro quedaría a la vista de quien lo abriera. Por eso la llamada
  // a la API vive en tools/redactar.mjs y no en src/services/, que es lo único
  // que se empaqueta. Esta prueba es el cierre de esa decisión.
  const paquete = empaquetarMotor();
  for (const prohibido of ["ANTHROPIC_API_KEY", "@anthropic-ai/sdk", "api.anthropic.com", "x-api-key"]) {
    assert.ok(!paquete.includes(prohibido), `el paquete lleva «${prohibido}»`);
  }
});
