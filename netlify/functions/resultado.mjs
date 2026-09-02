// Donde la pagina va a buscar el informe que se esta redactando.
//
// Existe porque `redactar-background.mjs` no puede contestar por la conexion
// que lo llamo: una funcion en segundo plano devuelve 202 al instante y sigue
// trabajando. Deja el resultado en Netlify Blobs y la pagina lo recoge aqui.
import { timingSafeEqual } from "node:crypto";

import { getStore } from "@netlify/blobs";

import { ALMACEN } from "./redactar-background.mjs";

const json = (estado, cuerpo) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

function mismoCodigo(dado, esperado) {
  const a = Buffer.from(String(dado ?? ""), "utf8");
  const b = Buffer.from(String(esperado ?? ""), "utf8");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

export default async function handler(peticion) {
  if (peticion.method !== "POST") return json(405, { error: "Solo POST." });

  let cuerpo;
  try {
    cuerpo = await peticion.json();
  } catch {
    return json(400, { error: "El cuerpo no es un JSON válido." });
  }

  // Se pide el codigo tambien aqui. El identificador es un UUID y nadie lo va a
  // acertar, pero un informe es material personal: no se sirve solo porque
  // alguien conozca su nombre.
  if (!mismoCodigo(cuerpo.codigo, process.env.CODIGO_ACCESO)) {
    return json(403, { error: "El código de acceso no es correcto." });
  }

  const id = String(cuerpo.id ?? "").slice(0, 80);
  if (!id) return json(400, { error: "Falta el identificador." });

  let guardado;
  try {
    guardado = await getStore(ALMACEN).get(id, { type: "json" });
  } catch (e) {
    console.error("No se ha podido leer el resultado:", e?.message);
    return json(502, { error: "No se ha podido recuperar el informe." });
  }

  // Todavia no esta: la pagina volvera a preguntar.
  if (!guardado) return json(200, { estado: "trabajando" });

  return json(200, guardado);
}
