// Todo lo que define el instrumento, en un solo sitio.
//
// Es la unica pieza que sabe donde viven los ficheros de configuracion. Los
// servicios de src/services/ no leen disco a proposito: reciben esto como
// parametro, para que se puedan copiar dentro de la app sin arrastrar Node.
//
// **Los seis JSON de cargarRecursos() se importan, no se leen del disco.** Es
// deliberado: esta funcion tambien corre dentro de una Netlify Function, y alli
// el codigo se empaqueta en otra ruta y los ficheros sueltos no viajan con el.
// Con readFileSync funcionaba en el ordenador y petaba en produccion con un
// ENOENT. Importados, el empaquetador se los lleva dentro y no hay rutas que
// puedan romperse.
import { readFileSync } from "node:fs";

import questions from "../src/config/questions.json" with { type: "json" };
import facets from "../src/config/facets.json" with { type: "json" };
import domains from "../src/config/domains.json" with { type: "json" };
import labels from "../src/i18n/es-informe.json" with { type: "json" };
import textos from "../src/i18n/es-textos.json" with { type: "json" };
import rules from "../src/config/interpretation/combinations.json" with { type: "json" };
import facetas from "../src/config/interpretation/facetas.json" with { type: "json" };
import metaforas from "../src/config/interpretation/metaforas.json" with { type: "json" };
import fuentes from "../src/config/fuentes.json" with { type: "json" };
import marca from "../src/config/marca.json" with { type: "json" };

/**
 * Lee un JSON del proyecto por su ruta. Solo para herramientas de Node: lo que
 * tenga que correr empaquetado debe usar cargarRecursos().
 */
const leer = (rel) => JSON.parse(readFileSync(new URL("../" + rel, import.meta.url), "utf8"));

/** @returns {{config: object, labels: object, rules: object[]}} */
export function cargarRecursos() {
  return {
    config: { questions, facets, domains },
    labels,
    textos,
    rules,
    facetas,
    metaforas,
    fuentes,
    marca,
  };
}

/** Textos de los items y de la escala, para el test. */
export function cargarIdioma() {
  return leer("src/i18n/es.json");
}

/** El caso de ejemplo del Excel oficial, que hace de prueba de fuego. */
export function cargarEjemplo() {
  return leer("tests/fixtures/ejemplo-excel.json");
}

export { leer };
