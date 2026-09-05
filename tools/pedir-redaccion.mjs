// La llamada a Claude: una sola, para los dos caminos.
//
// La usan el comando del ordenador (tools/redactar.mjs) y la funcion de la web
// (netlify/functions/redactar-background.mjs). Estuvo escrita dos veces, y el
// dia que hubo que mejorar el tratamiento de errores hubo que hacerlo en los
// dos sitios: por eso vive aqui.
import { clienteDeApi, queHaPasado } from "./clave-api.mjs";
import {
  encargoParaLaApi,
  validarProsa,
  avisosDeLongitud,
  avisosDeContenido,
} from "../src/services/prompt.ts";

const MODELO = "claude-opus-5";

/** $ por millon de tokens, para poder decir lo que ha costado cada informe. */
const PRECIO = { entrada: 5, salida: 25 };

/**
 * Cuanto piensa el modelo antes de escribir.
 *
 * No es un detalle menor: en una medicion real, de 6.158 tokens de salida solo
 * 3.046 eran texto — los otros 3.100 eran razonamiento. Esta perilla es la que
 * los toca, y por eso se puede cambiar desde fuera: tools/comparar-esfuerzo.mjs
 * genera el mismo perfil a los tres niveles para decidirlo leyendo, no
 * estimando.
 */
const ESFUERZO = "high";

const INTENTOS = 2;
const ESPERA_ENTRE_INTENTOS = 5000;

/**
 * Que vale la pena volver a intentar.
 *
 * - `conexion`: la caida a media respuesta que se veia en Netlify.
 * - `formato` e `incompleta`: el modelo se ha salido del esquema. Pasa poco y a
 *   la segunda suele salir bien. Es reintentable porque el esquema del cable no
 *   puede imponer el numero exacto de pasos: structured outputs no acepta
 *   `maxItems`, asi que solo lo pide la instruccion.
 *
 * Lo demas no se reintenta: una clave mala o una cuenta sin saldo fallarian
 * igual, y se cobrarian dos veces.
 */
const REINTENTABLES = ["conexion", "formato", "incompleta"];

export class FalloDeRedaccion extends Error {
  constructor({ mensaje, pista, que }) {
    super(mensaje);
    this.name = "FalloDeRedaccion";
    this.pista = pista;
    this.que = que;
  }
}

/**
 * Lo que se le dice a quien espera el informe cuando algo falla, por idioma.
 * Estos mensajes acaban en un aviso de la pagina, asi que hablan su lengua.
 */
const MENSAJES = {
  es: {
    declinada: "No se ha podido redactar este perfil.",
    formato: "La redacción ha llegado mal. Inténtalo de nuevo.",
    incompleta: "La redacción ha llegado incompleta.",
  },
  en: {
    declinada: "This profile could not be written.",
    formato: "The draft came back malformed. Try again.",
    incompleta: "The draft arrived incomplete.",
  },
};

/**
 * Pide la redaccion del informe.
 *
 * @param {object} modelo   el que devuelve construirModelo()
 * @param {object} facetas  las fichas de faceta del idioma (recursos.facetas)
 * @param {(aviso: string) => void} [avisar]  para dejar rastro de los reintentos
 * @param {string} [esfuerzo]  cuanto piensa el modelo (tools/comparar-esfuerzo.mjs)
 * @param {string} [idioma]  la lengua del encargo y del informe ("es" o "en")
 * @returns {Promise<{prosa: object, uso: object, coste: number, modelo: string, segundos: number}>}
 */
export async function pedirRedaccion(modelo, facetas, avisar = () => {}, esfuerzo = ESFUERZO, idioma = "es") {
  const { sistema, mensaje, esquema } = encargoParaLaApi(modelo, facetas, idioma);
  const cliente = clienteDeApi();
  const empezo = Date.now();

  let ultimo;
  for (let intento = 1; intento <= INTENTOS; intento++) {
    let flujo;
    try {
      flujo = cliente.beta.messages.stream({
        model: MODELO,
        max_tokens: 32000,
        system: sistema,
        messages: [{ role: "user", content: mensaje }],
        // `display: "summarized"` no es un capricho. Por defecto en Opus 5 el
        // razonamiento viaja VACIO, y eso deja la conexion muda durante la fase
        // de pensar. En Netlify eso acababa en `terminated` a los 20 segundos:
        // un proxy cerrando por inactividad lo que parecia una conexion muerta.
        // Con el resumen, por el cable pasa texto de verdad y no hay silencio.
        thinking: { type: "adaptive", display: "summarized" },
        // El esquema no se pide en el texto: se impone. La respuesta no puede
        // salir con una seccion de menos.
        output_config: { effort: esfuerzo, format: { type: "json_schema", schema: esquema } },
        // Si un clasificador declinara la peticion, se reintenta sola en otro
        // modelo. Un informe habla de ansiedad y de animo bajo: no es imposible.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
      const respuesta = await flujo.finalMessage();
      return leerRespuesta(respuesta, modelo, empezo, idioma);
    } catch (e) {
      try { flujo?.abort(); } catch {}
      // Un fallo de esquema también es candidato a segunda oportunidad, así que
      // pasa por aquí en vez de salir disparado.
      const p =
        e instanceof FalloDeRedaccion
          ? { que: e.que, mensaje: e.message, pista: e.pista }
          : queHaPasado(e);
      ultimo = e instanceof FalloDeRedaccion ? e : new FalloDeRedaccion(p);

      // Solo se reintenta lo que puede salir bien a la segunda. Un 401 o una
      // cuenta sin saldo fallarian igual, y se cobrarian dos veces.
      if (!REINTENTABLES.includes(p.que) || intento === INTENTOS) throw ultimo;
      avisar(`intento ${intento} caído (${p.mensaje}), probando otra vez`);
      await new Promise((r) => setTimeout(r, ESPERA_ENTRE_INTENTOS));
    }
  }
  throw ultimo;
}

/** Lo que vuelve de la API, comprobado antes de darlo por bueno. */
function leerRespuesta(respuesta, modelo, empezo, idioma = "es") {
  const dice = MENSAJES[idioma] ?? MENSAJES.es;
  if (respuesta.stop_reason === "refusal") {
    throw new FalloDeRedaccion({
      que: "declinada",
      mensaje: dice.declinada,
      pista: respuesta.stop_details?.category ?? "sin categoría",
    });
  }

  // Con pensamiento adaptativo el primer bloque puede ser el razonamiento:
  // hay que buscar el de texto, no coger el primero.
  const texto = respuesta.content.find((b) => b.type === "text")?.text;
  let prosa;
  try {
    prosa = JSON.parse(texto ?? "");
  } catch {
    throw new FalloDeRedaccion({
      que: "formato",
      mensaje: dice.formato,
      pista: (texto ?? "").slice(0, 200),
    });
  }

  // El esquema ya lo garantiza el servidor de la API, pero se comprueba igual:
  // es la misma validacion que se le aplica a una redaccion pegada a mano, y no
  // conviene que existan dos varas de medir.
  const fallos = validarProsa(prosa, modelo, idioma);
  if (fallos.length) {
    throw new FalloDeRedaccion({
      que: "incompleta",
      mensaje: dice.incompleta,
      pista: fallos.join(" · "),
    });
  }

  // Y lo que la validacion no puede mirar: si el texto afirma algo que este
  // instrumento no sostiene —un percentil, un porcentaje, una etiqueta, una
  // cifra que no sale del perfil—. No invalida nada: viaja con el resultado
  // para que se pueda ver despues.
  const avisos = [...avisosDeLongitud(prosa, modelo), ...avisosDeContenido(prosa, modelo)];

  const uso = respuesta.usage;
  const entrada = (uso.input_tokens ?? 0) + (uso.cache_read_input_tokens ?? 0);
  return {
    prosa,
    avisos,
    uso,
    modelo: respuesta.model,
    segundos: (Date.now() - empezo) / 1000,
    coste: (entrada * PRECIO.entrada + (uso.output_tokens ?? 0) * PRECIO.salida) / 1e6,
  };
}
