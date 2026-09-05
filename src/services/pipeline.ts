/**
 * De respuestas a modelo de informe, en una sola llamada.
 *
 * La secuencia puntuar → bandas → interpretar → ensamblar estaba copiada en cada
 * sitio que la necesitaba. Aquí no hay lógica nueva: solo deja de repetirse, para
 * que no pueda divergir según quién la llame.
 *
 * No lee ficheros a propósito: recibe la configuración como parámetro, igual que
 * el resto de servicios. Así este directorio se puede copiar tal cual dentro de
 * la app sin arrastrar dependencias de Node.
 */

import { score, type Bfi2Config, type Responses } from "./scoring.ts";
import { bands, interpret, ESTRICTO, type Norm, type Rule, type Strictness } from "./interpretation.ts";
import { buildReport, type Labels, type ReportModel } from "./report.ts";
import { medirAtencion } from "./atencion.ts";

/** Todo lo que define el instrumento: qué se pregunta, cómo se agrupa y cómo se llama. */
export interface Recursos {
  config: Bfi2Config;
  labels: Labels;
  rules: Rule[];
}

export interface Opciones {
  /** Baremos por faceta y dominio. Sin ellos, las bandas salen de la escala. */
  norms?: Record<string, Norm>;
  /** Qué bandas cumplen una condición de regla. Por defecto, solo las extremas. */
  strictness?: Strictness;
  /** Nombre que aparece en la portada. */
  persona?: string;
}

/**
 * Construye el modelo del informe a partir de las respuestas.
 *
 * @throws {ScoringError} si faltan respuestas, hay valores fuera de escala o
 *   llega algún ítem que no existe. Falla antes de calcular nada.
 */
export function construirModelo(
  responses: Responses,
  recursos: Recursos,
  opciones: Opciones = {},
): ReportModel {
  const puntuaciones = score(responses, recursos.config);
  const banded = bands(puntuaciones, opciones.norms ?? {});
  const interpretacion = interpret(banded.facets, recursos.rules, opciones.strictness ?? ESTRICTO);
  const modelo = buildReport(
    puntuaciones,
    banded,
    interpretacion,
    recursos.config.domains,
    recursos.labels,
    opciones.persona,
  );

  // Si el cuestionario sostiene una lectura o lo han rellenado sin leerlo. Va
  // sobre las respuestas EN BRUTO, antes de recodificar los inversos: es lo
  // único que distingue un «5 a todo» de un perfil moderado de verdad.
  modelo.meta.atencion = medirAtencion(responses as Record<number, number>);
  return modelo;
}
