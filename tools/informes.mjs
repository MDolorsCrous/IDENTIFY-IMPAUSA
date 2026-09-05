// Los informes que se han redactado en la web, vistos desde tu ordenador.
//
//   node tools/informes.mjs              la lista de lo que hay
//   node tools/informes.mjs <id>         saca uno: el JSON y el HTML, en salidas/
//   node tools/informes.mjs --todos      saca todos
//
// **Por que un comando y no una pantalla de administracion.** Una pantalla asi
// seria una direccion publica mas por la que se pueden pedir informes de otras
// personas, protegida por el mismo codigo que circula entre quienes hacen el
// test. Esto no abre nada: lee el almacen con tus credenciales de Netlify, que
// no salen de tu ordenador, y deja los ficheros en `salidas/`, que no se sube
// al repositorio.
//
// **Que hace falta** (una vez, en tu terminal):
//   NETLIFY_SITE_ID      el identificador del sitio — Netlify → Site configuration
//   NETLIFY_AUTH_TOKEN   un token personal — Netlify → User settings → Applications
//
// Lo que sale de aqui son respuestas de personas concretas con su nombre. Vive
// en `salidas/`, que esta en el .gitignore, y ahi deberia quedarse.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { getStore } from "@netlify/blobs";

import { construirModelo } from "../src/services/pipeline.ts";
import { renderInforme } from "../src/services/render-informe.js";
import { cargarRecursos } from "./recursos.mjs";
import { ALMACEN } from "../netlify/functions/redactar-background.mjs";

/** El almacen de Netlify, leido desde fuera de Netlify. */
function abrirAlmacen() {
  const siteID = (process.env.NETLIFY_SITE_ID ?? "").trim();
  const token = (process.env.NETLIFY_AUTH_TOKEN ?? process.env.NETLIFY_TOKEN ?? "").trim();
  if (!siteID || !token) {
    console.error(
      "Faltan las credenciales de Netlify.\n\n" +
        "  NETLIFY_SITE_ID      Netlify -> tu sitio -> Site configuration -> Site ID\n" +
        "  NETLIFY_AUTH_TOKEN   Netlify -> User settings -> Applications -> New access token\n\n" +
        "En PowerShell, para esta sesion:\n" +
        '  $env:NETLIFY_SITE_ID = "..."\n' +
        '  $env:NETLIFY_AUTH_TOKEN = "..."',
    );
    process.exit(1);
  }
  return getStore({ name: ALMACEN, siteID, token, consistency: "strong" });
}

/** Un nombre de fichero que no muerda: sin acentos, sin espacios, sin sorpresas. */
export function apodo(texto) {
  return (
    (texto ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "sin-nombre"
  );
}

const dia = (ms) => new Date(ms ?? Date.now()).toISOString().slice(0, 10);

function fechaLarga(ms, idioma) {
  return new Date(ms ?? Date.now()).toLocaleDateString(idioma === "en" ? "en-GB" : "es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Todo lo que hay en el almacen, lo mas reciente primero. */
async function todos(almacen) {
  const { blobs } = await almacen.list();
  const fichas = [];
  for (const b of blobs) {
    const d = await almacen.get(b.key, { type: "json" });
    if (d) fichas.push({ id: b.key, ...d });
  }
  return fichas.sort((a, b) => (b.cuando ?? 0) - (a.cuando ?? 0));
}

function listar(fichas) {
  if (!fichas.length) return console.log("No hay ningun informe guardado.");
  const ancho = (f) => Math.max(...fichas.map(f), 0);
  const nombre = (f) => f.persona || "—";
  const anchoNombre = Math.max(6, ancho((f) => nombre(f).length));
  console.log(
    "FECHA        " + "NOMBRE".padEnd(anchoNombre) + "  LN  ESTADO     IDENTIFICADOR",
  );
  for (const f of fichas) {
    // Sin respuestas guardadas no se puede volver a montar el informe: son los
    // que se redactaron antes de que se guardaran tambien las respuestas.
    const estado = f.estado === "listo" ? (f.respuestas ? "completo" : "solo texto") : f.estado;
    console.log(
      dia(f.cuando) +
        "   " +
        nombre(f).padEnd(anchoNombre) +
        "  " +
        (f.idioma ?? "es") +
        "  " +
        estado.padEnd(10) +
        " " +
        f.id,
    );
  }
  console.log(
    "\n" + fichas.length + " informe(s). Para sacar uno:  node tools/informes.mjs " + fichas[0].id,
  );
}

export function sacar(ficha) {
  const carpeta = fileURLToPath(new URL("../salidas/", import.meta.url));
  mkdirSync(carpeta, { recursive: true });
  const base = dia(ficha.cuando) + "-" + apodo(ficha.persona) + "-" + ficha.id.slice(0, 8);

  writeFileSync(carpeta + base + ".json", JSON.stringify(ficha, null, 2), "utf8");

  if (ficha.estado !== "listo" || !ficha.respuestas) {
    console.log(
      "escrito salidas/" + base + ".json\n" +
        "  (sin las respuestas no se puede volver a montar el informe: solo el texto)",
    );
    return;
  }

  const idioma = ficha.idioma === "en" ? "en" : "es";
  const recursos = cargarRecursos(idioma);
  const respuestas = Object.fromEntries(
    Object.entries(ficha.respuestas).map(([k, v]) => [Number(k), Number(v)]),
  );
  const modelo = construirModelo(respuestas, recursos, { persona: ficha.persona || undefined });
  const html = renderInforme(modelo, ficha.prosa ?? {}, recursos.labels, {
    facetas: recursos.facetas,
    textos: recursos.textos.informe,
    metaforas: recursos.metaforas,
    fuentes: recursos.fuentes,
    marca: recursos.marca,
    fecha: fechaLarga(ficha.cuando, idioma),
  });
  writeFileSync(carpeta + base + ".html", html, "utf8");
  console.log(
    "escrito salidas/" + base + ".html  y  salidas/" + base + ".json\n" +
      "  " + modelo.domains.length + " dominios · " + modelo.fired.length + " combinaciones · " +
      "atencion: " + (modelo.meta.atencion?.nivel ?? "?"),
  );
}

// Solo cuando se llama a mano: asi las pruebas pueden importar `sacar` sin que
// el modulo intente hablar con Netlify al cargarse.
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  const que = process.argv[2];
  const fichas = await todos(abrirAlmacen());

  if (!que) listar(fichas);
  else if (que === "--todos") fichas.forEach((f) => sacar(f));
  else {
    const ficha = fichas.find((f) => f.id === que || f.id.startsWith(que));
    if (!ficha) {
      console.error("No hay ningun informe con ese identificador: " + que);
      process.exit(1);
    }
    sacar(ficha);
  }
}
