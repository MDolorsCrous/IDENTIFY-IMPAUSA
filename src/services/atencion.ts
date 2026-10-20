/**
 * ¿Se puede leer este cuestionario, o lo han rellenado sin leerlo?
 *
 * Los 60 ítems del BFI-2 están construidos con la mitad invertidos justamente
 * para que el sesgo de aquiescencia se cancele. Funciona tan bien que quien
 * contesta **5 a todo** obtiene exactamente el mismo perfil que quien contesta
 * **1 a todo** y que quien contesta **3 a todo**: 3,00 en los cinco dominios.
 * Correcto psicométricamente y desastroso como producto — sin esto, alguien que
 * ha pulsado sesenta veces el mismo botón recibe un informe personalizado de
 * novecientas palabras sobre un perfil que no existe, y nadie se entera.
 *
 * Aquí no se toca ni una puntuación. Solo se mira **la forma de las respuestas**
 * y se dice si sostienen una lectura.
 *
 * ## Por qué dos indicadores y no uno
 *
 * Ninguno solo llega. Medido con los datos del proyecto:
 *
 * | Patrón                   | desviación | racha | valores |
 * | ------------------------ | ---------- | ----- | ------- |
 * | Una persona de verdad    | 1,42       | 2     | 5       |
 * | Todo igual               | 0          | 60    | 1       |
 * | 5, 4, 5, 4…              | 0,50       | **1** | 2       |
 * | 30 iguales y luego varía | 1,12       | **30**| 5       |
 *
 * La racha no ve el alternado; la variedad no ve la racha. Hacen falta los dos.
 *
 * ## El tercer indicador: la coherencia entre directos e inversos
 *
 * Cada faceta tiene dos ítems directos y dos invertidos que miden lo mismo.
 * Recodificados, en una persona que lee las dos medias se parecen; en quien
 * contesta por un patrón que ignora lo que pone, se separan. Se cuenta en
 * cuántas facetas la separación llega a 2 puntos (un 4,5 frente a un 2,5).
 * Medido:
 *
 * | Patrón                   | facetas contradichas (de 15) |
 * | ------------------------ | ---------------------------- |
 * | Una persona de verdad    | 2                            |
 * | Al azar (200 tiradas)    | 1–6                          |
 * | Ciclo 1, 2, 3, 4, 5      | **12**                       |
 * | 5, 4, 5, 4…              | 15                           |
 * | Todo 5                   | 15                           |
 *
 * El ciclo 1, 2, 3, 4, 5 era justo lo que los dos primeros indicadores no
 * veían —desviación 1,41, racha 1, cinco valores, como una persona real— y aquí
 * salta con 12 facetas de 15. El umbral va en 8, más de la mitad: entre el 6
 * del azar y el 12 del ciclo hay sitio de sobra.
 *
 * ## Lo que esto NO detecta
 *
 * Contestar **al azar**. Pulsar sin mirar no contradice nada de forma
 * sistemática: da entre 1 y 6 facetas contradichas, como una persona real, y
 * una desviación normal. Tampoco a quien lee pero entiende al revés los ítems
 * invertidos: medido, 3 facetas, indistinguible. No hay índice sencillo que
 * pille ninguna de las dos cosas, y decir lo contrario sería vender humo.
 *
 * ## Sobre los umbrales
 *
 * Son **decisiones nuestras, no cortes validados**. Están puestos con holgura
 * sobre lo que hace una persona de verdad —racha de 2 y cinco valores— para que
 * avisen del descuido evidente sin acusar a quien contesta de forma moderada.
 * Igual que las bandas, esto se recalibra el día que haya datos de más gente.
 */

/** Una quinta parte del cuestionario seguida con la misma respuesta. */
const RACHA_SOSPECHOSA = 12;
/** Con dos valores distintos en sesenta ítems no se está describiendo a nadie. */
const VALORES_SOSPECHOSOS = 2;
/** Por debajo de esto las respuestas casi no se mueven. Una persona real: 1,42. */
const DESVIACION_SOSPECHOSA = 0.5;
/** Dos puntos entre la media de los directos y la de los inversos: un 4,5 frente a un 2,5. */
const SEPARACION_CONTRADICTORIA = 2;
/** Más de la mitad de las 15 facetas. Una persona real: 2; el azar: hasta 6; el ciclo: 12. */
const FACETAS_CONTRADICHAS = 8;

export type NivelDeAtencion = "ok" | "dudosa" | "nula";

/** Lo que hace falta saber de cada ítem para medir la coherencia. */
export interface ItemDeAtencion {
  id: number;
  facet: string;
  reverse: boolean;
}

export interface Atencion {
  nivel: NivelDeAtencion;
  /** Desviación típica de las 60 respuestas en bruto, sin recodificar. */
  desviacion: number;
  /** La tirada más larga de respuestas idénticas seguidas. */
  racha: number;
  /** Cuántos de los cinco valores de la escala se han llegado a usar. */
  valores: number;
  /** Facetas en las que directos e inversos se contradicen. */
  contradicciones: number;
  /** Facetas en las que se ha podido mirar (las que tienen ítems de los dos signos). */
  facetas: number;
  /** Qué ha saltado, para poder decirlo y no solo puntuarlo. */
  motivos: Array<"unicoValor" | "racha" | "pocosValores" | "sinVariacion" | "contradicciones">;
}

/**
 * Mira la forma de unas respuestas.
 *
 * @param responses Las 60 respuestas en bruto, tal como se contestaron: **sin
 *   recodificar los ítems inversos**. Recodificadas, un «todo 5» parecería
 *   variado y este análisis no serviría de nada.
 * @param items Qué faceta mide cada ítem y si va invertido. Sin esto no se
 *   puede mirar la coherencia, y se mira solo la forma.
 */
export function medirAtencion(
  responses: Record<number, number>,
  items: ReadonlyArray<ItemDeAtencion> = [],
): Atencion {
  const orden = Object.keys(responses)
    .map(Number)
    .sort((a, b) => a - b);
  const v = orden.map((k) => Number(responses[k]));

  const media = v.reduce((a, b) => a + b, 0) / v.length;
  const desviacion = Math.sqrt(v.reduce((a, b) => a + (b - media) ** 2, 0) / v.length);

  let seguidas = 1;
  let racha = 1;
  for (let i = 1; i < v.length; i++) {
    seguidas = v[i] === v[i - 1] ? seguidas + 1 : 1;
    if (seguidas > racha) racha = seguidas;
  }

  const valores = new Set(v).size;

  // La coherencia: por faceta, la media de los directos frente a la de los
  // inversos, los dos recodificados a la misma dirección. Es la única de las
  // medidas que SÍ mira el contenido —qué ítem es cada uno— y la única que ve
  // un ciclo 1, 2, 3, 4, 5.
  const porFaceta = new Map<string, { directos: number[]; inversos: number[] }>();
  for (const item of items) {
    const r = responses[item.id];
    if (r === undefined) continue;
    const f = porFaceta.get(item.facet) ?? { directos: [], inversos: [] };
    porFaceta.set(item.facet, f);
    (item.reverse ? f.inversos : f.directos).push(item.reverse ? 6 - Number(r) : Number(r));
  }
  const mediaDe = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
  let facetas = 0;
  let contradicciones = 0;
  for (const f of porFaceta.values()) {
    if (!f.directos.length || !f.inversos.length) continue;
    facetas++;
    if (Math.abs(mediaDe(f.directos) - mediaDe(f.inversos)) >= SEPARACION_CONTRADICTORIA) contradicciones++;
  }

  const motivos: Atencion["motivos"] = [];
  if (valores === 1) motivos.push("unicoValor");
  if (racha >= RACHA_SOSPECHOSA) motivos.push("racha");
  if (valores <= VALORES_SOSPECHOSOS && valores > 1) motivos.push("pocosValores");
  if (desviacion < DESVIACION_SOSPECHOSA && valores > 1) motivos.push("sinVariacion");
  if (contradicciones >= FACETAS_CONTRADICHAS && valores > 1) motivos.push("contradicciones");

  // Un solo valor en los sesenta ítems no es una respuesta descuidada: es que no
  // hay respuesta. Lo demás avisa, pero no impide leer nada.
  const nivel: NivelDeAtencion = valores === 1 ? "nula" : motivos.length ? "dudosa" : "ok";

  return {
    nivel,
    desviacion: Number(desviacion.toFixed(2)),
    racha,
    valores,
    contradicciones,
    facetas,
    motivos,
  };
}
