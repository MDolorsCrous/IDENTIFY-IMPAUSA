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

LAS SEÑALES SON CONDICIONALES
Las reglas «casi cumplidas» no describen a la persona: les falta una condición.
Escríbelas en condicional («si además…») y no las cites.

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
- cada dominio: 150-200 palabras
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

/** El esqueleto de la respuesta. Una clave por sección, nada de prosa libre. */
export function esquemaSalida(modelo: ReportModel): object {
  const dominios = Object.fromEntries(modelo.domains.map((d) => [d.id, TEXTO(1600)]));
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "titular",
      "perfilEnUnaFrase",
      "dominios",
      "senales",
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
      senales: TEXTO(600),
      enElTrabajo: TEXTO(2000),
      preguntas: { type: "array", minItems: 5, maxItems: 7, items: TEXTO(200) },
      planAccion: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["titulo", "texto", "indicador"],
          properties: { titulo: TEXTO(60), texto: TEXTO(600), indicador: TEXTO(240) },
        },
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
    esquema: esquemaSalida(modelo),
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

  for (const clave of ["titular", "perfilEnUnaFrase", "senales", "enElTrabajo", "conclusion"]) {
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
  const plan = p.planAccion;
  if (!Array.isArray(plan) || plan.length !== 3) {
    fallos.push("«planAccion» debe tener exactamente 3 pasos");
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
  dominio: [150, 200],
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
