/**
 * Motor de puntuación del BFI-2.
 *
 * Es deliberadamente tonto: recodifica, hace medias y para. No interpreta, no
 * clasifica y no decide si un valor es alto o bajo — eso es trabajo de la capa
 * de interpretación (`docs/02-modelo-interpretacion.md`), que aún no existe.
 *
 * No depende de nada, ni del framework ni del idioma: los nombres visibles
 * viven en `src/i18n/`. Para adaptar el motor a otro instrumento basta con
 * cambiar los ficheros de `src/config/`.
 */

import { applyReverse, type Response } from "./reverseScoring.ts";

export type { Response };

/** Respuestas de una persona, por número de ítem. */
export type Responses = Readonly<Record<number, Response>>;

export interface Question {
  id: number;
  domain: string;
  facet: string;
  reverse: boolean;
}

export interface FacetConfig {
  id: string;
  domain: string;
  items: number[];
}

export interface DomainConfig {
  id: string;
  facets: string[];
  items: number[];
}

export interface Bfi2Config {
  questions: Question[];
  facets: FacetConfig[];
  domains: DomainConfig[];
}

export interface Scores {
  /** Respuestas ya recodificadas (los inversos, con `6 − respuesta`). */
  recoded: Record<number, Response>;
  /** Media por faceta, de 1,00 a 5,00. */
  facets: Record<string, number>;
  /** Media por dominio, de 1,00 a 5,00. */
  domains: Record<string, number>;
}

export type ScoringErrorCode = "missing_responses" | "invalid_response" | "unknown_item";

export class ScoringError extends Error {
  readonly code: ScoringErrorCode;
  /** Ítems que provocaron el fallo, para poder señalarlos en la interfaz. */
  readonly items: number[];

  constructor(message: string, code: ScoringErrorCode, items: number[] = []) {
    super(message);
    this.name = "ScoringError";
    this.code = code;
    this.items = items;
  }
}

const VALID: ReadonlySet<number> = new Set([1, 2, 3, 4, 5]);

/**
 * Comprueba que las respuestas sirven para puntuar: todos los ítems contestados,
 * ninguno de más, y todos con un valor de la escala.
 *
 * Falla antes de calcular en vez de devolver una media hecha con la mitad de los
 * datos: un informe construido sobre un test incompleto es peor que no tener informe.
 */
export function validate(responses: Responses, config: Bfi2Config): void {
  const expected = config.questions.map((q) => q.id);
  const known = new Set(expected);

  const desconocidos = Object.keys(responses).map(Number).filter((id) => !known.has(id));
  if (desconocidos.length > 0) {
    throw new ScoringError(
      `Estos ítems no existen en el test: ${desconocidos.join(", ")}`,
      "unknown_item",
      desconocidos,
    );
  }

  const faltan = expected.filter((id) => responses[id] === undefined);
  if (faltan.length > 0) {
    throw new ScoringError(
      `Faltan ${faltan.length} respuestas: ítems ${faltan.join(", ")}`,
      "missing_responses",
      faltan,
    );
  }

  const invalidos = expected.filter((id) => !VALID.has(responses[id]));
  if (invalidos.length > 0) {
    throw new ScoringError(
      `Respuestas fuera de la escala 1–5 en los ítems ${invalidos.join(", ")}`,
      "invalid_response",
      invalidos,
    );
  }
}

function mean(items: readonly number[], recoded: Record<number, Response>): number {
  let total = 0;
  for (const id of items) total += recoded[id];
  return total / items.length;
}

/**
 * Puntúa un test completo.
 *
 * El dominio se calcula como media de sus 12 ítems, no como media de sus 3
 * facetas. Con 4 ítems por faceta ambas dan el mismo número, pero la media de
 * ítems es la que define el manual y la que no se rompe si algún día un
 * instrumento tiene facetas de distinto tamaño.
 *
 * @throws {ScoringError} si las respuestas no pasan `validate`
 */
export function score(responses: Responses, config: Bfi2Config): Scores {
  validate(responses, config);

  const reverseIds = config.questions.filter((q) => q.reverse).map((q) => q.id);
  const recoded = applyReverse(responses, reverseIds);

  const facets: Record<string, number> = {};
  for (const facet of config.facets) facets[facet.id] = mean(facet.items, recoded);

  const domains: Record<string, number> = {};
  for (const domain of config.domains) domains[domain.id] = mean(domain.items, recoded);

  return { recoded, facets, domains };
}

/** Redondea a dos decimales. Solo para mostrar: nunca para seguir calculando. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
