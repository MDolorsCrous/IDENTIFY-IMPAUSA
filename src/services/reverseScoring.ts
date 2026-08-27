/**
 * Recodificación de ítems inversos del BFI-2.
 *
 * Regla oficial, la única admitida (`BFI-2_formules_correctes_inversos.xlsx`):
 *
 *     puntuación = 6 − respuesta
 *
 * Un 1 pasa a 5, un 2 a 4, el 3 se queda igual. No se usa ninguna otra fórmula.
 */

/** Punto de la escala de respuesta. */
export type Response = 1 | 2 | 3 | 4 | 5;

/** Constante de la recodificación: `max + min` = 5 + 1. */
export const REVERSE_CONSTANT = 6;

/**
 * Devuelve la puntuación de un ítem: la respuesta tal cual si es directo,
 * o `6 − respuesta` si es inverso.
 */
export function recode(response: Response, reverse: boolean): Response {
  return (reverse ? REVERSE_CONSTANT - response : response) as Response;
}

/**
 * Recodifica un conjunto de respuestas.
 *
 * @param responses  respuestas por número de ítem (1–60)
 * @param reverseIds ítems inversos
 */
export function applyReverse(
  responses: Readonly<Record<number, Response>>,
  reverseIds: readonly number[],
): Record<number, Response> {
  const reverse = new Set(reverseIds);
  const recoded: Record<number, Response> = {};
  for (const [key, value] of Object.entries(responses)) {
    const id = Number(key);
    recoded[id] = recode(value, reverse.has(id));
  }
  return recoded;
}
