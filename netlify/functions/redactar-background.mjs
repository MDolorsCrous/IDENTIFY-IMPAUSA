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
import { ScoringError } from "../../src/services/scoring.ts";
import { cargarRecursos } from "../../tools/recursos.mjs";
import { claveDeApi, NOMBRES } from "../../tools/clave-api.mjs";
import { pedirRedaccion, FalloDeRedaccion } from "../../tools/pedir-redaccion.mjs";

const TOPE_POR_DEFECTO = 25;

// Los dos idiomas se mezclan una vez, al arrancar la funcion. La peticion trae
// `idioma` y aqui solo se elige la capa; si no trae nada, castellano.
const RECURSOS = { es: cargarRecursos("es"), en: cargarRecursos("en") };

/** Lo que se le dice a quien espera, en su lengua. */
const MENSAJES = {
  es: {
    sinConfigurar: "El servidor no está configurado.",
    codigoIncorrecto: "El código de acceso no es correcto.",
    respuestasInvalidas: "Las respuestas no son válidas.",
    sinLectura: "Las 60 respuestas van con el mismo valor: no hay nada que interpretar.",
    tope: (n) => `Se ha llegado al tope de ${n} informes por hoy. Vuelve a probarlo mañana.`,
    noGenerado: "No se ha podido generar el informe.",
  },
  en: {
    sinConfigurar: "The server is not configured.",
    codigoIncorrecto: "The access code is not correct.",
    respuestasInvalidas: "The answers are not valid.",
    sinLectura: "All 60 answers use the same value: there is nothing to interpret.",
    tope: (n) => `Today's limit of ${n} reports has been reached. Try again tomorrow.`,
    noGenerado: "The report could not be generated.",
  },
};

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

  // El idioma del informe. Solo los que existen; cualquier otra cosa, castellano.
  const idioma = cuerpo.idioma === "en" ? "en" : "es";
  const recursos = RECURSOS[idioma];
  const dice = MENSAJES[idioma];

  if (!claveDeApi() || !process.env.CODIGO_ACCESO) {
    console.error("Falta configuracion. Nombres que se miran para la clave:", NOMBRES.join(", "));
    return guardar(id, { estado: "error", error: dice.sinConfigurar });
  }

  if (!mismoCodigo(cuerpo.codigo, process.env.CODIGO_ACCESO)) {
    return guardar(id, { estado: "error", error: dice.codigoIncorrecto, que: "codigo" });
  }

  // El motor valida las respuestas: numero de items, escala y que no sobre
  // ninguno. Aqui solo llegan las 60 respuestas, nunca un perfil ya montado:
  // asi esto no se puede usar para pedirle a Claude cualquier otra cosa.
  let modelo;
  let respuestas;
  const persona = typeof cuerpo.persona === "string" ? cuerpo.persona.slice(0, 80).trim() : "";
  try {
    respuestas = Object.fromEntries(
      Object.entries(cuerpo.respuestas ?? {}).map(([k, v]) => [Number(k), Number(v)]),
    );
    modelo = construirModelo(respuestas, recursos, {
      persona: persona || undefined,
    });
  } catch (e) {
    if (e instanceof ScoringError) {
      return guardar(id, { estado: "error", error: dice.respuestasInvalidas });
    }
    throw e;
  }

  // Si las sesenta respuestas van con el mismo valor no hay nada que
  // interpretar: el cuestionario cancela ese sesgo por diseño y sale un 3,00
  // plano. La página ya no ofrece el botón, pero la página es de quien la abre
  // y puede tocarla; esto se comprueba también aquí, antes de pagar la llamada.
  if (modelo.meta.atencion?.nivel === "nula") {
    return guardar(id, { estado: "error", error: dice.sinLectura });
  }

  const cuota = await dentroDelTope();
  if (!cuota.vale) {
    return guardar(id, { estado: "error", error: dice.tope(cuota.tope) });
  }

  // La llamada vive en tools/pedir-redaccion.mjs, compartida con el comando:
  // mismo modelo, mismos parametros y los mismos reintentos en un solo sitio.
  const empezo = Date.now();
  try {
    const r = await pedirRedaccion(modelo, recursos.facetas, (aviso) => console.warn(aviso), undefined, idioma);
    console.log(
      `informe redactado en ${r.segundos.toFixed(0)} s [${idioma}] · ` +
        `${r.uso.input_tokens} entrada / ${r.uso.output_tokens} salida · ` +
        `${r.coste.toFixed(3)} $ · ${cuota.usados ?? "?"}/${cuota.tope ?? "?"} hoy`,
    );
    // Se guardan tambien las respuestas, el nombre y el idioma. No es un
    // capricho de archivo: el informe se dibuja desde el modelo, y el modelo se
    // reconstruye desde las respuestas. Sin ellas, la prosa guardada no se
    // puede volver a montar y el informe seria inalcanzable en cuanto se
    // cerrara la pestaña. Es lo que permite volver con `#informe=<id>`.
    return guardar(id, { estado: "listo", prosa: r.prosa, respuestas, persona, idioma });
  } catch (e) {
    const segundos = ((Date.now() - empezo) / 1000).toFixed(0);
    if (e instanceof FalloDeRedaccion) {
      console.error(`Fallo tras ${segundos} s [${e.que}]: ${e.message} · ${e.pista}`);
      return guardar(id, { estado: "error", error: e.message, que: e.que });
    }
    console.error(`Fallo inesperado tras ${segundos} s:`, e?.message);
    return guardar(id, { estado: "error", error: dice.noGenerado });
  }
}
