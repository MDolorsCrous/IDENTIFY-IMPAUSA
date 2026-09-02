// Redacta el informe desde el servidor, para la web publicada.
//
// **Por que existe.** La pagina es estatica y no puede llevar la clave dentro:
// cualquiera que mirara el codigo fuente la veria. Aqui la clave vive en las
// variables de entorno de Netlify y no baja nunca al navegador.
//
// **Que acepta.** Las 60 respuestas, no el perfil ya montado. Es deliberado: si
// aceptara un perfil escrito por quien llama, esto seria una pasarela gratuita
// hacia Claude con la tarjeta de otra persona. Aceptando solo 60 numeros del 1
// al 5, lo peor que puede hacer alguien con el codigo es generar informes.
//
// **Que hace falta en Netlify** (Site configuration -> Environment variables):
//   ANTHROPIC_API_KEY   la clave de la API (o THINK_IMPAUSA, ver tools/clave-api.mjs)
//   CODIGO_ACCESO       el codigo que le das a quien vaya a probarlo
//   TOPE_DIARIO         opcional, informes por dia (por defecto 25)
import { timingSafeEqual } from "node:crypto";

import { getStore } from "@netlify/blobs";

import { construirModelo } from "../../src/services/pipeline.ts";
import { encargoParaLaApi, validarProsa } from "../../src/services/prompt.ts";
import { ScoringError } from "../../src/services/scoring.ts";
import { cargarRecursos } from "../../tools/recursos.mjs";
import { claveDeApi, clienteDeApi, queHaPasado, NOMBRES } from "../../tools/clave-api.mjs";

const MODELO = "claude-opus-5";
const TOPE_POR_DEFECTO = 25;

// Se cargan una vez por instancia, no por peticion.
const recursos = cargarRecursos();

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

/** Cuenta los informes del dia. Sin esto, un codigo que circule sale caro. */
async function dentroDelTope() {
  const tope = Number(process.env.TOPE_DIARIO) || TOPE_POR_DEFECTO;
  let almacen;
  try {
    almacen = getStore("identify-cuota");
  } catch {
    return { vale: true, aviso: "sin cuota: el almacen no esta disponible" };
  }
  const hoy = new Date().toISOString().slice(0, 10);
  const usados = Number((await almacen.get(hoy)) ?? 0);
  if (usados >= tope) return { vale: false, usados, tope };
  await almacen.set(hoy, String(usados + 1));
  return { vale: true, usados: usados + 1, tope };
}

export default async function handler(peticion) {
  if (peticion.method !== "POST") return json(405, { error: "Solo POST." });

  if (!claveDeApi() || !process.env.CODIGO_ACCESO) {
    console.error(
      "Falta configuracion. Clave:", !!claveDeApi(),
      "· Codigo:", !!process.env.CODIGO_ACCESO,
      "· Nombres que se miran:", NOMBRES.join(", "),
    );
    return json(500, { error: "El servidor no está configurado. Avisa a quien lo administra." });
  }

  let cuerpo;
  try {
    cuerpo = await peticion.json();
  } catch {
    return json(400, { error: "El cuerpo no es un JSON válido." });
  }

  if (!mismoCodigo(cuerpo.codigo, process.env.CODIGO_ACCESO)) {
    return json(403, { error: "El código de acceso no es correcto." });
  }

  // El motor valida las respuestas: numero de items, escala y que no sobre
  // ninguno. No hace falta comprobarlo dos veces.
  let modelo;
  try {
    const respuestas = Object.fromEntries(
      Object.entries(cuerpo.respuestas ?? {}).map(([k, v]) => [Number(k), Number(v)]),
    );
    modelo = construirModelo(respuestas, recursos, {
      persona: typeof cuerpo.persona === "string" ? cuerpo.persona.slice(0, 80).trim() : undefined,
    });
  } catch (e) {
    if (e instanceof ScoringError) return json(400, { error: "Las respuestas no son válidas." });
    throw e;
  }

  const cuota = await dentroDelTope();
  if (!cuota.vale) {
    return json(429, {
      error: `Se ha llegado al tope de ${cuota.tope} informes por hoy. Vuelve a probarlo mañana.`,
    });
  }

  const { sistema, mensaje, esquema } = encargoParaLaApi(modelo, recursos.facetas);
  const cliente = clienteDeApi();

  let respuesta;
  try {
    const flujo = cliente.beta.messages.stream({
      model: MODELO,
      max_tokens: 32000,
      system: sistema,
      messages: [{ role: "user", content: mensaje }],
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: { type: "json_schema", schema: esquema } },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    respuesta = await flujo.finalMessage();
  } catch (e) {
    // Se dice QUE tipo de problema es —clave, saldo, ritmo, conexion—, no el
    // detalle. Ninguna de esas categorias filtra nada de la clave ni de la
    // cuenta, y sin ellas no hay forma de saber por que falla desde fuera: la
    // primera version contestaba lo mismo a todo y no habia manera de avanzar.
    const p = queHaPasado(e);
    console.error(`Fallo al llamar a la API [${p.que}]:`, e?.status, e?.message, "·", p.pista);
    return json(502, { error: p.mensaje, que: p.que });
  }

  if (respuesta.stop_reason === "refusal") {
    return json(502, { error: "No se ha podido generar la redacción de este perfil." });
  }

  const texto = respuesta.content.find((b) => b.type === "text")?.text;
  let prosa;
  try {
    prosa = JSON.parse(texto ?? "");
  } catch {
    console.error("La respuesta no era JSON:", texto?.slice(0, 300));
    return json(502, { error: "La redacción ha llegado mal. Inténtalo de nuevo." });
  }

  const fallos = validarProsa(prosa, modelo);
  if (fallos.length) {
    console.error("La redacción no encaja con el esquema:", fallos);
    return json(502, { error: "La redacción ha llegado incompleta. Inténtalo de nuevo." });
  }

  console.log(
    `informe redactado · ${respuesta.usage.input_tokens} entrada / ` +
      `${respuesta.usage.output_tokens} salida · ${cuota.usados}/${cuota.tope} hoy`,
  );
  return json(200, { prosa });
}
