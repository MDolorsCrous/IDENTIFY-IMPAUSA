// De donde sale la clave de la API, y que significa cada error de Anthropic.
//
// Lo usan los dos sitios que llaman a Claude —el comando de tu ordenador y la
// funcion de Netlify— para que no haya dos criterios distintos.
import Anthropic from "@anthropic-ai/sdk";

/**
 * Los nombres de variable donde puede vivir la clave, **en orden**.
 *
 * `ANTHROPIC_API_KEY` es el nombre estandar: el que el SDK lee solo y el que
 * tienes puesto en tu ordenador. `THINK_IMPAUSA` es el que hay en Netlify.
 *
 * Se miran los dos porque cada entorno tiene el suyo, y se prefiere el
 * estandar. Si algun dia unificas los dos en `ANTHROPIC_API_KEY`, esta lista se
 * queda en uno y todo sigue igual: es la direccion recomendable, porque un
 * secreto con dos nombres acaba siendo un secreto que nadie sabe donde esta.
 */
export const NOMBRES = ["ANTHROPIC_API_KEY", "THINK_IMPAUSA"];

/**
 * La clave, o null si no hay ninguna.
 *
 * Se recorta: una clave pegada con un espacio o un salto de linea al final es
 * indistinguible a simple vista de una buena, y la API la rechaza con un 401
 * que no explica nada.
 */
export function claveDeApi(entorno = process.env) {
  for (const nombre of NOMBRES) {
    const valor = (entorno[nombre] ?? "").trim();
    if (valor) return { clave: valor, nombre };
  }
  return null;
}

/** Un cliente con la clave que haya, venga del nombre que venga. */
export function clienteDeApi(entorno = process.env) {
  const encontrada = claveDeApi(entorno);
  return encontrada ? new Anthropic({ apiKey: encontrada.clave }) : null;
}

/**
 * Que ha pasado de verdad, en cristiano.
 *
 * Devuelve `{ que, mensaje, pista }`. El mensaje se puede enseñar a quien
 * responde el test: dice el tipo de problema sin filtrar nada de la clave ni de
 * la cuenta. La pista es para quien administra.
 *
 * Existe porque la primera version devolvia «no se ha podido generar la
 * redaccion» para todo, y con eso no hay manera de saber si falla la clave, el
 * saldo o la conexion.
 */
export function queHaPasado(e) {
  if (e instanceof Anthropic.AuthenticationError) {
    return {
      que: "clave",
      mensaje: "La clave de la API no es válida.",
      pista: `Revisa el valor de ${NOMBRES.join(" o ")}. Un espacio o un salto de línea al final la invalidan.`,
    };
  }
  if (e instanceof Anthropic.PermissionDeniedError) {
    return {
      que: "permiso",
      mensaje: "La clave no tiene permiso para esta operación.",
      pista: "Comprueba en la consola de Anthropic qué permisos tiene esa clave.",
    };
  }
  if (e instanceof Anthropic.RateLimitError) {
    return {
      que: "ritmo",
      mensaje: "Demasiadas peticiones seguidas. Espera un momento y vuelve a intentarlo.",
      pista: "Límite de peticiones de la cuenta.",
    };
  }
  if (e instanceof Anthropic.BadRequestError && /credit|balance|quota/i.test(e.message ?? "")) {
    return {
      que: "saldo",
      mensaje: "La cuenta de la API no tiene saldo.",
      pista: "Añade crédito en console.anthropic.com → Billing.",
    };
  }
  if (e instanceof Anthropic.BadRequestError) {
    return { que: "peticion", mensaje: "La API ha rechazado la petición.", pista: e.message };
  }
  if (e instanceof Anthropic.APIConnectionError) {
    return {
      que: "conexion",
      mensaje: "No se ha podido conectar con la API.",
      pista: "¿Hay conexión de red?",
    };
  }
  if (e instanceof Anthropic.APIError) {
    return { que: "api", mensaje: `Error ${e.status} de la API.`, pista: e.message };
  }
  return { que: "desconocido", mensaje: "No se ha podido generar la redacción.", pista: e?.message };
}
