// Carga desde disco todo lo que define el instrumento.
//
// Es la unica pieza que sabe donde viven los ficheros de configuracion. Los
// servicios de src/services/ no leen disco a proposito: reciben esto como
// parametro, para que se puedan copiar dentro de la app sin arrastrar Node.
import { readFileSync } from "node:fs";

const leer = (rel) => JSON.parse(readFileSync(new URL("../" + rel, import.meta.url), "utf8"));

/** @returns {{config: object, labels: object, rules: object[]}} */
export function cargarRecursos() {
  return {
    config: {
      questions: leer("src/config/questions.json"),
      facets: leer("src/config/facets.json"),
      domains: leer("src/config/domains.json"),
    },
    labels: leer("src/i18n/es-informe.json"),
    rules: leer("src/config/interpretation/combinations.json"),
    facetas: leer("src/config/interpretation/facetas.json"),
    metaforas: leer("src/config/interpretation/metaforas.json"),
    fuentes: leer("src/config/fuentes.json"),
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
