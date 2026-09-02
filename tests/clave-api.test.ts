/**
 * De dónde sale la clave de la API.
 *
 * Hay dos nombres porque hay dos entornos: `ANTHROPIC_API_KEY` en el ordenador
 * —el nombre estándar, el que el SDK lee solo— y `THINK_IMPAUSA` en Netlify.
 * Estas pruebas fijan el orden y el recorte, que es donde se esconden los fallos
 * que no se ven: una clave con un espacio al final parece buena y da un 401.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { claveDeApi, NOMBRES } from "../tools/clave-api.mjs";

test("se prefiere el nombre estándar", () => {
  const r = claveDeApi({ ANTHROPIC_API_KEY: "sk-estandar", THINK_IMPAUSA: "sk-netlify" });
  assert.equal(r.clave, "sk-estandar");
  assert.equal(r.nombre, "ANTHROPIC_API_KEY");
});

test("si solo está la de Netlify, se usa esa", () => {
  const r = claveDeApi({ THINK_IMPAUSA: "sk-netlify" });
  assert.equal(r.clave, "sk-netlify");
  assert.equal(r.nombre, "THINK_IMPAUSA");
});

test("una variable vacía no cuenta como clave", () => {
  // Si contara, el error sería un 401 de la API en vez de un «no hay clave»,
  // que es mucho más difícil de entender.
  assert.equal(claveDeApi({ ANTHROPIC_API_KEY: "", THINK_IMPAUSA: "   " }), null);
  assert.equal(claveDeApi({}), null);
});

test("se recorta lo que sobra al pegarla", () => {
  // Un salto de línea al final es invisible y la API la rechaza sin explicar
  // por qué. Es de los fallos más caros de encontrar.
  assert.equal(claveDeApi({ ANTHROPIC_API_KEY: "  sk-con-espacios\n" }).clave, "sk-con-espacios");
});

test("los dos nombres están documentados, y el estándar va primero", () => {
  assert.deepEqual(NOMBRES, ["ANTHROPIC_API_KEY", "THINK_IMPAUSA"]);
});
