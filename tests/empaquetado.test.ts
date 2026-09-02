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
import { paginaDeInicio } from "../src/pagina/portada.mjs";
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

test("el informe se abre ya y la redacción arranca sola", () => {
  // Antes había una pantalla de espera en blanco de más de un minuto. Ahora el
  // informe se ve desde el primer segundo con todo lo que calcula el código, y
  // los pasajes de coaching se rellenan cuando llegan.
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  assert.ok(pagina.includes("!conProsa && !yaPedida"), "la redacción no arranca sola");
  assert.ok(pagina.includes("Claude está redactando"), "no se avisa de que se está redactando");
  // El aviso va en una tarjeta fija con su barra: el que estaba en la barra de
  // arriba pasaba desapercibido y la gente no sabia si estaba pasando algo.
  assert.ok(pagina.includes('class="trabajando"'), "el aviso no está en su tarjeta");
  assert.ok(pagina.includes("barraProgreso"), "la tarjeta no lleva barra de avance");
  // Y solo una vez: si se pidiera en cada dibujo, se pagaría varias veces.
  assert.ok(pagina.includes("yaPedida = true"), "nada impide pedirla dos veces");
  assert.ok(!pagina.includes("Redactando tu informe"), "queda la pantalla de espera vieja");
});

test("la pantalla de inicio dice lo que el motor calcula de verdad", () => {
  // Lo que la portada afirma sobre el instrumento tiene que salir de los mismos
  // datos que usa el motor, no de lo que alguien recordara al escribirla. Si un
  // día cambia el número de ítems o el nombre de una faceta, esto se pone rojo.
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  const recursos = cargarRecursos();

  const inicio = paginaDeInicio(recursos);
  assert.ok(inicio.includes("60 ítems"), "no dice cuántos ítems tiene");
  assert.ok(pagina.includes("60 ítems"), "el texto no llega a la página");
  assert.equal(recursos.config.questions.length, 60, "ya no son 60 ítems");
  assert.equal(recursos.config.facets.length, 15);
  assert.equal(recursos.config.domains.length, 5);

  // Los cinco dominios y las quince facetas, con el nombre que usa el informe.
  for (const d of recursos.config.domains) {
    assert.ok(inicio.includes(recursos.labels.domains[d.id]), `falta ${d.id}`);
  }
  for (const f of recursos.config.facets) {
    assert.ok(inicio.includes(recursos.labels.facets[f.id]), `falta la faceta ${f.id}`);
  }

  // El acrónimo y el instrumento son cosas distintas, y la pantalla lo dice.
  assert.ok(inicio.includes("Big Five/OCEAN"), "no nombra el modelo");
  assert.ok(inicio.includes("Big Five Inventory-2"), "no nombra el instrumento");
  assert.ok(inicio.includes("BFI-2 © Oliver P. John y Christopher J. Soto"), "falta la atribución");
  for (const doi of [recursos.fuentes.instrumento.doi, recursos.fuentes.adaptacion.doi]) {
    assert.ok(inicio.includes(doi), `falta el DOI ${doi}`);
  }
});

test("la pantalla de inicio no promete lo que el test no puede dar", () => {
  // Las bandas de este informe salen de la escala, no de una muestra normativa.
  // Decir «percentil» o «por encima de la media» sería anunciar algo que no se
  // calcula. Y el determinismo es la otra forma fácil de mentir aquí.
  const inicio = paginaDeInicio(cargarRecursos());

  // «Percentil» a secas no vale como prohibida: la pantalla dice, y tiene que
  // decir, que este informe NO usa percentiles normativos. Lo que no puede
  // aparecer es la afirmación de una comparación que nadie ha calculado.
  const prohibidas = [
    "perteneces al percentil", "estás en el percentil", "por encima del",
    "superas a la media", "comparado con la población",
    "100% fiable", "100% científico", "infalible", "garantiza", "predice exactamente",
    "define quién eres", "descubre quién eres", "tu verdadera personalidad", "avalado por",
  ];
  // Negadas sí valen —y hacen falta: «no predice exactamente lo que vas a
  // hacer» es justo lo que hay que decir. Lo que se busca es la afirmación.
  const texto = inicio.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
  for (const frase of prohibidas) {
    let i = texto.indexOf(frase.toLowerCase());
    while (i !== -1) {
      const antes = texto.slice(Math.max(0, i - 4), i);
      assert.ok(/\bno $/.test(antes), `la pantalla afirma «${frase}»`);
      i = texto.indexOf(frase.toLowerCase(), i + 1);
    }
  }

  // Y sí dice lo que hay que decir.
  for (const debe of ["No es un diagnóstico", "no utiliza percentiles normativos", "más prudencia"]) {
    assert.ok(inicio.includes(debe), `falta «${debe}»`);
  }
});

test("la pantalla de inicio no enseña el perfil de nadie", () => {
  // La vista previa del informe lleva cifras inventadas y lo dice. Poner las de
  // una persona real en la puerta de entrada sería publicar su perfil.
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  const inicio = paginaDeInicio(cargarRecursos());
  assert.ok(inicio.includes("Ejemplo visual · cifras inventadas"), "la muestra no se identifica como ejemplo");
  assert.ok(pagina.includes("Ejemplo visual"), "la muestra no llega a la página");
  for (const rastro of ["Maria Dolors", "Dolors Crous", "Persona de ejemplo"]) {
    assert.ok(!inicio.includes(rastro), `la pantalla enseña «${rastro}»`);
  }
});

test("la pantalla se puede usar con el teclado y en un móvil", () => {
  const pagina = readFileSync(join(raiz, "test-identify.html"), "utf8");
  // Sin esto el móvil dibuja la página a 980 px y la aleja hasta que cabe.
  assert.ok(pagina.includes('name="viewport"'), "falta la etiqueta viewport");
  assert.ok(pagina.includes('<html lang="es">'), "la página no declara su idioma");
  // Los desplegables son botones de verdad y cantan su estado.
  const inicio = paginaDeInicio(cargarRecursos());
  assert.ok(inicio.includes('aria-expanded="false"'), "los desplegables no dicen si están abiertos");
  assert.ok(inicio.includes('aria-controls="quePuedeAportar"'), "el desplegable no dice qué controla");
  assert.ok(inicio.includes('aria-controls="baseCientifica"'), "el acordeón no dice qué controla");
  // Los dibujos decorativos no se leen en voz alta.
  const svgs = inicio.match(/<svg[^>]*>/g) ?? [];
  for (const svg of svgs) {
    assert.ok(/aria-hidden="true"|role="img"/.test(svg), `un dibujo sin aria-hidden: ${svg.slice(0, 60)}`);
  }
});
