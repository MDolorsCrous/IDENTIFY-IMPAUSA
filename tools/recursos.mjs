// Todo lo que define el instrumento, en un solo sitio.
//
// Es la unica pieza que sabe donde viven los ficheros de configuracion. Los
// servicios de src/services/ no leen disco a proposito: reciben esto como
// parametro, para que se puedan copiar dentro de la app sin arrastrar Node.
//
// **Los JSON de cargarRecursos() se importan, no se leen del disco.** Es
// deliberado: esta funcion tambien corre dentro de una Netlify Function, y alli
// el codigo se empaqueta en otra ruta y los ficheros sueltos no viajan con el.
// Con readFileSync funcionaba en el ordenador y petaba en produccion con un
// ENOENT. Importados, el empaquetador se los lleva dentro y no hay rutas que
// puedan romperse.
//
// **Nada que el motor use para calcular o decidir se duplica por idioma.** Las
// condiciones, los ids y las citas viven una sola vez en los ficheros neutros;
// la prosa (el significado, la redaccion) vive en los .es.json —y manana en los
// .en.json—. cargarRecursos(idioma) los vuelve a juntar aqui, con la MISMA
// forma que tenian antes de partirse: nadie aguas abajo nota la costura.
import { readFileSync } from "node:fs";

import questions from "../src/config/questions.json" with { type: "json" };
import facets from "../src/config/facets.json" with { type: "json" };
import domains from "../src/config/domains.json" with { type: "json" };
import rules from "../src/config/interpretation/combinations.json" with { type: "json" };
import facetas from "../src/config/interpretation/facetas.json" with { type: "json" };
import metaforas from "../src/config/interpretation/metaforas.json" with { type: "json" };
import fuentes from "../src/config/fuentes.json" with { type: "json" };
import marca from "../src/config/marca.json" with { type: "json" };

import labelsEs from "../src/i18n/es-informe.json" with { type: "json" };
import textosEs from "../src/i18n/es-textos.json" with { type: "json" };
import reglasEs from "../src/config/interpretation/combinations.es.json" with { type: "json" };
import facetasEs from "../src/config/interpretation/facetas.es.json" with { type: "json" };
import metaforasEs from "../src/config/interpretation/metaforas.es.json" with { type: "json" };
import fuentesEs from "../src/config/fuentes.es.json" with { type: "json" };

/** La capa de cada idioma. El ingles se anade aqui cuando exista (fase 4+). */
const IDIOMAS = {
  es: {
    labels: labelsEs,
    textos: textosEs,
    reglas: reglasEs,
    facetas: facetasEs,
    metaforas: metaforasEs,
    fuentes: fuentesEs,
  },
};

/** Reconstruye cada regla con la prosa de su idioma, en el orden de siempre. */
function mezclarReglas(idioma) {
  return rules.map((r) => {
    const p = idioma.reglas[r.id];
    if (!p) throw new Error(`la regla «${r.id}» no tiene prosa en este idioma`);
    const regla = {
      id: r.id,
      effect: p.effect,
      conditions: r.conditions,
      summary: p.summary,
      scope: p.scope,
      evidence: p.evidence,
    };
    if (r.safety) regla.safety = r.safety;
    regla.references = r.references;
    regla.sourceSlides = r.sourceSlides;
    regla.appearsIn = r.appearsIn;
    if (r.revision) regla.revision = r.revision;
    return regla;
  });
}

/** Reconstruye las fichas de faceta: definicion y lecturas del idioma, citas neutras. */
function mezclarFacetas(idioma) {
  const salida = {};
  for (const [id, v] of Object.entries(facetas)) {
    if (id.startsWith("_")) { salida[id] = v; continue; }
    const p = idioma.facetas[id];
    if (!p) throw new Error(`la faceta «${id}» no tiene prosa en este idioma`);
    salida[id] = {
      definicion: p.definicion,
      bajo: { texto: p.bajo, referencias: v.bajo.referencias },
      alto: { texto: p.alto, referencias: v.alto.referencias },
      sourceSlides: v.sourceSlides,
    };
  }
  return salida;
}

/** Reconstruye las metaforas: el mapa es neutro, las imagenes son del idioma. */
function mezclarMetaforas(idioma) {
  return { ...metaforas, categorias: idioma.metaforas.categorias };
}

/** Reconstruye las fuentes: la referencia es neutra, el papel es del idioma. */
function mezclarFuentes(idioma) {
  const conPapel = (f) => {
    const papel = idioma.fuentes.papeles[f.cita];
    if (!papel) throw new Error(`la fuente «${f.cita}» no tiene papel en este idioma`);
    return { ...f, papel };
  };
  return {
    _nota: fuentes._nota,
    _atribucion: idioma.fuentes._atribucion,
    instrumento: conPapel(fuentes.instrumento),
    adaptacion: conPapel(fuentes.adaptacion),
    interpretacion: fuentes.interpretacion.map(conPapel),
  };
}

/**
 * Lee un JSON del proyecto por su ruta. Solo para herramientas de Node: lo que
 * tenga que correr empaquetado debe usar cargarRecursos().
 */
const leer = (rel) => JSON.parse(readFileSync(new URL("../" + rel, import.meta.url), "utf8"));

/** @returns {{config: object, labels: object, textos: object, rules: object[]}} */
export function cargarRecursos(idioma = "es") {
  const capa = IDIOMAS[idioma];
  if (!capa) throw new Error(`no hay textos para el idioma «${idioma}»: hay ${Object.keys(IDIOMAS).join(", ")}`);
  return {
    config: { questions, facets, domains },
    labels: capa.labels,
    textos: capa.textos,
    rules: mezclarReglas(capa),
    facetas: mezclarFacetas(capa),
    metaforas: mezclarMetaforas(capa),
    fuentes: mezclarFuentes(capa),
    marca,
  };
}

/** Textos de los items y de la escala, para el test. */
export function cargarIdioma(idioma = "es") {
  return leer(`src/i18n/${idioma}.json`);
}

/** El caso de ejemplo del Excel oficial, que hace de prueba de fuego. */
export function cargarEjemplo() {
  return leer("tests/fixtures/ejemplo-excel.json");
}

export { leer };
