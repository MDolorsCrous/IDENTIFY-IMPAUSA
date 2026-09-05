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
 * ## Lo que esto NO detecta
 *
 * Un ciclo 1, 2, 3, 4, 5 repetido da desviación 1,41, racha 1 y los cinco
 * valores: **indistinguible de una persona real** con estas medidas. No hay
 * índice sencillo que lo pille, y decir lo contrario sería vender humo.
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

export type NivelDeAtencion = "ok" | "dudosa" | "nula";

export interface Atencion {
  nivel: NivelDeAtencion;
  /** Desviación típica de las 60 respuestas en bruto, sin recodificar. */
  desviacion: number;
  /** La tirada más larga de respuestas idénticas seguidas. */
  racha: number;
  /** Cuántos de los cinco valores de la escala se han llegado a usar. */
  valores: number;
  /** Qué ha saltado, para poder decirlo y no solo puntuarlo. */
  motivos: Array<"unicoValor" | "racha" | "pocosValores" | "sinVariacion">;
}

/**
 * Mira la forma de unas respuestas.
 *
 * @param responses Las 60 respuestas en bruto, tal como se contestaron: **sin
 *   recodificar los ítems inversos**. Recodificadas, un «todo 5» parecería
 *   variado y este análisis no serviría de nada.
 */
export function medirAtencion(responses: Record<number, number>): Atencion {
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

  const motivos: Atencion["motivos"] = [];
  if (valores === 1) motivos.push("unicoValor");
  if (racha >= RACHA_SOSPECHOSA) motivos.push("racha");
  if (valores <= VALORES_SOSPECHOSOS && valores > 1) motivos.push("pocosValores");
  if (desviacion < DESVIACION_SOSPECHOSA && valores > 1) motivos.push("sinVariacion");

  // Un solo valor en los sesenta ítems no es una respuesta descuidada: es que no
  // hay respuesta. Lo demás avisa, pero no impide leer nada.
  const nivel: NivelDeAtencion = valores === 1 ? "nula" : motivos.length ? "dudosa" : "ok";

  return { nivel, desviacion: Number(desviacion.toFixed(2)), racha, valores, motivos };
}
