// La puerta: comprueba el código de acceso, y nada más.
//
// **Por qué esto vive en el servidor.** Si la página comprobara el código ella
// misma, tendría que llevarlo dentro, y cualquiera que abriera el código fuente
// lo vería. La puerta dejaría de ser una puerta. Aquí el código nunca sale de
// las variables de entorno de Netlify.
//
// No llama a la API ni cuesta nada: solo dice sí o no. El gasto lo sigue
// guardando redactar.mjs, que vuelve a comprobar el código en cada informe —
// esta puerta es la cortesía, el cerrojo está allí.
import { timingSafeEqual } from "node:crypto";

const json = (estado, cuerpo) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

/** Comparacion de tiempo constante: que el error no diga cuanto has acertado. */
function mismoCodigo(dado, esperado) {
  const a = Buffer.from(String(dado ?? ""), "utf8");
  const b = Buffer.from(String(esperado ?? ""), "utf8");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

export default async function handler(peticion) {
  if (peticion.method !== "POST") return json(405, { error: "Solo POST." });

  if (!process.env.CODIGO_ACCESO) {
    return json(500, { error: "El servidor no está configurado. Avisa a quien lo administra." });
  }

  let cuerpo;
  try {
    cuerpo = await peticion.json();
  } catch {
    return json(400, { error: "El cuerpo no es un JSON válido." });
  }

  if (!mismoCodigo(cuerpo.codigo, process.env.CODIGO_ACCESO)) {
    // Un respiro antes de contestar que no. No para un ataque serio, pero sí
    // hace que probar codigos a mano deje de ser comodo.
    await new Promise((r) => setTimeout(r, 700));
    return json(403, { error: "Ese código no es correcto." });
  }

  return json(200, { ok: true });
}
