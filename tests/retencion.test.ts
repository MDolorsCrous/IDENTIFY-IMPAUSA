/**
 * Cuánto se guarda, y que la página diga lo mismo que hace el servidor.
 *
 * Hasta que se escribió la limpieza no se borraba nada nunca: cada informe se
 * quedaba en Netlify para siempre, con las respuestas y el nombre de quien lo
 * hizo. Estas pruebas cuidan las dos mitades de esa decisión: que el barrido
 * borre lo que toca y solo lo que toca, y que lo que se le promete a la persona
 * en pantalla sea el mismo plazo que aplica el código.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  caducados,
  cuotasViejas,
  diasQueSeGuardan,
  DIAS_POR_DEFECTO,
} from "../netlify/functions/limpieza.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIA = 24 * 60 * 60 * 1000;
const AHORA = Date.UTC(2026, 8, 5, 12, 0, 0);

test("el plazo por defecto es un año, y es el que dice la página", () => {
  assert.equal(DIAS_POR_DEFECTO, 365);
  assert.equal(diasQueSeGuardan({}), 365);

  // Si el número cambia, el texto tiene que cambiar con él: prometer un plazo y
  // aplicar otro es peor que no decir nada.
  const es = JSON.parse(readFileSync(join(raiz, "src/i18n/es-textos.json"), "utf8"));
  const en = JSON.parse(readFileSync(join(raiz, "src/i18n/en-textos.json"), "utf8"));
  assert.match(es.test.resultados.alPedirInforme, /un año/, "el castellano no dice el plazo");
  assert.match(en.test.resultados.alPedirInforme, /for a year/, "el inglés no dice el plazo");
  assert.match(es.test.informe.guardadoTexto, /un año/, "la tarjeta del enlace no dice el plazo");
  assert.match(en.test.informe.guardadoTexto, /for a year/, "la tarjeta del enlace no dice el plazo");
});

test("Netlify puede cambiar el plazo sin tocar el código", () => {
  assert.equal(diasQueSeGuardan({ DIAS_GUARDADOS: "90" }), 90);
  // Y una variable mal puesta no puede acabar borrándolo todo.
  for (const malo of ["", "0", "-3", "pronto", "NaN"]) {
    assert.equal(diasQueSeGuardan({ DIAS_GUARDADOS: malo }), DIAS_POR_DEFECTO, `«${malo}» ha colado`);
  }
});

test("se borra lo caducado, y nada más", () => {
  const fichas = [
    { id: "recien", cuando: AHORA - 1 * DIA },
    { id: "de-medio-año", cuando: AHORA - 180 * DIA },
    { id: "justo-al-filo", cuando: AHORA - 364 * DIA },
    { id: "de-hace-un-año-y-un-dia", cuando: AHORA - 366 * DIA },
    { id: "antiguo", cuando: AHORA - 900 * DIA },
  ];
  const fuera = caducados(fichas, 365, AHORA).map((f) => f.id);
  assert.deepEqual(fuera, ["de-hace-un-año-y-un-dia", "antiguo"]);
});

test("un informe sin fecha no se borra: la duda no se resuelve borrando", () => {
  const fichas = [{ id: "sin-fecha" }, { id: "fecha-rara", cuando: "ayer" }];
  assert.deepEqual(caducados(fichas as never, 365, AHORA), []);
});

test("los contadores de cuota viejos se van, y solo ellos", () => {
  const claves = ["2026-09-05", "2026-09-01", "2026-07-01", "2025-12-31", "no-es-una-fecha"];
  assert.deepEqual(cuotasViejas(claves, AHORA), ["2026-07-01", "2025-12-31"]);
});

test("la persona puede retirar su informe, con la misma llave con la que lo abre", () => {
  const olvidar = readFileSync(join(raiz, "netlify/functions/olvidar.mjs"), "utf8");
  // El código se comprueba en tiempo constante, igual que en las otras puertas.
  assert.match(olvidar, /timingSafeEqual/, "el código se compara sin cuidado");
  assert.match(olvidar, /mismoCodigo\(cuerpo\.codigo, process\.env\.CODIGO_ACCESO\)/, "no se pide el código");
  assert.match(olvidar, /getStore\(ALMACEN\)\.delete\(id\)/, "no borra nada");

  // Y la página lo ofrece, preguntando antes: borrar no se deshace.
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  assert.match(pagina, /id="borrarInforme"/, "no hay manera de borrar el informe desde la pantalla");
  assert.match(pagina, /window\.confirm\(T\.informe\.borrarConfirma\)/, "se borraría sin preguntar");
  assert.match(pagina, /"\/api\/olvidar"/, "la página no llama a la función de borrado");
});

test("la limpieza no es una dirección que nadie pueda visitar", () => {
  const toml = readFileSync(join(raiz, "netlify.toml"), "utf8");
  assert.ok(
    !/to = "\/\.netlify\/functions\/limpieza"/.test(toml),
    "la limpieza tiene redirección pública: la dispara el programador, no una visita",
  );
  assert.match(toml, /from = "\/api\/olvidar"/, "falta la ruta de /api/olvidar");

  const limpieza = readFileSync(join(raiz, "netlify/functions/limpieza.mjs"), "utf8");
  assert.match(limpieza, /export const config = \{ schedule: "0 4 \* \* \*" \}/, "la limpieza no está programada");
});
