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
  const opciones = {
    facetas: recursos.facetas,
    metaforas: recursos.metaforas,
    fuentes: recursos.fuentes,
    fecha: "1 de enero de 2026",
  };

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

test("la página web pide la redacción al servidor, y le manda las respuestas", () => {
  // La decisión que sostiene el endpoint: viajan las 60 respuestas, no el
  // perfil ya montado. Si algún día se mandara el perfil, cualquiera con el
  // código podría pedirle a Claude lo que quisiera con la tarjeta de otro.
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  assert.ok(pagina.includes("/api/redactar"), "la página no llama a la función");
  assert.ok(
    pagina.includes("JSON.stringify({ id, codigo, respuestas, persona })"),
    "lo que se manda al servidor ha cambiado: revísalo, es la defensa del endpoint",
  );
  // La redacción tarda más de lo que Netlify deja vivir una función, así que va
  // en segundo plano y el resultado se recoge aparte.
  assert.ok(pagina.includes("/api/resultado"), "la página no va a buscar el resultado");
  // Y ni el código de acceso ni la clave pueden estar en algo que se publica.
  for (const prohibido of ["CODIGO_ACCESO", "ANTHROPIC_API_KEY", "sk-ant"]) {
    assert.ok(!pagina.includes(prohibido), `la página lleva «${prohibido}»`);
  }
});

test("la portada ofrece los tres idiomas y explica los dos que faltan", () => {
  // Este texto es la política del proyecto, no decoración: dice por qué el test
  // no está en catalán —no hay adaptación oficial del BFI-2— y por qué eso es
  // una decisión de rigor. Si desaparece, la herramienta vuelve a parecer
  // descuidada en vez de honesta.
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  for (const idioma of [">ES<", ">CA<", ">EN<"]) {
    assert.ok(pagina.includes(idioma), `falta ${idioma} en el selector`);
  }
  assert.ok(pagina.includes("Per què aquest test no és en català"), "falta la explicación en catalán");
  assert.ok(pagina.includes("no n'hi ha"), "la explicación ya no dice que no existe adaptación");
  assert.ok(pagina.includes("English is on the way"), "falta la explicación en inglés");
  assert.ok(pagina.includes("<dialog"), "las explicaciones no se abren en un panel");
});

test("la puerta pregunta el código al servidor, nunca lo lleva dentro", () => {
  // Si la página comprobara el código ella misma tendría que llevarlo, y quien
  // abriera el código fuente lo vería: la puerta dejaría de ser una puerta.
  // Por eso hay una función que lo valida y aquí solo viaja la respuesta.
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  assert.ok(pagina.includes('id="puerta"'), "no hay pantalla de entrada");
  assert.ok(pagina.includes("/api/entrar"), "la puerta no pregunta al servidor");
  assert.ok(
    pagina.includes('id="empezar"'),
    "el fichero local se quedaría sin forma de empezar: ahí no hay puerta",
  );
  for (const prohibido of ["CODIGO_ACCESO", "process.env"]) {
    assert.ok(!pagina.includes(prohibido), `la página lleva «${prohibido}»`);
  }
});

test("el fichero local dice por qué no puede redactar solo", () => {
  // El fichero local y la web se parecen tanto que es fácil probar uno creyendo
  // que estás en el otro: sin puerta, sin botón de generar y con el informe
  // pendiente, todo parece roto cuando en realidad está funcionando como debe.
  // Nos costó una tarde averiguarlo. Este aviso es para que no vuelva a pasar.
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  assert.ok(
    pagina.includes("Este fichero no puede redactar el informe solo"),
    "falta el aviso que distingue el fichero local de la web",
  );
  assert.ok(pagina.includes("ábrelo en la web"), "el aviso no dice a dónde ir");
});
