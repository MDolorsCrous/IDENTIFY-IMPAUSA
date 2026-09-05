// Borra un informe, cuando lo pide quien lo tiene delante.
//
// El informe se guarda para que la persona pueda volver a el y para poder
// leerlo con ella. Si no lo quiere guardado, retirarlo tiene que ser cosa suya
// y de un clic, no un favor que haya que pedir por correo.
//
// **La misma llave que para leerlo**: el identificador, que es un UUID y solo
// tiene quien tiene el enlace, y el codigo de acceso. Quien puede abrir el
// informe ya lo tiene entero delante, asi que no se protege menos por poder
// borrarlo — pero borrar no se deshace, y por eso la pagina pregunta antes.
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

  if (!mismoCodigo(cuerpo.codigo, process.env.CODIGO_ACCESO)) {
    return json(403, { error: "El código de acceso no es correcto." });
  }

  const id = String(cuerpo.id ?? "").slice(0, 80);
  if (!id) return json(400, { error: "Falta el identificador." });

  try {
    // `delete` no se queja si no habia nada, y esta bien asi: quien pide que se
    // borre su informe quiere saber que ya no esta, no si estaba.
    await getStore(ALMACEN).delete(id);
  } catch (e) {
    console.error("No se ha podido borrar el informe:", e?.message);
    return json(502, { error: "No se ha podido borrar el informe." });
  }

  return json(200, { borrado: true });
}
