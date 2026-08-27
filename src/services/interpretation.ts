/**
 * Capa de interpretación: convierte puntuaciones en bandas y evalúa qué reglas
 * de combinación disparan.
 *
 * Sigue sin redactar nada. Devuelve qué se cumple y por qué, para que la
 * estructura del informe sea determinista y auditable.
 */

import type { Scores } from "./scoring.ts";

export type Level = "low" | "high";
export type Band = "baja" | "media-baja" | "media-alta" | "alta";

/** Media y desviación típica de una muestra de referencia, por faceta o dominio. */
export interface Norm {
  mean: number;
  sd: number;
}

export interface Condition {
  facet: string;
  level: Level;
}

export interface Rule {
  id: string;
  effect: string;
  conditions: Condition[];
  summary: string;
  scope: string;
  evidence: string;
  safety?: string;
  references: string[];
  sourceSlides: number[];
  appearsIn: string[];
  revision?: string;
}

export interface BandResult {
  score: number;
  band: Band;
  /** Cómo se decidió la banda. Va al informe: no es lo mismo un percentil que un corte. */
  method: "baremo" | "escala";
  /** Solo con baremo. */
  z?: number;
  percentile?: number;
  T?: number;
}

/** Cortes provisionales sobre la escala 1–5. Ver docs/02. */
const CORTES: [number, Band][] = [
  [2.5, "baja"],
  [3.0, "media-baja"],
  [3.5, "media-alta"],
  [Infinity, "alta"],
];

function bandaDesdeValor(valor: number, cortes: [number, Band][]): Band {
  for (const [limite, banda] of cortes) if (valor < limite) return banda;
  return "alta";
}

/** Aproximación de la función de distribución normal (Abramowitz & Stegun 26.2.17). */
function phi(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}

/**
 * Banda de una puntuación.
 *
 * Con baremo se calcula z, percentil y puntuación T, y la banda sale de los
 * cuartiles de la distribución normal — «alta» significa entonces alta respecto a
 * una población. Sin baremo se usan cortes sobre la escala, y el resultado queda
 * marcado como tal: **presentar eso como percentil sería mentir.**
 */
export function band(score: number, norm?: Norm): BandResult {
  if (!norm || !(norm.sd > 0)) {
    return { score, band: bandaDesdeValor(score, CORTES), method: "escala" };
  }
  const z = (score - norm.mean) / norm.sd;
  const percentile = phi(z) * 100;
  const banda: Band =
    percentile < 25 ? "baja" : percentile < 50 ? "media-baja" : percentile < 75 ? "media-alta" : "alta";
  return { score, band: banda, method: "baremo", z, percentile, T: 50 + 10 * z };
}

/** Aplica `band` a las 15 facetas y los 5 dominios. */
export function bands(
  scores: Scores,
  norms: Record<string, Norm> = {},
): { facets: Record<string, BandResult>; domains: Record<string, BandResult> } {
  const mapear = (origen: Record<string, number>) =>
    Object.fromEntries(Object.entries(origen).map(([id, v]) => [id, band(v, norms[id])]));
  return { facets: mapear(scores.facets), domains: mapear(scores.domains) };
}

/**
 * Qué bandas cumplen una condición de la regla.
 *
 * **Esto es la perilla que calibra todo el informe y no tiene una respuesta
 * obvia.** Las reglas del material dicen «Alta Sociabilidad», no «sociabilidad
 * algo por encima de la media»:
 *
 * - Contando las bandas centrales, el caso de ejemplo rozaba 14 de las 26 reglas.
 *   Eso en el informe es ruido, no información.
 * - Sin contarlas —lo estricto, que es el valor por defecto— ese mismo caso no
 *   dispara ninguna. Una regla de tres condiciones exige tres extremos a la vez.
 *
 * Cuál es el punto correcto depende de los baremos, que aún no están: con
 * percentiles, «alta» pasa a ser el cuartil superior y la frecuencia cambia.
 * Hasta entonces se deja estricto y **configurable**, para poder medirlo con
 * casos reales en vez de decidirlo a ojo.
 */
export interface Strictness {
  high: readonly Band[];
  low: readonly Band[];
}

export const ESTRICTO: Strictness = { high: ["alta"], low: ["baja"] };
export const AMPLIO: Strictness = { high: ["alta", "media-alta"], low: ["baja", "media-baja"] };

function cumple(banda: Band, level: Level, strictness: Strictness): boolean {
  return (level === "high" ? strictness.high : strictness.low).includes(banda);
}

export interface RuleMatch {
  rule: Rule;
  /** Condiciones cumplidas, con la banda que las cumplió. */
  met: { condition: Condition; band: Band }[];
  /** Condiciones que fallaron. Vacío si la regla dispara. */
  unmet: { condition: Condition; band: Band }[];
}

export interface Interpretation {
  /** Reglas con todas sus condiciones cumplidas. Se pueden afirmar. */
  fired: RuleMatch[];
  /** Reglas a las que les falta una sola condición. Solo en condicional, nunca como afirmación. */
  nearMisses: RuleMatch[];
}

/**
 * Evalúa las reglas contra las bandas de una persona.
 *
 * Una regla dispara solo si se cumplen **todas** sus condiciones. Las que se
 * quedan a una condición se devuelven aparte como señales de atención: son
 * información, pero no son lo mismo y no pueden redactarse igual.
 */
export function interpret(
  facetBands: Record<string, BandResult>,
  rules: readonly Rule[],
  strictness: Strictness = ESTRICTO,
): Interpretation {
  const fired: RuleMatch[] = [];
  const nearMisses: RuleMatch[] = [];

  for (const rule of rules) {
    const met: RuleMatch["met"] = [];
    const unmet: RuleMatch["unmet"] = [];

    for (const condition of rule.conditions) {
      const resultado = facetBands[condition.facet];
      if (!resultado) {
        unmet.push({ condition, band: "media-baja" });
        continue;
      }
      (cumple(resultado.band, condition.level, strictness) ? met : unmet).push({
        condition,
        band: resultado.band,
      });
    }

    if (unmet.length === 0) fired.push({ rule, met, unmet });
    else if (unmet.length === 1) nearMisses.push({ rule, met, unmet });
  }

  // Primero las de más condiciones: son las más específicas y dicen más.
  const porEspecificidad = (a: RuleMatch, b: RuleMatch) => b.rule.conditions.length - a.rule.conditions.length;
  return { fired: fired.sort(porEspecificidad), nearMisses: nearMisses.sort(porEspecificidad) };
}
