// Redacta el informe. **En segundo plano**, y por eso el nombre.
//
// Netlify corta una funcion normal al minuto. Redactar el informe tarda mas:
// son unos 6.000 tokens de salida con razonamiento, y en la primera version
// esto acababa siempre en `Duration: 60000 ms` y un error generico en pantalla.
// El sufijo `-background` le da a Netlify permiso para tardar hasta 15 minutos,
// a cambio de que la respuesta al navegador sea inmediata: un 202 y nada mas.
//
// Como el resultado ya no puede volver por la misma conexion, se guarda en
// Netlify Blobs con el identificador que manda la pagina, y la pagina lo va a
// buscar a `resultado.mjs`.
//
// **Que hace falta en Netlify** (Site configuration -> Environment variables):
//   THINK_IMPAUSA      la clave de la API (o ANTHROPIC_API_KEY, ver tools/clave-api.mjs)
//   CODIGO_ACCESO      el codigo que le das a quien vaya a probarlo
//   TOPE_DIARIO        opcional, informes por dia (por defecto 25)
import { timingSafeEqual } from "node:crypto";

import { getStore } from "@netlify/blobs";

import { construirModelo } from "../../src/services/pipeline.ts";
import { encargoParaLaApi, validarProsa } from "../../src/services/prompt.ts";
import { ScoringError } from "../../src/services/scoring.ts";
import { cargarRecursos } from "../../tools/recursos.mjs";
import { claveDeApi, clienteDeApi, queHaPasado, NOMBRES } from "../../tools/clave-api.mjs";

const MODELO = "claude-opus-5";
const TOPE_POR_DEFECTO = 25;

const recursos = cargarRecursos();

/** Donde se dejan los informes para que la pagina los recoja. */
export const ALMACEN = "identify-informes";

/** Comparacion de tiempo constante: que el error no diga cuanto has acertado. */
function mismoCodigo(dado, esperado) {
  const a = Buffer.from(String(dado ?? ""), "utf8");
  const b = Buffer.from(String(esperado ?? ""), "utf8");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

/** Deja el resultado donde la pagina lo va a buscar. */
async function guardar(id, valor) {
  try {
    await getStore(ALMACEN).setJSON(id, { ...valor, cuando: Date.now() });
  } catch (e) {
    console.error("No se ha podido guardar el resultado:", e?.message);
  }
}

/** Cuenta los informes del dia. Sin esto, un codigo que circule sale caro. */
async function dentroDelTope() {
  const tope = Number(process.env.TOPE_DIARIO) || TOPE_POR_DEFECTO;
  let almacen;
  try {
    almacen = getStore("identify-cuota");
  } catch {
    return { vale: true };
  }
  const hoy = new Date().toISOString().slice(0, 10);
  const usados = Number((await almacen.get(hoy)) ?? 0);
  if (usados >= tope) return { vale: false, usados, tope };
  await almacen.set(hoy, String(usados + 1));
  return { vale: true, usados: usados + 1, tope };
}

export default async function handler(peticion) {
  // Una funcion en segundo plano contesta 202 y sigue trabajando. Lo que pase a
  // partir de aqui solo se sabra por el almacen y por este log.
  let cuerpo;
  try {
    cuerpo = await peticion.json();
  } catch {
    return;
  }
  const id = String(cuerpo.id ?? "").slice(0, 80);
  if (!id) {
    console.error("Peticion sin identificador: no hay donde dejar el resultado.");
    return;
  }

  if (!claveDeApi() || !process.env.CODIGO_ACCESO) {
    console.error("Falta configuracion. Nombres que se miran para la clave:", NOMBRES.join(", "));
    return guardar(id, { estado: "error", error: "El servidor no está configurado." });
  }

  if (!mismoCodigo(cuerpo.codigo, process.env.CODIGO_ACCESO)) {
    return guardar(id, { estado: "error", error: "El código de acceso no es correcto.", que: "codigo" });
  }

  // El motor valida las respuestas: numero de items, escala y que no sobre
  // ninguno. Aqui solo llegan las 60 respuestas, nunca un perfil ya montado:
  // asi esto no se puede usar para pedirle a Claude cualquier otra cosa.
  let modelo;
  try {
    const respuestas = Object.fromEntries(
      Object.entries(cuerpo.respuestas ?? {}).map(([k, v]) => [Number(k), Number(v)]),
    );
    modelo = construirModelo(respuestas, recursos, {
      persona: typeof cuerpo.persona === "string" ? cuerpo.persona.slice(0, 80).trim() : undefined,
    });
  } catch (e) {
    if (e instanceof ScoringError) {
      return guardar(id, { estado: "error", error: "Las respuestas no son válidas." });
    }
    throw e;
  }

  const cuota = await dentroDelTope();
  if (!cuota.vale) {
    return guardar(id, {
      estado: "error",
      error: `Se ha llegado al tope de ${cuota.tope} informes por hoy. Vuelve a probarlo mañana.`,
    });
  }

  const { sistema, mensaje, esquema } = encargoParaLaApi(modelo, recursos.facetas);
  const cliente = clienteDeApi();
  const empezo = Date.now();

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
    const p = queHaPasado(e);
    console.error(`Fallo al llamar a la API [${p.que}]:`, e?.status, e?.message, "·", p.pista);
    return guardar(id, { estado: "error", error: p.mensaje, que: p.que });
  }

  if (respuesta.stop_reason === "refusal") {
    return guardar(id, { estado: "error", error: "No se ha podido redactar este perfil." });
  }

  const texto = respuesta.content.find((b) => b.type === "text")?.text;
  let prosa;
  try {
    prosa = JSON.parse(texto ?? "");
  } catch {
    console.error("La respuesta no era JSON:", texto?.slice(0, 300));
    return guardar(id, { estado: "error", error: "La redacción ha llegado mal. Inténtalo de nuevo." });
  }

  const fallos = validarProsa(prosa, modelo);
  if (fallos.length) {
    console.error("La redacción no encaja con el esquema:", fallos);
    return guardar(id, { estado: "error", error: "La redacción ha llegado incompleta." });
  }

  console.log(
    `informe redactado en ${((Date.now() - empezo) / 1000).toFixed(0)} s · ` +
      `${respuesta.usage.input_tokens} entrada / ${respuesta.usage.output_tokens} salida · ` +
      `${cuota.usados ?? "?"}/${cuota.tope ?? "?"} hoy`,
  );
  return guardar(id, { estado: "listo", prosa });
}
