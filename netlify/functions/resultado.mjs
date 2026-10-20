// Donde la pagina va a buscar el informe que se esta redactando.
//
// Existe porque `redactar-background.mjs` no puede contestar por la conexion
// que lo llamo: una funcion en segundo plano devuelve 202 al instante y sigue
// trabajando. Deja el resultado en Netlify Blobs y la pagina lo recoge aqui.
import { getStore } from "@netlify/blobs";

import { ALMACEN } from "./redactar-background.mjs";

const json = (estado, cuerpo) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export default async function handler(peticion) {
  if (peticion.method !== "POST") return json(405, { error: "Solo POST." });

  let cuerpo;
  try {
    cuerpo = await peticion.json();
  } catch {
    return json(400, { error: "El cuerpo no es un JSON válido." });
  }

  // La unica llave es el identificador: un UUID que nadie va a acertar y que
  // solo tiene quien tiene el enlace. No hay codigo de acceso — la aplicacion
  // es libre— asi que quien tenga el enlace, tiene el informe.
  const id = String(cuerpo.id ?? "").slice(0, 80);
  if (!id) return json(400, { error: "Falta el identificador." });

  let guardado;
  try {
    // `consistency: "strong"` no es opcional aqui, aunque lo parezca. Netlify
    // Blobs lee con consistencia EVENTUAL por defecto, y eso significa que una
    // lectura puede no ver todavia lo que se acaba de escribir. Paso de verdad:
    // el informe estaba redactado y guardado a los 83 segundos, esto seguia
    // contestando «trabajando», y la pagina se rendia a los cuatro minutos
    // diciendo que tardaba demasiado. Con lectura fuerte, en cuanto esta, esta.
    guardado = await getStore(ALMACEN).get(id, { type: "json", consistency: "strong" });
  } catch (e) {
    console.error("No se ha podido leer el resultado:", e?.message);
    return json(502, { error: "No se ha podido recuperar el informe." });
  }

  // Todavia no esta: la pagina volvera a preguntar.
  if (!guardado) return json(200, { estado: "trabajando" });

  return json(200, guardado);
}
