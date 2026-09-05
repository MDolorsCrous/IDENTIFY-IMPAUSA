/**
 * La sección 5: las combinaciones que se cumplen.
 *
 * `docs/03` la llama «la parte que justifica el informe entero», y hasta ahora
 * salía sin una sola línea escrita para esta persona: el efecto y el resumen
 * vienen de `combinations.json` y son iguales para todo el que dispare la misma
 * regla. Ahora Claude escribe un pasaje por regla, y estas pruebas cuidan las
 * dos mitades: que se le pida bien, y que lo que devuelva se mire.
 *
 * **Ningún perfil guardado dispara ninguna regla** —ni el ejemplo del Excel, ni
 * los de `datos/`—, así que aquí se construye uno que sí. Sin él, la sección no
 * se probaba nunca.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { construirModelo } from "../src/services/pipeline.ts";
import {
  esquemaSalida,
  materialParaRedactar,
  validarProsa,
  avisosDeLongitud,
  avisosDeContenido,
  claveDeCombinacion,
} from "../src/services/prompt.ts";
import { renderInforme } from "../src/services/render-informe.js";
import { cargarRecursos, cargarEjemplo } from "../tools/recursos.mjs";
import type { Responses } from "../src/services/scoring.ts";

const recursos = cargarRecursos();

/**
 * Un perfil que dispara reglas.
 *
 * Sociabilidad y compasión altas con depresión baja: disparan
 * «relaciones-positivas» y «orientación-prosocial». Los ítems inversos se
 * contestan al revés para que la faceta puntúe donde se quiere.
 */
function perfilQueDispara(altas: string[], bajas: string[]): Responses {
  const r: Record<number, number> = {};
  for (const q of recursos.config.questions) {
    const quiero = altas.includes(q.facet) ? 5 : bajas.includes(q.facet) ? 1 : 3;
    r[q.id] = q.reverse ? 6 - quiero : quiero;
  }
  return r as Responses;
}

const modelo = construirModelo(
  perfilQueDispara(["sociability", "compassion"], ["depression"]),
  recursos,
);
const ids = modelo.fired.map((m) => m.rule.id);
const claves = ids.map(claveDeCombinacion);

const modeloSinReglas = construirModelo(
  Object.fromEntries(
    Object.entries(cargarEjemplo().responses).map(([k, v]) => [Number(k), v]),
  ) as Responses,
  recursos,
);

/** Una redacción completa, para poder quitarle cosas y ver qué se queja. */
const parrafo = (n: number) => Array.from({ length: n }, (_, i) => `palabra${i}`).join(" ");
function redaccionEntera(m = modelo): Record<string, any> {
  return {
    titular: "Un titular corto",
    perfilEnUnaFrase: parrafo(130),
    dominios: Object.fromEntries(m.domains.map((d) => [d.id, parrafo(95)])),
    combinaciones: Object.fromEntries(m.fired.map((x) => [claveDeCombinacion(x.rule.id), parrafo(100)])),
    enElTrabajo: parrafo(220),
    preguntas: ["a", "b", "c", "d", "e"],
    planAccion: {
      paso1: { titulo: "t", texto: "x", indicador: "i" },
      paso2: { titulo: "t", texto: "x", indicador: "i" },
      paso3: { titulo: "t", texto: "x", indicador: "i" },
    },
    conclusion: parrafo(100),
  };
}

test("el perfil de prueba dispara reglas de verdad", () => {
  // Si algún día deja de dispararlas, el resto de este fichero deja de probar
  // nada sin fallar: comprobarlo aquí es lo que lo impide.
  assert.ok(modelo.fired.length >= 2, `el perfil de prueba dispara ${modelo.fired.length} reglas`);
  assert.equal(modeloSinReglas.fired.length, 0, "el ejemplo del Excel ya dispara alguna");
});

test("el esquema pide un pasaje por cada combinación disparada", () => {
  const e = esquemaSalida(modelo) as any;
  assert.ok(e.required.includes("combinaciones"), "«combinaciones» no es obligatorio");
  assert.deepEqual(e.properties.combinaciones.required, claves, "no pide exactamente las que han disparado");
  assert.equal(e.properties.combinaciones.additionalProperties, false, "acepta claves de más");
  // Va donde va la sección: después de los dominios, antes de «en el trabajo».
  assert.ok(
    e.required.indexOf("combinaciones") > e.required.indexOf("dominios"),
    "el orden del esquema no sigue al del informe",
  );
});

test("sin reglas disparadas, el esquema no pide un objeto vacío", () => {
  const e = esquemaSalida(modeloSinReglas) as any;
  assert.ok(!e.required.includes("combinaciones"), "pide combinaciones que no existen");
  assert.equal(e.properties.combinaciones, undefined, "deja la clave puesta sin nada dentro");
});

test("las 26 reglas dan 26 claves distintas", () => {
  // La clave es el id con los guiones cambiados por barras bajas, porque la
  // documentación de los esquemas estructurados no dice qué caracteres admite
  // un nombre de propiedad. Si dos reglas colisionaran, un pasaje pisaría al
  // otro sin que nada fallara — y eso no se vería nunca.
  const todas = (recursos.rules as { id: string }[]).map((r) => r.id);
  assert.ok(todas.length >= 26, `solo hay ${todas.length} reglas`);
  const claves = todas.map(claveDeCombinacion);
  assert.equal(new Set(claves).size, claves.length, "dos reglas comparten clave");
  for (const c of claves) assert.match(c, /^[A-Za-z0-9_]+$/, `«${c}» no vale como nombre de propiedad`);
});

test("el material dice la clave de cada regla y por qué se ha cumplido", () => {
  const m = materialParaRedactar(modelo, recursos.facetas) as any;
  const reglas = m.reglasQueHanDisparado;
  assert.equal(reglas.length, modelo.fired.length);
  for (const r of reglas) {
    // La clave es la llave con la que hay que devolver el pasaje: sin ella,
    // Claude no puede saber bajo qué nombre escribir.
    assert.ok(claves.includes(r.clave), `una regla sin clave reconocible: ${JSON.stringify(r)}`);
    assert.ok(Array.isArray(r.seCumplePor) && r.seCumplePor.length, "no dice qué la ha hecho saltar");
    for (const c of r.seCumplePor) {
      assert.equal(typeof c.faceta, "string");
      assert.equal(typeof c.banda, "string");
    }
  }
});

test("una redacción sin la lectura de una combinación no pasa", () => {
  assert.deepEqual(validarProsa(redaccionEntera(), modelo), []);

  const sinUna = redaccionEntera();
  delete sinUna.combinaciones[claves[0]];
  const fallos = validarProsa(sinUna, modelo);
  assert.equal(fallos.length, 1);
  assert.match(fallos[0], /falta la lectura de la combinación/);

  const sinNinguna = redaccionEntera();
  delete sinNinguna.combinaciones;
  assert.equal(validarProsa(sinNinguna, modelo).length, modelo.fired.length);

  // Y una cadena vacía no cuenta como escrita.
  const vacia = redaccionEntera();
  vacia.combinaciones[claves[0]] = "   ";
  assert.equal(validarProsa(vacia, modelo).length, 1);
});

test("una redacción vieja, de un perfil sin reglas, sigue valiendo", () => {
  // Las redacciones guardadas en datos/ son de perfiles que no disparan nada.
  // Si esto fallara, habría que volver a pagarlas para regenerar su informe.
  const vieja = redaccionEntera(modeloSinReglas);
  delete vieja.combinaciones;
  assert.deepEqual(validarProsa(vieja, modeloSinReglas), []);
});

test("una combinación corta o larga se avisa, sin invalidar nada", () => {
  const corta = redaccionEntera();
  corta.combinaciones[claves[0]] = parrafo(30);
  const avisos = avisosDeLongitud(corta, modelo);
  assert.ok(avisos.some((a) => a.includes(ids[0]) && a.includes("30 palabras")), avisos.join(" · "));
  assert.deepEqual(validarProsa(corta, modelo), [], "una longitud rara no puede invalidar");
});

test("se avisa de lo que este instrumento no puede afirmar", () => {
  const casos: [string, RegExp][] = [
    ["Estás en el percentil 80 de la población.", /percentil/i],
    ["Un 25 % de las personas puntúa así.", /porcentaje/],
    ["Esto apunta a un trastorno de ansiedad.", /diagnóstico/],
    ["Eres una persona dominante.", /etiqueta/],
    ["Puntúas más que el resto del equipo.", /compara/],
  ];
  for (const [frase, espera] of casos) {
    const p = redaccionEntera();
    p.conclusion = frase;
    const avisos = avisosDeContenido(p, modelo);
    assert.ok(avisos.some((a) => espera.test(a)), `«${frase}» no ha saltado: ${avisos.join(" · ")}`);
  }
});

test("se avisa de las cifras que no salen del perfil", () => {
  const p = redaccionEntera();
  // 4,73 no es ninguna puntuación de este perfil.
  p.enElTrabajo = "Tu Sociabilidad está en 4,73 y eso pesa.";
  const avisos = avisosDeContenido(p, modelo);
  assert.ok(avisos.some((a) => a.includes("4,73")), avisos.join(" · "));

  // Y una puntuación de verdad no salta.
  const real = redaccionEntera();
  const puntuacion = modelo.domains[0].score.toFixed(2).replace(".", ",");
  real.enElTrabajo = `Tu ${modelo.domains[0].label} está en ${puntuacion}.`;
  assert.deepEqual(
    avisosDeContenido(real, modelo).filter((a) => a.includes("cifras")),
    [],
    "una puntuación del propio perfil se ha marcado como inventada",
  );
});

test("una redacción limpia no dispara ningún aviso", () => {
  // La red no puede saltar sola: si avisara de todo, no avisaría de nada.
  assert.deepEqual(avisosDeContenido(redaccionEntera(), modelo), []);
});

test("el informe imprime la lectura de cada combinación, o dice que falta", () => {
  const opciones = {
    facetas: recursos.facetas,
    textos: recursos.textos.informe,
    metaforas: recursos.metaforas,
    fuentes: recursos.fuentes,
    marca: recursos.marca,
    fecha: "5 de septiembre de 2026",
  };

  const con = renderInforme(modelo, redaccionEntera(), recursos.labels, opciones);
  assert.ok(con.includes("combi__lectura"), "la sección no tiene sitio para la lectura");
  assert.ok(con.includes("palabra42"), "no se imprime lo que ha escrito Claude");

  const sin = renderInforme(modelo, {}, recursos.labels, opciones);
  assert.ok(
    sin.includes(recursos.textos.informe.huecos.combinacion),
    "sin redacción, la sección no dice qué falta",
  );
});
