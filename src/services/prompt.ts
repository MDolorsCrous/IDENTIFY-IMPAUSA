/**
 * Lo que se le pide a Claude para que redacte el informe.
 *
 * Tres piezas: las instrucciones, el material y el esqueleto de la respuesta.
 * Ninguna de las tres deja que el modelo elija el contenido — el contenido ya
 * está decidido por el motor. Lo que se le pide es la redacción.
 *
 * **Claude nunca ve las respuestas al cuestionario.** Recibe puntuaciones,
 * bandas y reglas ya resueltas. Si alguna vez hiciera falta que puntuara, sería
 * señal de que algo se ha roto: eso lo hace el código y es reproducible.
 */

import type { ReportModel } from "./report.ts";
import { POLO } from "./bandas.js";

/** Lo que la base de conocimiento dice de una faceta en cada nivel. */
export interface FichaFaceta {
  definicion: string;
  bajo: { texto: string; referencias: string[] };
  alto: { texto: string; referencias: string[] };
}

/** Dos decimales: el modelo no debe copiar colas decimales al informe. */
const dos = (v: number) => Math.round(v * 100) / 100;

export const INSTRUCCIONES = `Eres quien redacta los informes de Identify by Impausa, el test de personalidad
BFI-2 de LivePausa. Recibes un perfil YA INTERPRETADO y devuelves únicamente los
pasajes redactados, en JSON.

QUÉ NO HACES
- No calculas ni corriges puntuaciones: vienen dadas y son correctas.
- No añades hallazgos que no estén en el material que recibes.
- No diagnosticas. Ninguna faceta es una condición clínica: «Ansiedad» y
  «Depresión» son nombres técnicos de escalas de personalidad.
- No dices si alguien sirve para un puesto, ni predices lo que hará.
- No inventas referencias.

TONO
Próximo, profesional, humano, claro, motivador, profundo, respetuoso, fácil de
entender, práctico, accionable, prudente y no repetitivo. Tres reglas:
1. Atribuye a los resultados, no a la persona: «los resultados muestran»,
   «tu perfil tiende a», «esto sugiere».
2. Matiza: «puede», «tiende a», «suele». Nunca un absoluto sobre alguien.
3. Termina en algo accionable. Si nombras un coste, di qué hacer con él.

Nada grandilocuente:
  «Eres una fuerza imparable» → «Los resultados muestran una alta orientación a la acción»
  «Eres una líder nata» → «Tu perfil puede aportar foco, dirección y capacidad de avance»
  «Tu mente está programada para…» → «Puedes tender a tomar decisiones con rapidez»

Segunda persona. Nunca etiquetes: «tu patrón tiende a…», no «eres un X».
Toda debilidad, con su palanca al lado. Ningún halago vacío.

QUÉ PUEDES AFIRMAR
- Lo que se lee directamente de una puntuación: afirmación.
- Lo que dice una regla de combinación que ha disparado: afirmación, y puedes
  citar su referencia.
- Cualquier otra cosa: pregunta o condicional. Nunca afirmación.

LOS DOMINIOS: DI LO QUE LAS FICHAS NO PUEDEN DECIR
Debajo de cada texto tuyo, el informe imprime la lectura de cada faceta tal como
viene de la base de conocimiento, con su cita. **No la repitas ni la
parafrasees**: quedaría dos veces y casi con las mismas palabras.

Tu párrafo dice lo que esas fichas no pueden decir, porque cada una está escrita
sin saber nada de las otras dos:
- qué significa que estas tres facetas concretas estén repartidas así
- cuál se separa de las demás, y qué noticia trae eso
- qué orden de prioridad se deriva para esta persona

Nombra las puntuaciones cuando ayuden a situarse, pero no vuelvas a explicar qué
es cada faceta ni qué implica su nivel: eso ya está escrito justo debajo.

LAS SEÑALES NO LAS ESCRIBES TÚ
Las reglas «casi cumplidas» las redacta el código, que sabe exactamente cuál
falta y en qué banda está. Tú no tienes que mencionarlas en ninguna sección, y
sobre todo **no las afirmes**: les falta una condición, así que no describen a
esta persona.

SI HAY MATERIAL DELICADO
Cuando una regla venga marcada como clínica, no la dejes como veredicto: di qué
hacer, y menciona que si eso encaja con lo que la persona vive, hablarlo con un
profesional es lo razonable. Si viene marcada como delicada, describe el patrón,
nunca a la persona.

SI NO HA DISPARADO NINGUNA REGLA
No lo disimules ni rellenes. El peso recae en el recorrido dominio a dominio.

DE DÓNDE SACAS LAS PALANCAS
Las preguntas y el plan no salen de tu criterio: salen del método de la casa
(skill executive-coach-senior). Según lo que haya salido alto o bajo:

- Asertividad baja → marco de asertividad: poner límites, decir que no, recibir
  críticas. La palanca es el guion concreto, no «tener más confianza».
- Respeto bajo con asertividad alta → marco de conflicto: qué tipo de conflicto
  es, a qué temperatura está, y separar posiciones de intereses.
- Volatilidad emocional alta → regulación emocional ANTES que cualquier guion de
  conversación difícil. El orden importa.
- Confianza baja → dinámicas de poder y mapa de personas: delegar cuesta más de
  lo que explica la capacidad, y se entrena con pruebas pequeñas y baratas.
- Organización baja con productividad alta → sistemas y tiempo, no motivación.

Y una regla que viene de ahí: **no recetes el rasgo que falta**. Decirle a quien
tiene la organización baja que se organice más no funciona casi nunca; la palanca
suele ser estructura externa, no más esfuerzo.

LONGITUDES
- titular: una línea, menos de 80 caracteres
- perfilEnUnaFrase: 120-150 palabras
- cada dominio: 80-110 palabras. Son cortos a propósito: la descripción de cada
  faceta ya la pone el informe debajo
- enElTrabajo: 200-250 palabras
- preguntas: entre 5 y 7, una línea cada una
- planAccion: exactamente 3 pasos, unas 60 palabras cada uno
- conclusion: 80-120 palabras

Devuelve solo el JSON del esquema. Nada más.`;

/**
 * El material: lo que el motor ha resuelto, y lo que la base de conocimiento
 * dice de cada faceta al nivel que ha salido.
 */
export function materialParaRedactar(
  modelo: ReportModel,
  facetas: Record<string, FichaFaceta>,
): unknown {
  return {
    comparacion: modelo.meta.comparisonNotice,
    metodoDeBandas: modelo.meta.method,
    persona: modelo.meta.generatedFor ?? null,
    titularDeDatos: {
      dominioMasAlto: modelo.headline.highestDomain,
      dominioMasBajo: modelo.headline.lowestDomain,
      facetaMasDistintiva: modelo.headline.mostDistinctiveFacet,
    },
    dominios: modelo.domains.map((d) => ({
      id: d.id,
      nombre: d.label,
      puntuacion: dos(d.score),
      banda: d.band,
      facetaQueSeSepara: d.divergentFacet?.id ?? null,
      facetas: d.facets.map((f) => {
        const ficha = facetas[f.id];
        const lectura = ficha?.[POLO[f.band]];
        return {
          id: f.id,
          nombre: f.label,
          puntuacion: dos(f.score),
          banda: f.band,
          definicion: ficha?.definicion ?? null,
          queSignificaEsteNivel: lectura?.texto ?? null,
          cercaDelPuntoMedio: f.band === "media-baja" || f.band === "media-alta",
        };
      }),
    })),
    reglasQueHanDisparado: modelo.fired.map((m) => ({
      efecto: m.rule.effect,
      queSignifica: m.rule.summary,
      ambito: m.rule.scope,
      seguridad: m.rule.safety ?? null,
      referencias: m.rule.references,
    })),
    senales: modelo.nearMisses.map((m) => ({
      efecto: m.rule.effect,
      queSignifica: m.rule.summary,
      leFalta: m.unmet.map((u) => ({
        faceta: u.condition.facet,
        haríaFaltaQueFuera: u.condition.level === "high" ? "alta" : "baja",
        peroEs: u.band,
      })),
    })),
    avisos: {
      hayMaterialClinico: modelo.safety.clinical,
      hayMaterialDelicado: modelo.safety.delicate,
    },
  };
}

const TEXTO = (max: number) => ({ type: "string", maxLength: max });

/** Un paso del plan de acción. */
const PASO = {
  type: "object",
  additionalProperties: false,
  required: ["titulo", "texto", "indicador"],
  properties: { titulo: TEXTO(60), texto: TEXTO(600), indicador: TEXTO(240) },
};

/**
 * Los pasos del plan, vengan como vengan.
 *
 * El esquema los pide como tres claves con nombre —es la única forma de que la
 * API garantice que son tres— pero las redacciones guardadas de antes son una
 * lista. Las dos formas se leen igual, así que un informe viejo se puede volver
 * a generar sin tener que pagar su redacción otra vez.
 */
export function pasosDelPlan(plan: unknown): unknown[] {
  if (Array.isArray(plan)) return plan;
  if (!plan || typeof plan !== "object") return [];
  const p = plan as Record<string, unknown>;
  return ["paso1", "paso2", "paso3"].map((k) => p[k]).filter(Boolean);
}

/** El esqueleto de la respuesta. Una clave por sección, nada de prosa libre. */
export function esquemaSalida(modelo: ReportModel): object {
  const dominios = Object.fromEntries(modelo.domains.map((d) => [d.id, TEXTO(900)]));
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "titular",
      "perfilEnUnaFrase",
      "dominios",
      "enElTrabajo",
      "preguntas",
      "planAccion",
      "conclusion",
    ],
    properties: {
      titular: TEXTO(80),
      perfilEnUnaFrase: TEXTO(1200),
      dominios: {
        type: "object",
        additionalProperties: false,
        required: modelo.domains.map((d) => d.id),
        properties: dominios,
      },
      enElTrabajo: TEXTO(2000),
      preguntas: { type: "array", minItems: 5, maxItems: 7, items: TEXTO(200) },
      // Tres pasos con nombre, no una lista de tres.
      //
      // Parece rebuscado y no lo es: los esquemas estructurados no aceptan
      // `maxItems`, así que una lista solo podía *pedir* tres pasos en la
      // descripción. El modelo devolvía otro número, `validarProsa` lo rechazaba
      // y había que pagar la redacción otra vez. Con tres claves obligatorias,
      // `required` lo impone y no hay nada que reintentar.
      planAccion: {
        type: "object",
        additionalProperties: false,
        required: ["paso1", "paso2", "paso3"],
        properties: { paso1: PASO, paso2: PASO, paso3: PASO },
      },
      conclusion: TEXTO(1000),
    },
  };
}

/** El encargo entero, listo para pegar en una conversación con Claude. */
export function promptCompleto(
  modelo: ReportModel,
  facetas: Record<string, FichaFaceta>,
): string {
  return [
    INSTRUCCIONES,
    "",
    "## Esquema de la respuesta",
    "",
    "```json",
    JSON.stringify(esquemaSalida(modelo), null, 2),
    "```",
    "",
    "## El perfil",
    "",
    "```json",
    JSON.stringify(materialParaRedactar(modelo, facetas), null, 2),
    "```",
  ].join("\n");
}

/**
 * El encargo partido en las tres piezas que pide la API: instrucciones de
 * sistema, mensaje del usuario y esquema de salida.
 *
 * Es el mismo contenido que `promptCompleto`, repartido donde toca. El esquema
 * no va dentro del texto: va en `output_config.format`, que obliga a la
 * respuesta a cumplirlo en vez de pedirlo por favor.
 *
 * Se usa **el encargo largo, no el corto**. La API no ve las skills que hay
 * instaladas en Claude Code ni en la cuenta de claude.ai, así que las
 * instrucciones tienen que viajar con la petición.
 */
/**
 * El esquema, adaptado a lo que acepta `output_config.format`.
 *
 * Los esquemas estructurados admiten un subconjunto de JSON Schema: `maxItems`,
 * `maxLength` y compañía se rechazan con un 400, y `minItems` solo vale 0 o 1.
 * Aquí se quitan, pero **no se pierden**: se cuentan en la `description`, que
 * es lo que hacen los SDK oficiales. Así el modelo las sigue viendo.
 *
 * Lo que garantiza el número exacto no es esto: son las instrucciones y
 * `validarProsa`, que rechaza la redacción si no cuadra. `esquemaSalida` se
 * queda intacto, que es el contrato del informe.
 */
const NO_SOPORTADAS = [
  "maxLength",
  "minLength",
  "pattern",
  "maxItems",
  "uniqueItems",
  "minimum",
  "maximum",
  "multipleOf",
];

function comoTexto(k: string, v: unknown): string {
  const como: Record<string, string> = {
    maxLength: `máximo ${v} caracteres`,
    minLength: `mínimo ${v} caracteres`,
    maxItems: `máximo ${v} elementos`,
    minItems: `mínimo ${v} elementos`,
  };
  return como[k] ?? `${k}: ${v}`;
}

/**
 * Cuando el mínimo y el máximo coinciden, se dice de una vez.
 *
 * «mínimo 3 elementos, máximo 3 elementos» es una forma torpe de pedir tres, y
 * como el esquema del cable no puede imponerlo —structured outputs no acepta
 * `maxItems`— la frase es lo único que lo sostiene. Conviene que sea clara: una
 * redacción con cuatro pasos la rechaza `validarProsa` y hay que pagarla otra vez.
 */
function juntaMinMax(entrada: Record<string, unknown>, perdidas: string[]): string[] {
  const { minItems, maxItems } = entrada;
  if (typeof minItems !== "number" || minItems !== maxItems) return perdidas;
  const exacto = `exactamente ${minItems} elementos`;
  return [exacto, ...perdidas.filter((p) => !/^(mínimo|máximo) \d+ elementos$/.test(p))];
}

function paraElCable(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(paraElCable);
  if (!valor || typeof valor !== "object") return valor;

  const entrada = valor as Record<string, unknown>;
  const salida: Record<string, unknown> = {};
  const perdidas: string[] = [];

  for (const [k, v] of Object.entries(entrada)) {
    if (NO_SOPORTADAS.includes(k)) {
      perdidas.push(comoTexto(k, v));
    } else if (k === "minItems" && typeof v === "number" && v > 1) {
      perdidas.push(comoTexto(k, v));
      salida[k] = 1;
    } else {
      salida[k] = paraElCable(v);
    }
  }

  const dichas = juntaMinMax(entrada, perdidas);
  if (dichas.length) {
    salida.description = [entrada.description, dichas.join(", ")].filter(Boolean).join(" · ");
  }
  return salida;
}

export function encargoParaLaApi(
  modelo: ReportModel,
  facetas: Record<string, FichaFaceta>,
): { sistema: string; mensaje: string; esquema: object } {
  return {
    sistema: INSTRUCCIONES,
    mensaje: [
      "Redacta el informe de esta persona.",
      "",
      "## El perfil",
      "",
      "```json",
      JSON.stringify(materialParaRedactar(modelo, facetas), null, 2),
      "```",
    ].join("\n"),
    esquema: paraElCable(esquemaSalida(modelo)) as object,
  };
}

/**
 * El encargo corto: solo el perfil y el esquema.
 *
 * Sirve cuando la conversación ya tiene cargada la skill `identify-bfi2-knowledge`,
 * que trae el tono, el método y el protocolo de seguridad. Repetirlos aquí no
 * añadiría nada y arriesgaría lo contrario: dos versiones de las mismas reglas,
 * y ninguna forma de saber cuál manda. Si la skill no está cargada, el encargo
 * que hace falta es `promptCompleto`.
 */
export function promptCorto(modelo: ReportModel, facetas: Record<string, FichaFaceta>): string {
  return [
    "Redacta el informe de Identify by Impausa con este perfil, siguiendo la skill",
    "`identify-bfi2-knowledge`: su tono, sus longitudes y su protocolo de seguridad.",
    "El perfil viene ya interpretado — no lo recalcules. Devuelve solo el JSON del esquema.",
    "",
    "## Esquema de la respuesta",
    "",
    "```json",
    JSON.stringify(esquemaSalida(modelo), null, 2),
    "```",
    "",
    "## El perfil",
    "",
    "```json",
    JSON.stringify(materialParaRedactar(modelo, facetas), null, 2),
    "```",
  ].join("\n");
}

/** Comprueba una respuesta antes de meterla en el informe. */
export function validarProsa(prosa: unknown, modelo: ReportModel): string[] {
  const fallos: string[] = [];
  const p = prosa as Record<string, unknown>;
  if (!p || typeof p !== "object") return ["La respuesta no es un objeto."];

  for (const clave of ["titular", "perfilEnUnaFrase", "enElTrabajo", "conclusion"]) {
    if (typeof p[clave] !== "string" || !(p[clave] as string).trim()) fallos.push(`falta «${clave}»`);
  }
  const dominios = p.dominios as Record<string, unknown> | undefined;
  for (const d of modelo.domains) {
    if (typeof dominios?.[d.id] !== "string") fallos.push(`falta el texto del dominio «${d.id}»`);
  }
  const preguntas = p.preguntas;
  if (!Array.isArray(preguntas) || preguntas.length < 5 || preguntas.length > 7) {
    fallos.push("«preguntas» debe tener entre 5 y 7 entradas");
  }
  const plan = pasosDelPlan(p.planAccion);
  if (plan.length !== 3) {
    fallos.push(`«planAccion» debe tener exactamente 3 pasos, y tiene ${plan.length}`);
  } else {
    plan.forEach((paso, i) => {
      const x = paso as Record<string, unknown>;
      for (const c of ["titulo", "texto", "indicador"]) {
        if (typeof x?.[c] !== "string") fallos.push(`al paso ${i + 1} del plan le falta «${c}»`);
      }
    });
  }
  return fallos;
}

/** Longitudes que pide el encargo, en palabras. */
const LONGITUDES: Record<string, [number, number]> = {
  perfilEnUnaFrase: [120, 150],
  enElTrabajo: [200, 250],
  conclusion: [80, 120],
  // Cortos a propósito: la lectura de cada faceta la imprime el informe justo
  // debajo, así que este párrafo solo dice lo que esas fichas no pueden decir.
  dominio: [80, 110],
};

const palabras = (s: string) => s.trim().split(/\s+/).length;

/**
 * Avisos de longitud. No invalidan nada: la redacción puede ser buena y quedarse
 * corta. Pero si una sección se desvía del encargo conviene verlo antes de
 * mandar el informe, no después.
 */
export function avisosDeLongitud(prosa: Record<string, any>, modelo: ReportModel): string[] {
  const avisos: string[] = [];
  const revisar = (nombre: string, texto: string, rango: [number, number]) => {
    const n = palabras(texto);
    if (n < rango[0]) avisos.push(`${nombre}: ${n} palabras, el encargo pide ${rango[0]}–${rango[1]}`);
    else if (n > rango[1]) avisos.push(`${nombre}: ${n} palabras, se pasa de ${rango[1]}`);
  };

  for (const clave of ["perfilEnUnaFrase", "enElTrabajo", "conclusion"]) {
    if (typeof prosa[clave] === "string") revisar(clave, prosa[clave], LONGITUDES[clave]);
  }
  for (const d of modelo.domains) {
    const texto = prosa.dominios?.[d.id];
    if (typeof texto === "string") revisar(`dominio ${d.id}`, texto, LONGITUDES.dominio);
  }
  if (typeof prosa.titular === "string" && prosa.titular.length > 80) {
    avisos.push(`titular: ${prosa.titular.length} caracteres, el encargo pide menos de 80`);
  }
  return avisos;
}
