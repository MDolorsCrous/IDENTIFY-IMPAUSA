// Pide a Claude la redaccion del informe, por API.
//
// **Vive en tools/ a proposito.** Este fichero maneja la clave y no puede
// acabar nunca dentro de test-identify.html: la pagina es un HTML suelto que
// se abre con doble clic, y cualquier clave que llevara dentro quedaria a la
// vista de quien lo abriera. tools/empaquetar.mjs solo empaqueta la lista
// explicita de src/services/, asi que desde aqui no hay forma de colarse; y
// tests/empaquetado.test.ts lo comprueba.
//
// La clave se lee del entorno (ANTHROPIC_API_KEY): no se pide, no se guarda y
// no se escribe en ningun fichero del proyecto.
import Anthropic from "@anthropic-ai/sdk";

import { encargoParaLaApi, validarProsa } from "../src/services/prompt.ts";

const MODELO = "claude-opus-5";

// $ por millon de tokens, para decir lo que ha costado cada informe.
const PRECIO = { entrada: 5, salida: 25 };

class ErrorDeRedaccion extends Error {
  constructor(mensaje, pista) {
    super(mensaje);
    this.name = "ErrorDeRedaccion";
    this.pista = pista;
  }
}

/**
 * Redacta el informe de un modelo ya interpretado.
 *
 * @param {object} modelo   el que devuelve construirModelo()
 * @param {object} facetas  facetas.json
 * @returns {Promise<{prosa: object, uso: object, coste: number}>}
 */
export async function redactar(modelo, facetas, { alEmpezar } = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ErrorDeRedaccion(
      "No hay clave de API.",
      "Ponla en la variable de entorno ANTHROPIC_API_KEY y vuelve a lanzarlo.",
    );
  }

  const { sistema, mensaje, esquema } = encargoParaLaApi(modelo, facetas);
  const cliente = new Anthropic();
  alEmpezar?.();

  let respuesta;
  try {
    // Se transmite en streaming porque con pensamiento adaptativo la respuesta
    // puede tardar, y una peticion normal se quedaria sin tiempo.
    const flujo = cliente.beta.messages.stream({
      model: MODELO,
      max_tokens: 32000,
      system: sistema,
      messages: [{ role: "user", content: mensaje }],
      thinking: { type: "adaptive" },
      // El esquema no se pide en el texto: se impone aqui. La respuesta no
      // puede salir con una seccion de menos.
      output_config: { effort: "high", format: { type: "json_schema", schema: esquema } },
      // Si un clasificador declinara la peticion, se reintenta sola en otro
      // modelo en vez de quedarse sin informe. Un informe habla de ansiedad y
      // de animo bajo, asi que no es un caso imposible.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    respuesta = await flujo.finalMessage();
  } catch (e) {
    throw traducir(e);
  }

  if (respuesta.stop_reason === "refusal") {
    throw new ErrorDeRedaccion(
      "Claude ha declinado redactar este informe" +
        (respuesta.stop_details?.category ? ` (${respuesta.stop_details.category})` : "") +
        ".",
      "Es raro en un informe de personalidad. Copia el encargo con --prompt y míralo a mano.",
    );
  }

  // Con pensamiento adaptativo el primer bloque puede ser el razonamiento:
  // hay que buscar el de texto, no coger el primero.
  const texto = respuesta.content.find((b) => b.type === "text")?.text;
  if (!texto) {
    throw new ErrorDeRedaccion(
      "La respuesta ha llegado sin texto.",
      `stop_reason: ${respuesta.stop_reason}`,
    );
  }

  let prosa;
  try {
    prosa = JSON.parse(texto);
  } catch {
    throw new ErrorDeRedaccion(
      "La respuesta no es un JSON válido.",
      texto.slice(0, 200) + (texto.length > 200 ? "…" : ""),
    );
  }

  // El esquema ya lo garantiza el servidor, pero se comprueba igual: es la
  // misma validacion que se le aplica a una redaccion pegada a mano, y no
  // conviene que existan dos varas de medir.
  const fallos = validarProsa(prosa, modelo);
  if (fallos.length) {
    throw new ErrorDeRedaccion("La redacción no encaja con el esquema.", "· " + fallos.join("\n  · "));
  }

  const uso = respuesta.usage;
  const entrada = (uso.input_tokens ?? 0) + (uso.cache_read_input_tokens ?? 0);
  const coste = (entrada * PRECIO.entrada + (uso.output_tokens ?? 0) * PRECIO.salida) / 1e6;
  return { prosa, uso, coste, modelo: respuesta.model };
}

/** Los errores de la API, dichos en cristiano y con qué hacer. */
function traducir(e) {
  if (e instanceof Anthropic.AuthenticationError) {
    return new ErrorDeRedaccion("La clave de API no vale.", "Revisa ANTHROPIC_API_KEY.");
  }
  if (e instanceof Anthropic.RateLimitError) {
    return new ErrorDeRedaccion("Demasiadas peticiones seguidas.", "Espera un momento y repite.");
  }
  if (e instanceof Anthropic.BadRequestError) {
    return new ErrorDeRedaccion("La API ha rechazado la petición.", e.message);
  }
  if (e instanceof Anthropic.APIConnectionError) {
    return new ErrorDeRedaccion("No se ha podido conectar con la API.", "¿Hay conexión?");
  }
  if (e instanceof Anthropic.APIError) {
    return new ErrorDeRedaccion(`Error ${e.status} de la API.`, e.message);
  }
  return e;
}

export { ErrorDeRedaccion };
