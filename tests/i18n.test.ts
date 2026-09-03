/**
 * La costura entre la estructura y la prosa por idioma.
 *
 * La fase 2 del plan del inglés partió la interpretación en dos: lo que el
 * motor usa para calcular (condiciones, ids, citas) vive una sola vez en los
 * ficheros neutros, y la prosa vive en los .es.json. Estas pruebas cuidan que
 * ningún idioma pierda una pieza: cada id de la estructura tiene su prosa y
 * ninguna prosa apunta a un id que no exista. Cuando llegue el inglés, se
 * añade su idioma a la lista y las mismas pruebas lo cubren.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { cargarRecursos, cargarIdioma } from "../tools/recursos.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

const IDIOMAS = ["es"];

const reglas = leer("src/config/interpretation/combinations.json") as { id: string }[];
const fichas = leer("src/config/interpretation/facetas.json") as Record<string, unknown>;
const metaforas = leer("src/config/interpretation/metaforas.json");
const fuentes = leer("src/config/fuentes.json");

for (const idioma of IDIOMAS) {
  test(`cada regla tiene su prosa en «${idioma}», y ninguna prosa sobra`, () => {
    const prosa = leer(`src/config/interpretation/combinations.${idioma}.json`) as Record<string, any>;
    for (const r of reglas) {
      const p = prosa[r.id];
      assert.ok(p, `la regla «${r.id}» no tiene prosa`);
      for (const campo of ["effect", "summary", "scope", "evidence"]) {
        assert.ok(p[campo], `a «${r.id}» le falta ${campo}`);
      }
    }
    const ids = new Set(reglas.map((r) => r.id));
    for (const id of Object.keys(prosa)) {
      assert.ok(ids.has(id), `la prosa de «${id}» no corresponde a ninguna regla`);
    }
  });

  test(`cada faceta tiene su prosa en «${idioma}», y ninguna prosa sobra`, () => {
    const prosa = leer(`src/config/interpretation/facetas.${idioma}.json`) as Record<string, any>;
    const ids = Object.keys(fichas).filter((k) => !k.startsWith("_"));
    for (const id of ids) {
      const p = prosa[id];
      assert.ok(p, `la faceta «${id}» no tiene prosa`);
      for (const campo of ["definicion", "bajo", "alto"]) {
        assert.ok(p[campo], `a «${id}» le falta ${campo}`);
      }
    }
    for (const id of Object.keys(prosa)) {
      assert.ok(ids.includes(id), `la prosa de «${id}» no corresponde a ninguna faceta`);
    }
  });

  test(`cada categoría del mapa de metáforas existe en «${idioma}»`, () => {
    const prosa = leer(`src/config/interpretation/metaforas.${idioma}.json`);
    const usadas = new Set(
      Object.values(metaforas.mapa as Record<string, { bajo: string[]; alto: string[] }>)
        .flatMap((n) => [...n.bajo, ...n.alto]),
    );
    for (const id of usadas) {
      const c = prosa.categorias[id];
      assert.ok(c, `el mapa usa la categoría «${id}» y el idioma no la tiene`);
      assert.ok(c.nombre && c.metaforas?.length, `la categoría «${id}» está vacía`);
    }
  });

  test(`cada fuente tiene su papel en «${idioma}»`, () => {
    const prosa = leer(`src/config/fuentes.${idioma}.json`);
    assert.ok(prosa._atribucion, "falta la atribución");
    const entradas = [fuentes.instrumento, fuentes.adaptacion, ...fuentes.interpretacion];
    for (const f of entradas) {
      assert.ok(prosa.papeles[f.cita], `la fuente «${f.cita}» no tiene papel`);
    }
    const citas = new Set(entradas.map((f: any) => f.cita));
    for (const cita of Object.keys(prosa.papeles)) {
      assert.ok(citas.has(cita), `el papel de «${cita}» no corresponde a ninguna fuente`);
    }
  });
}

test("la estructura no lleva prosa: ni resúmenes ni lecturas en los ficheros neutros", () => {
  // Si alguien vuelve a escribir un summary en combinations.json o un texto en
  // facetas.json, habrá dos versiones que un día divergirán sin que nadie lo note.
  for (const r of reglas as any[]) {
    assert.equal(r.summary, undefined, `«${r.id}» lleva summary en el fichero neutro`);
    assert.equal(r.effect, undefined, `«${r.id}» lleva effect en el fichero neutro`);
  }
  for (const [id, v] of Object.entries(fichas) as [string, any][]) {
    if (id.startsWith("_")) continue;
    assert.equal(v.definicion, undefined, `«${id}» lleva definicion en el fichero neutro`);
    assert.equal(v.bajo?.texto, undefined, `«${id}» lleva texto en el fichero neutro`);
  }
  assert.equal(metaforas.categorias, undefined, "metaforas.json lleva las categorías dentro");
});

test("cargarRecursos rechaza un idioma que no existe", () => {
  // Ojo: el cuestionario (en.json) y la interfaz (en-textos, en-informe) ya
  // existen, pero la capa de interpretación inglesa todavía no; cargarRecursos("en")
  // debe seguir fallando hasta la fase 5.
  assert.throws(() => cargarRecursos("en" as any), /no hay textos para el idioma/);
});

// ---- La interfaz en inglés (fase 4): misma estructura, mismos huecos ----

/**
 * Compara la ESTRUCTURA de dos árboles de textos: mismas claves, mismos tipos,
 * listas del mismo largo y los mismos huecos {asi} en cada cadena. El contenido
 * es libre —es otra lengua—; la forma no. Las claves que empiezan por "_" son
 * notas de mantenimiento y no cuentan.
 */
function compararEstructura(es: unknown, en: unknown, ruta: string, fallos: string[]) {
  if (typeof es === "string") {
    if (typeof en !== "string") { fallos.push(`${ruta}: no es una cadena en inglés`); return; }
    const huecos = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
    if (huecos(es) !== huecos(en)) {
      fallos.push(`${ruta}: los huecos no coinciden («${huecos(es)}» vs «${huecos(en)}»)`);
    }
    if (!en.trim()) fallos.push(`${ruta}: vacío en inglés`);
    return;
  }
  if (Array.isArray(es)) {
    if (!Array.isArray(en) || en.length !== es.length) {
      fallos.push(`${ruta}: la lista inglesa no tiene ${es.length} elementos`);
      return;
    }
    es.forEach((v, i) => compararEstructura(v, (en as unknown[])[i], `${ruta}[${i}]`, fallos));
    return;
  }
  if (es && typeof es === "object") {
    if (!en || typeof en !== "object" || Array.isArray(en)) { fallos.push(`${ruta}: no es un objeto en inglés`); return; }
    const clavesEs = Object.keys(es).filter((k) => !k.startsWith("_")).sort();
    const clavesEn = Object.keys(en).filter((k) => !k.startsWith("_")).sort();
    for (const k of clavesEs) if (!clavesEn.includes(k)) fallos.push(`${ruta}.${k}: falta en inglés`);
    for (const k of clavesEn) if (!clavesEs.includes(k)) fallos.push(`${ruta}.${k}: sobra en inglés`);
    for (const k of clavesEs) {
      if (clavesEn.includes(k)) {
        compararEstructura((es as any)[k], (en as any)[k], `${ruta}.${k}`, fallos);
      }
    }
  }
}

test("en-textos.json calca la estructura de es-textos.json, huecos incluidos", () => {
  const fallos: string[] = [];
  compararEstructura(leer("src/i18n/es-textos.json"), leer("src/i18n/en-textos.json"), "textos", fallos);
  assert.deepEqual(fallos, []);
});

test("en-informe.json calca la estructura de es-informe.json", () => {
  const fallos: string[] = [];
  compararEstructura(leer("src/i18n/es-informe.json"), leer("src/i18n/en-informe.json"), "informe", fallos);
  assert.deepEqual(fallos, []);
});

test("los dos idiomas nombran las cuatro bandas del motor y los dos avisos de comparación", () => {
  for (const fichero of ["src/i18n/es-informe.json", "src/i18n/en-informe.json"]) {
    const labels = leer(fichero);
    assert.deepEqual(
      Object.keys(labels.bandas).sort(),
      ["alta", "baja", "media-alta", "media-baja"],
      `${fichero}: las claves de bandas no son los ids del motor`,
    );
    for (const banda of Object.values(labels.bandas)) assert.ok((banda as string).length > 1);
    assert.ok(labels.avisoComparacion.escala.length > 20, `${fichero}: falta el aviso de escala`);
    assert.ok(labels.avisoComparacion.baremo.length > 20, `${fichero}: falta el aviso de baremo`);
  }
});

// ---- El cuestionario en inglés (fase 3): los ítems oficiales y su costura ----

const esIdioma = leer("src/i18n/es.json");
const enIdioma = leer("src/i18n/en.json");
const oficialesEn = leer("src/config/enunciados-oficiales-en.json");
const preguntas = leer("src/config/questions.json") as { id: number }[];

test("los 60 enunciados ingleses visibles son los del apéndice oficial", () => {
  // La fuente es el apéndice de Soto & John (2017), transcrito y verificado por
  // tres vías en docs/bfi2-form-en.md. Si en.json se aparta de ahí, se rompe.
  for (let n = 1; n <= 60; n++) {
    assert.ok(oficialesEn.oficiales[n], `falta el enunciado oficial ${n}`);
    assert.equal(enIdioma.questions[n], oficialesEn.enunciados[n], `el ítem ${n} no coincide con el oficial`);
  }
});

test("los enunciados ingleses solo se apartan del oficial si lo declaran", () => {
  // Mismo contrato que el español: hoy no hay desviaciones, y si un día las hay,
  // van declaradas con su motivo.
  const declaradas = new Set(oficialesEn.desviaciones.map((d: { item: number }) => String(d.item)));
  for (let n = 1; n <= 60; n++) {
    const oficial = oficialesEn.oficiales[n];
    const mostrado = oficialesEn.enunciados[n];
    if (declaradas.has(String(n))) {
      assert.notEqual(mostrado, oficial, `el ítem ${n} está declarado como desviación y no lo es`);
    } else {
      assert.equal(mostrado, oficial, `el ítem ${n} se aparta del oficial sin declararlo`);
    }
  }
  for (const d of oficialesEn.desviaciones) {
    assert.ok(d.motivo?.length > 15, `la desviación del ítem ${d.item} no explica por qué`);
  }
});

test("es.json y en.json cubren los mismos 60 ítems, la misma escala y las mismas etiquetas", () => {
  const ids = preguntas.map((q) => String(q.id)).sort();
  for (const [nombre, idioma] of [["es", esIdioma], ["en", enIdioma]] as const) {
    assert.deepEqual(Object.keys(idioma.questions).sort(), ids, `${nombre}.json no cubre exactamente los 60 ítems`);
    assert.deepEqual(Object.keys(idioma.scale).sort(), ["1", "2", "3", "4", "5"], `${nombre}.json: la escala no es 1-5`);
    assert.ok(idioma.stem.length > 0, `${nombre}.json no tiene enunciado introductorio`);
    for (const [n, texto] of Object.entries(idioma.questions)) {
      assert.ok((texto as string).trim().length > 3, `${nombre}.json: el ítem ${n} está vacío`);
    }
  }
  assert.deepEqual(Object.keys(enIdioma.domains).sort(), Object.keys(esIdioma.domains).sort(), "dominios distintos entre idiomas");
  assert.deepEqual(Object.keys(enIdioma.facets).sort(), Object.keys(esIdioma.facets).sort(), "facetas distintas entre idiomas");
});

test("cargarIdioma('en') carga el cuestionario inglés", () => {
  const en = cargarIdioma("en");
  assert.equal(Object.keys(en.questions).length, 60);
  assert.equal(en.scale["1"], "Disagree strongly");
  assert.equal(en.scale["5"], "Agree strongly");
});
