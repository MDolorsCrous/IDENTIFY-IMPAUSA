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

import { claveDeApi, queHaPasado, NOMBRES } from "../tools/clave-api.mjs";

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

test("una conexión que se cae no es un error desconocido", () => {
  // El caso real: `terminated` a los 20 segundos en Netlify, sin código de
  // estado. Como no hereda de Anthropic.APIError se colaba como «desconocido»,
  // y con ese nombre no se puede ni reintentar ni explicar qué ha pasado.
  for (const caida of [
    new TypeError("terminated"),
    Object.assign(new Error("fetch failed"), { cause: { code: "ECONNRESET" } }),
    new Error("socket hang up"),
    Object.assign(new Error("fetch failed"), { cause: { message: "Premature close" } }),
  ]) {
    const p = queHaPasado(caida);
    assert.equal(p.que, "conexion", `«${caida.message}» debería ser una caída de conexión`);
    assert.match(p.mensaje, /conexión/i);
  }
});

test("lo que de verdad es desconocido sigue siéndolo", () => {
  // Si todo acabara clasificado como conexión, se reintentaría lo que no debe.
  assert.equal(queHaPasado(new Error("algo rarísimo")).que, "desconocido");
});
