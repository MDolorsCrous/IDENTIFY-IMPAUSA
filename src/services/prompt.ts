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

/**
 * La clave con la que viaja el pasaje de una combinación.
 *
 * Es el id de la regla con los guiones cambiados por barras bajas
 * (`relaciones-positivas` → `relaciones_positivas`). No es cosmético: los ids
 * de las reglas son la única parte del esquema con guiones —los dominios ya van
 * con barra baja— y la documentación de los esquemas estructurados no dice
 * nada sobre qué caracteres admite un nombre de propiedad. No se puede
 * comprobar sin gastar una llamada, y si no los admitiera fallarían justo los
 * informes que más tienen que decir. Un cambio de un carácter lo evita.
 *
 * La vuelta no se calcula: se busca en las reglas que han disparado, que se
 * conocen. Y una prueba comprueba que las 26 dan claves distintas.
 */
export const claveDeCombinacion = (id: string) => id.replace(/[^A-Za-z0-9_]/g, "_");

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

LAS COMBINACIONES SÍ LAS ESCRIBES TÚ
Cada regla de \`reglasQueHanDisparado\` lleva una \`clave\`, y bajo esa clave
devuelves su pasaje en \`combinaciones\`. Una por regla, ni una más.

Encima de tu pasaje, el informe ya imprime el efecto de la regla, lo que
significa y su cita. **No lo repitas.** Tu pasaje aterriza esa regla en ESTE
perfil, y para eso tienes \`seCumplePor\`, que dice qué facetas y en qué banda la
han hecho saltar:
- qué se ve en esta persona por cumplirse las condiciones que se han cumplido
- qué tensión o qué ventaja concreta introduce, y con qué otra cosa del perfil
  se cruza
- qué hacer con eso

Van afirmadas: todas sus condiciones se cumplen y puedes citar su referencia.
Esa es la diferencia con las señales.

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

PUNTO Y APARTE
Los pasajes largos van en varios párrafos, separados por una línea en blanco
dentro de la misma cadena. Doscientas palabras seguidas se leen mal por bien
escritas que estén: el ojo no encuentra dónde descansar.

Se parte donde cambia la idea, no cada tantas palabras:
- perfilEnUnaFrase: 2 párrafos
- enElTrabajo: 3 párrafos — lo que aporta, lo que cuesta, y qué hacer con ello
- conclusion: 2 párrafos
- cada dominio y cada paso del plan: uno solo, que ya son cortos

LONGITUDES
- titular: una línea, menos de 80 caracteres
- perfilEnUnaFrase: 120-150 palabras
- cada dominio: 80-110 palabras. Son cortos a propósito: la descripción de cada
  faceta ya la pone el informe debajo
- cada combinación: 80-120 palabras
- enElTrabajo: 200-250 palabras
- preguntas: entre 5 y 7, una línea cada una
- planAccion: exactamente 3 pasos, unas 60 palabras cada uno
- conclusion: 80-120 palabras

Devuelve solo el JSON del esquema. Nada más.`;

export const INSTRUCCIONES_EN = `You write the reports for Identify by Impausa, LivePausa's BFI-2 personality
test. You receive an ALREADY INTERPRETED profile and return only the written
passages, as JSON.

WHAT YOU DO NOT DO
- You do not calculate or correct scores: they come given, and they are correct.
- You do not add findings that are not in the material you receive.
- You do not diagnose. No facet is a clinical condition: "Anxiety" and
  "Depression" are technical names of personality scales.
- You do not say whether someone is fit for a job, or predict what they will do.
- You do not invent references.

TONE
Close, professional, human, clear, motivating, deep, respectful, easy to
understand, practical, actionable, prudent and never repetitive. Three rules:
1. Attribute to the results, not to the person: "the results show",
   "your profile tends to", "this suggests".
2. Hedge: "may", "tends to", "usually". Never an absolute about someone.
3. End on something actionable. If you name a cost, say what to do with it.

Nothing grandiose:
  "You are an unstoppable force" → "The results show a high orientation toward action"
  "You are a born leader" → "Your profile can contribute focus, direction and forward drive"
  "Your mind is wired to…" → "You may tend to make decisions quickly"

Second person. Never label: "your pattern tends to…", not "you are an X".
Every weakness with its lever beside it. No empty flattery.

WHAT YOU MAY STATE
- What can be read directly from a score: a statement.
- What a fired combination rule says: a statement, and you may cite its
  reference.
- Anything else: a question or a conditional. Never a statement.

THE DOMAINS: SAY WHAT THE CARDS CANNOT SAY
Below each of your texts, the report prints the reading of each facet exactly as
it comes from the knowledge base, with its citation. **Do not repeat or
paraphrase it**: it would appear twice in nearly the same words.

Your paragraph says what those cards cannot, because each one is written knowing
nothing about the other two:
- what it means that these three particular facets are distributed this way
- which one stands apart from the rest, and what news that brings
- what order of priority follows for this person

Name the scores when they help the reader get oriented, but do not explain again
what each facet is or what its level implies: that is already written just below.

YOU DO WRITE THE COMBINATIONS
Every rule in \`reglasQueHanDisparado\` carries a \`clave\`, and under that key you
return its passage in \`combinaciones\`. One per rule, not one more.

Above your passage, the report already prints the rule's effect, what it means
and its citation. **Do not repeat that.** Your passage lands the rule in THIS
profile, and for that you have \`seCumplePor\`, which says which facets and which
bands made it fire:
- what shows up in this person because the conditions that were met were met
- what concrete tension or advantage it introduces, and what else in the profile
  it crosses with
- what to do about it

They are stated, not hedged as hypotheses: all their conditions are met and you
may cite their reference. That is what separates them from the signals.

YOU DO NOT WRITE THE SIGNALS
The "almost met" rules are written by the code, which knows exactly which
condition is missing and in which band it sits. You do not need to mention them
in any section, and above all **do not state them**: they are one condition
short, so they do not describe this person.

IF THERE IS SENSITIVE MATERIAL
When a rule comes marked as clinical, do not leave it as a verdict: say what to
do, and mention that if it matches what the person is living, talking it over
with a professional is the sensible thing. If it comes marked as delicate,
describe the pattern, never the person.

IF NO RULE HAS FIRED
Do not hide it or pad it out. The weight falls on the domain-by-domain journey.

WHERE THE LEVERS COME FROM
The questions and the plan do not come from your judgment: they come from the
house method (the executive-coach-senior skill). Depending on what came out high
or low:

- Low assertiveness → assertiveness frame: setting limits, saying no, receiving
  criticism. The lever is the concrete script, not "having more confidence".
- Low respectfulness with high assertiveness → conflict frame: what kind of
  conflict it is, what temperature it is at, and separating positions from
  interests.
- High emotional volatility → emotional regulation BEFORE any script for a
  difficult conversation. The order matters.
- Low trust → power dynamics and a map of people: delegating costs more than
  ability explains, and it is trained with small, cheap experiments.
- Low organization with high productiveness → systems and time, not motivation.

And one rule that comes from there: **do not prescribe the missing trait**.
Telling someone with low organization to get more organized almost never works;
the lever is usually external structure, not more effort.

PARAGRAPH BREAKS
Long passages go in several paragraphs, separated by a blank line inside the
same string. Two hundred words in a row read badly no matter how well written:
the eye finds nowhere to rest.

Break where the idea changes, not every so many words:
- perfilEnUnaFrase: 2 paragraphs
- enElTrabajo: 3 paragraphs — what it contributes, what it costs, and what to
  do about it
- conclusion: 2 paragraphs
- each domain and each step of the plan: just one, they are short already

LENGTHS
- titular: one line, under 80 characters
- perfilEnUnaFrase: 120-150 words
- each domain: 80-110 words. They are short on purpose: the report prints each
  facet's description just below
- each combination: 80-120 words
- enElTrabajo: 200-250 words
- preguntas: between 5 and 7, one line each
- planAccion: exactly 3 steps, about 60 words each
- conclusion: 80-120 words

Return only the JSON of the schema. Nothing else.`;

/**
 * Lo que cambia con el idioma del encargo. Las claves del esquema y del
 * material son el contrato y no se traducen; esto es lo que Claude LEE.
 * Las bandas del material se traducen aparte, en materialParaRedactar.
 */
const ENCARGO_POR_IDIOMA: Record<string, {
  instrucciones: string;
  cabEsquema: string;
  cabPerfil: string;
  redacta: string;
  corto: string[];
}> = {
  es: {
    instrucciones: INSTRUCCIONES,
    cabEsquema: "## Esquema de la respuesta",
    cabPerfil: "## El perfil",
    redacta: "Redacta el informe de esta persona.",
    corto: [
      "Redacta el informe de Identify by Impausa con este perfil, siguiendo la skill",
      "`identify-bfi2-knowledge`: su tono, sus longitudes y su protocolo de seguridad.",
      "El perfil viene ya interpretado — no lo recalcules. Devuelve solo el JSON del esquema.",
    ],
  },
  en: {
    instrucciones: INSTRUCCIONES_EN,
    cabEsquema: "## Response schema",
    cabPerfil: "## The profile",
    redacta: "Write this person's report.",
    corto: [
      "Write the Identify by Impausa report for this profile, following the",
      "`identify-bfi2-knowledge` skill: its tone, its lengths and its safety protocol.",
      "The profile comes already interpreted — do not recalculate it. Return only the JSON of the schema.",
    ],
  },
};

const encargoDe = (idioma: string) => {
  const e = ENCARGO_POR_IDIOMA[idioma];
  if (!e) throw new Error(`no hay encargo para el idioma «${idioma}»`);
  return e;
};

/**
 * Las bandas, en la lengua del encargo. Los ids del motor van en castellano
 * (baja…alta); a Claude se le pasan traducidos para que no los copie tal cual a
 * la prosa inglesa. Una prueba los mantiene clavados a los de en-informe.json.
 */
export const BANDAS_EN: Record<string, string> = {
  baja: "low",
  "media-baja": "medium-low",
  "media-alta": "medium-high",
  alta: "high",
};

/**
 * El material: lo que el motor ha resuelto, y lo que la base de conocimiento
 * dice de cada faceta al nivel que ha salido.
 */
export function materialParaRedactar(
  modelo: ReportModel,
  facetas: Record<string, FichaFaceta>,
  idioma = "es",
): unknown {
  const banda = (b: string) => (idioma === "en" ? BANDAS_EN[b] ?? b : b);
  const nivel = (alto: boolean) => (idioma === "en" ? (alto ? "high" : "low") : alto ? "alta" : "baja");
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
      banda: banda(d.band),
      facetaQueSeSepara: d.divergentFacet?.id ?? null,
      facetas: d.facets.map((f) => {
        const ficha = facetas[f.id];
        const lectura = ficha?.[POLO[f.band]];
        return {
          id: f.id,
          nombre: f.label,
          puntuacion: dos(f.score),
          banda: banda(f.band),
          definicion: ficha?.definicion ?? null,
          queSignificaEsteNivel: lectura?.texto ?? null,
          cercaDelPuntoMedio: f.band === "media-baja" || f.band === "media-alta",
        };
      }),
    })),
    reglasQueHanDisparado: modelo.fired.map((m) => ({
      // La llave: es con este nombre con el que hay que devolver el pasaje de
      // esta combinación en `combinaciones`.
      clave: claveDeCombinacion(m.rule.id),
      efecto: m.rule.effect,
      queSignifica: m.rule.summary,
      ambito: m.rule.scope,
      seguridad: m.rule.safety ?? null,
      referencias: m.rule.references,
      // Qué puntuaciones concretas la han hecho saltar. Sin esto, el pasaje no
      // puede aterrizar la regla en ESTE perfil y se queda en la generalidad
      // que ya dice `queSignifica`, impresa justo encima.
      seCumplePor: m.met.map((x) => ({ faceta: x.condition.facet, banda: banda(x.band) })),
    })),
    senales: modelo.nearMisses.map((m) => ({
      efecto: m.rule.effect,
      queSignifica: m.rule.summary,
      leFalta: m.unmet.map((u) => ({
        faceta: u.condition.facet,
        haríaFaltaQueFuera: nivel(u.condition.level === "high"),
        peroEs: banda(u.band),
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

  /**
   * Las combinaciones disparadas, una clave por regla.
   *
   * El bloque entero desaparece cuando no ha disparado ninguna: pedir un objeto
   * vacío obligatorio no significa nada, y la mayoría de los perfiles no
   * disparan ninguna regla.
   *
   * Con `required` puesto a los ids que han disparado, la API garantiza que
   * vuelven todos y ninguno de más — igual que con los cinco dominios. Es la
   * misma razón por la que el plan son tres claves con nombre y no una lista.
   */
  const disparadas = modelo.fired.map((m) => claveDeCombinacion(m.rule.id));
  const combinaciones = disparadas.length
    ? {
        combinaciones: {
          type: "object",
          description:
            "Un pasaje por cada combinación que ha disparado, bajo la «clave» que trae cada una.",
          additionalProperties: false,
          required: disparadas,
          properties: Object.fromEntries(disparadas.map((id) => [id, TEXTO(900)])),
        },
      }
    : {};

  return {
    type: "object",
    additionalProperties: false,
    required: [
      "titular",
      "perfilEnUnaFrase",
      "dominios",
      ...(disparadas.length ? ["combinaciones"] : []),
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
      ...combinaciones,
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
  idioma = "es",
): string {
  const e = encargoDe(idioma);
  return [
    e.instrucciones,
    "",
    e.cabEsquema,
    "",
    "```json",
    JSON.stringify(esquemaSalida(modelo), null, 2),
    "```",
    "",
    e.cabPerfil,
    "",
    "```json",
    JSON.stringify(materialParaRedactar(modelo, facetas, idioma), null, 2),
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
  idioma = "es",
): { sistema: string; mensaje: string; esquema: object } {
  const e = encargoDe(idioma);
  return {
    sistema: e.instrucciones,
    mensaje: [
      e.redacta,
      "",
      e.cabPerfil,
      "",
      "```json",
      JSON.stringify(materialParaRedactar(modelo, facetas, idioma), null, 2),
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
export function promptCorto(
  modelo: ReportModel,
  facetas: Record<string, FichaFaceta>,
  idioma = "es",
): string {
  const e = encargoDe(idioma);
  return [
    ...e.corto,
    "",
    e.cabEsquema,
    "",
    "```json",
    JSON.stringify(esquemaSalida(modelo), null, 2),
    "```",
    "",
    e.cabPerfil,
    "",
    "```json",
    JSON.stringify(materialParaRedactar(modelo, facetas, idioma), null, 2),
    "```",
  ].join("\n");
}

/**
 * Lo que dice validarProsa cuando algo no cuadra, por idioma. Son mensajes que
 * la página enseña en un aviso, así que hablan la lengua del test.
 */
const FALLOS_POR_IDIOMA: Record<string, {
  noObjeto: string;
  falta: (clave: string) => string;
  faltaDominio: (id: string) => string;
  faltaCombinacion: (efecto: string) => string;
  preguntas: string;
  pasos: (n: number) => string;
  pasoIncompleto: (n: number, campo: string) => string;
}> = {
  es: {
    noObjeto: "La respuesta no es un objeto.",
    falta: (clave) => `falta «${clave}»`,
    faltaDominio: (id) => `falta el texto del dominio «${id}»`,
    faltaCombinacion: (efecto) => `falta la lectura de la combinación «${efecto}»`,
    preguntas: "«preguntas» debe tener entre 5 y 7 entradas",
    pasos: (n) => `«planAccion» debe tener exactamente 3 pasos, y tiene ${n}`,
    pasoIncompleto: (n, campo) => `al paso ${n} del plan le falta «${campo}»`,
  },
  en: {
    noObjeto: "The response is not an object.",
    falta: (clave) => `"${clave}" is missing`,
    faltaDominio: (id) => `the text for the "${id}" domain is missing`,
    faltaCombinacion: (efecto) => `the reading of the "${efecto}" combination is missing`,
    preguntas: '"preguntas" must have between 5 and 7 entries',
    pasos: (n) => `"planAccion" must have exactly 3 steps, and it has ${n}`,
    pasoIncompleto: (n, campo) => `step ${n} of the plan is missing "${campo}"`,
  },
};

/** Comprueba una respuesta antes de meterla en el informe. */
export function validarProsa(prosa: unknown, modelo: ReportModel, idioma = "es"): string[] {
  const dice = FALLOS_POR_IDIOMA[idioma] ?? FALLOS_POR_IDIOMA.es;
  const fallos: string[] = [];
  const p = prosa as Record<string, unknown>;
  if (!p || typeof p !== "object") return [dice.noObjeto];

  for (const clave of ["titular", "perfilEnUnaFrase", "enElTrabajo", "conclusion"]) {
    if (typeof p[clave] !== "string" || !(p[clave] as string).trim()) fallos.push(dice.falta(clave));
  }
  const dominios = p.dominios as Record<string, unknown> | undefined;
  for (const d of modelo.domains) {
    if (typeof dominios?.[d.id] !== "string") fallos.push(dice.faltaDominio(d.id));
  }
  // Una lectura por combinación disparada. La sección 5 es «la parte que
  // justifica el informe entero» (docs/03) y hasta ahora salía sin una línea
  // escrita para esta persona: solo el efecto y el resumen del fichero de
  // reglas, iguales para todo el mundo a quien le disparase la misma.
  const combinaciones = p.combinaciones as Record<string, unknown> | undefined;
  for (const m of modelo.fired) {
    const texto = combinaciones?.[claveDeCombinacion(m.rule.id)];
    if (typeof texto !== "string" || !texto.trim()) fallos.push(dice.faltaCombinacion(m.rule.effect));
  }

  const preguntas = p.preguntas;
  if (!Array.isArray(preguntas) || preguntas.length < 5 || preguntas.length > 7) {
    fallos.push(dice.preguntas);
  }
  const plan = pasosDelPlan(p.planAccion);
  if (plan.length !== 3) {
    fallos.push(dice.pasos(plan.length));
  } else {
    plan.forEach((paso, i) => {
      const x = paso as Record<string, unknown>;
      for (const c of ["titulo", "texto", "indicador"]) {
        if (typeof x?.[c] !== "string") fallos.push(dice.pasoIncompleto(i + 1, c));
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
  combinacion: [80, 120],
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
  for (const m of modelo.fired) {
    const texto = prosa.combinaciones?.[claveDeCombinacion(m.rule.id)];
    if (typeof texto === "string") revisar(`combinación ${m.rule.id}`, texto, LONGITUDES.combinacion);
  }
  if (typeof prosa.titular === "string" && prosa.titular.length > 80) {
    avisos.push(`titular: ${prosa.titular.length} caracteres, el encargo pide menos de 80`);
  }
  return avisos;
}

/* ------------------------------------------------------------------------- *
 * Qué dice la redacción, no solo qué forma tiene.
 * ------------------------------------------------------------------------- */

/**
 * Todo el texto redactado, en una sola cadena, para poder buscarlo.
 *
 * Se recorre lo que exista: una redacción a medias también se revisa, y las
 * claves de más —de un esquema viejo— no molestan.
 */
function todoElTexto(prosa: Record<string, any>): string {
  const trozos: string[] = [];
  const meter = (v: unknown) => {
    if (typeof v === "string") trozos.push(v);
    else if (Array.isArray(v)) v.forEach(meter);
    else if (v && typeof v === "object") Object.values(v).forEach(meter);
  };
  meter(prosa);
  return trozos.join("\n");
}

/** Los números que el informe SÍ puede decir: los que ha calculado el motor. */
function numerosDelModelo(modelo: ReportModel): Set<string> {
  const de = (n: number) => {
    const v = dos(n);
    return [v.toFixed(2), v.toFixed(1), String(v)];
  };
  const validos = new Set<string>();
  for (const d of modelo.domains) {
    de(d.score).forEach((x) => validos.add(x));
    for (const f of d.facets) de(f.score).forEach((x) => validos.add(x));
  }
  // La escala. «de 1 a 5», «el punto medio, 3» y el «2,5» de media escala son
  // referencias legítimas y no hallazgos inventados.
  for (const x of ["1", "2", "3", "4", "5", "2.5", "2,5", "3.0", "3,0"]) validos.add(x);
  return validos;
}

/** Lo que no puede aparecer en un informe, con la razón al lado. */
const PROHIBIDO: { que: RegExp; porque: string }[] = [
  {
    // Sin baremos españoles no hay percentiles. Es el límite del producto:
    // las bandas salen de cortes sobre la escala, no de una población.
    que: /\bpercentil(es)?\b|\bpercentile(s)?\b/i,
    porque: "habla de percentiles, y no hay baremos: las bandas salen de cortes sobre la escala",
  },
  {
    que: /\b\d{1,3}\s?%|\bpor ciento\b|\bper ?cent\b/i,
    porque: "da un porcentaje: no hay ninguna población con la que comparar",
  },
  {
    que: /\bdiagn[óo]stic|\bdiagnos(is|e|ed|tic)|\btrastorn|\bdisorder|\bpatol[óo]g|\bpatholog|\bs[íi]ndrome\b|\bsyndrome\b|\bcl[íi]nicamente\b|\bclinically\b/i,
    porque: "usa lenguaje diagnóstico, y esto no es un instrumento clínico",
  },
  {
    // «Nunca etiquetes» está en las instrucciones. Es lo primero que se cuela.
    que: /\beres una? \w|\byou are an? \w/i,
    porque: "etiqueta a la persona («eres un…») en vez de hablar de los resultados",
  },
  {
    que: /\bmás que el\b|\bmejor que (la|el) \w*media|\bbetter than\b|\babove average\b/i,
    porque: "compara con otras personas, y no hay con quién comparar",
  },
];

/**
 * Avisos sobre el contenido. **No invalidan la redacción**, igual que los de
 * longitud: se enseñan.
 *
 * `validarProsa` comprueba la forma —que estén todas las secciones y con el
 * número de piezas que toca— y eso lo cumple igual un texto que se invente un
 * percentil. Esto mira lo otro: si el texto afirma algo que este instrumento no
 * puede sostener.
 *
 * Es una red, no un juez. Puede saltar de más —una cita legítima con un número,
 * un «no eres una persona de…»— y por eso avisa en vez de rechazar: rechazar
 * cuesta pagar la redacción otra vez, y un falso positivo saldría caro.
 */
export function avisosDeContenido(prosa: Record<string, any>, modelo: ReportModel): string[] {
  const avisos: string[] = [];
  const texto = todoElTexto(prosa);

  for (const { que, porque } of PROHIBIDO) {
    const encontrado = texto.match(que);
    if (encontrado) avisos.push(`«${encontrado[0].trim()}» — ${porque}`);
  }

  // Cifras que no ha calculado el motor. Solo decimales: los enteros aparecen
  // por mil razones legítimas (tres pasos, cinco dominios, un año) y buscarlos
  // daría ruido en vez de señal.
  const validos = numerosDelModelo(modelo);
  const inventados = new Set<string>();
  for (const n of texto.match(/\d+[.,]\d+/g) ?? []) {
    if (!validos.has(n) && !validos.has(n.replace(",", "."))) inventados.add(n);
  }
  if (inventados.size) {
    avisos.push(
      `cifras que no salen del perfil: ${[...inventados].join(", ")} — ` +
        "si no son de una cita, están inventadas",
    );
  }

  return avisos;
}
