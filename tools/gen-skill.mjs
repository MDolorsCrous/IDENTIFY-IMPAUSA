// Genera la skill del BFI-2 desde las fuentes del repositorio.
//
//   node tools/gen-skill.mjs
//
// La skill no se escribe a mano: se genera. Si el conocimiento acabara copiado
// en dos sitios, en unos meses la skill y el motor dirian cosas distintas y
// nadie sabria cual manda. Aqui el repositorio es la fuente y la skill es una
// salida mas, como el informe o el test.
//
// Tres formatos, los mismos que usan las demas skills de la casa:
//   skill/identify-bfi2-knowledge/        carpeta, para Claude Code
//   skill/identify-bfi2-knowledge.skill   paquete, para subir a la web
//   skill/todo-en-uno/SKILL.md            un solo fichero, con anexos
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { INSTRUCCIONES, esquemaSalida } from "../src/services/prompt.ts";
import { construirModelo } from "../src/services/pipeline.ts";
import { cargarRecursos, leer } from "./recursos.mjs";
import { crearZip } from "./zip.mjs";

const RAIZ = fileURLToPath(new URL("../", import.meta.url));
const NOMBRE = "identify-bfi2-knowledge";
const DESTINO = path.join(RAIZ, "skill", NOMBRE);

const recursos = cargarRecursos();
const facetasCfg = leer("src/config/facets.json");
const dominiosCfg = leer("src/config/domains.json");
const formulas = leer("src/config/formulas.json");
const enunciados = leer("src/config/enunciados-oficiales.json");
const es = leer("src/i18n/es.json");
const fichas = recursos.facetas;
const reglas = recursos.rules;
const metaforas = recursos.metaforas;
const etiquetas = recursos.labels;

/** Saca una seccion de un documento por su titulo, sin el titulo. */
function seccion(rutaMd, titulo) {
  const md = readFileSync(path.join(RAIZ, rutaMd), "utf8");
  const i = md.indexOf(titulo);
  if (i < 0) throw new Error(`${rutaMd} no tiene la sección «${titulo}»`);
  const desde = i + titulo.length;
  const j = md.indexOf("\n## ", desde);
  return md.slice(desde, j < 0 ? undefined : j).replace(/^\s+|\s+$/g, "");
}

const NIVEL = { bajo: "Nivel bajo", alto: "Nivel alto" };

// ---------------------------------------------------------------- referencias

function refFacetas() {
  const bloques = dominiosCfg.map((d) => {
    const facetas = facetasCfg.filter((f) => f.domain === d.id);
    const cuerpo = facetas
      .map((f) => {
        const ficha = fichas[f.id];
        const niveles = ["bajo", "alto"]
          .map(
            (n) =>
              `**${NIVEL[n]}.** ${ficha[n].texto}\n` +
              `<sub>${ficha[n].referencias.join(" · ")}</sub>`,
          )
          .join("\n\n");
        return `### ${etiquetas.facets[f.id]}\n\n*${ficha.definicion}*\n\n${niveles}\n\n` +
          `<sub>Ítems ${f.items.join(", ")} · diapositivas ${ficha.sourceSlides.join("–")} del material</sub>`;
      })
      .join("\n\n");
    return `## ${etiquetas.domains[d.id]}\n\n${cuerpo}`;
  });

  return `# Las quince facetas

Qué significa puntuar bajo o alto en cada una. Es la capa más segura de la
interpretación: viene descrita en el material de origen, con sus referencias.

**Cómo usarla.** Las bandas centrales llevan el texto de su polo, pero avisando de que la
puntuación está cerca del punto medio: orienta, no describe un extremo que no se ha dado.
Y una faceta suelta sostiene menos que un dominio — son escalas de cuatro ítems y diez de
las quince quedan por debajo de .70 en la adaptación española.

${bloques.join("\n\n")}
`;
}

function refCombinaciones() {
  const filas = reglas
    .map((r) => {
      // Agrupadas por nivel: evita el «Nivel de energía baja» de concordar el
      // adjetivo con cada nombre, y se lee mejor.
      const lista = (nivel) =>
        r.conditions
          .filter((c) => c.level === nivel)
          .map((c) => etiquetas.facets[c.facet])
          .join(", ")
          .replace(/, ([^,]+)$/, " y $1");
      const condiciones = [
        lista("low") && `puntuación baja en ${lista("low")}`,
        lista("high") && `alta en ${lista("high")}`,
      ]
        .filter(Boolean)
        .join("; ");
      const marcas = [
        r.safety === "clinico" ? "**clínica**" : null,
        r.safety === "delicado" ? "**delicada**" : null,
        r.revision ? "revisión pendiente" : null,
      ].filter(Boolean);
      return (
        `### ${r.effect}\n\n` +
        `**Se cumple con:** ${condiciones}\n\n` +
        `${r.summary}\n\n` +
        `<sub>Ámbito ${r.scope} · ${r.references.join(" · ")} · diapositivas ${r.sourceSlides.join(", ")}` +
        `${marcas.length ? " · " + marcas.join(", ") : ""}</sub>` +
        (r.revision ? `\n\n> ⚠️ ${r.revision}` : "")
      );
    })
    .join("\n\n");

  const clinicas = reglas.filter((r) => r.safety === "clinico").map((r) => r.effect);
  const delicadas = reglas.filter((r) => r.safety === "delicado").map((r) => r.effect);

  return `# Las combinaciones

${reglas.length} reglas sacadas del material de origen. Son lo que hace que el informe diga
algo que la persona no podría deducir mirando cinco números.

**Una regla solo se afirma si se cumplen TODAS sus condiciones.** Si falta una, es una
señal: se escribe en condicional —«si además…»— y **no se cita**, porque no se ha cumplido.

**Qué cuenta como alta o baja.** Solo las bandas extremas. Contar las centrales hace que
casi cualquier perfil roce casi cualquier regla, y eso convierte el informe en ruido.

## Las que piden cuidado

- **Clínicas** — ${clinicas.join(" · ")}. Nunca se dejan como veredicto: llevan qué hacer, y
  la mención de que si eso encaja con lo que la persona vive, hablarlo con un profesional
  es lo razonable.
- **Delicadas** — ${delicadas.join(" · ")}. Describen un patrón, nunca a la persona.
  «Esta combinación se asocia con…», no «eres manipulador». Siempre con la palanca al lado.

${filas}
`;
}

function refBandas() {
  return `# Bandas, baremos y niveles de evidencia

${seccion("docs/02-modelo-interpretacion.md", "## El problema de fondo: no hay baremos")}

---

${seccion("docs/02-modelo-interpretacion.md", "## Niveles de evidencia")}
`;
}

/**
 * Un perfil que dispara combinaciones, para el esquema de ejemplo.
 *
 * El caso del Excel no dispara ninguna —ni ninguno de los de datos/— y con él
 * el esquema salía SIN el bloque `combinaciones`: la skill enseñaba un contrato
 * incompleto justo en la sección que docs/03 llama la que justifica el informe.
 * Sociabilidad y compasión altas con depresión baja disparan dos.
 */
function perfilConCombinaciones() {
  const r = {};
  for (const q of recursos.config.questions) {
    const quiero = ["sociability", "compassion"].includes(q.facet)
      ? 5
      : q.facet === "depression"
        ? 1
        : 3;
    r[q.id] = q.reverse ? 6 - quiero : quiero;
  }
  return r;
}

function refInforme() {
  const modelo = construirModelo(perfilConCombinaciones(), recursos);
  return `# El informe: secciones, tono y esquema de salida

${seccion("docs/03-estructura-informe.md", "# 03 — Estructura del informe").split("\n---")[0]}

---

## El encargo, tal como se le pasa al modelo

Esto es literalmente lo que lleva \`src/services/prompt.ts\`, para que la skill y el
comando pidan lo mismo:

\`\`\`
${INSTRUCCIONES}
\`\`\`

---

## Esquema de la respuesta

Una clave por sección, con longitud máxima. Nada de prosa libre que luego haya que
parsear. Los identificadores de dominio son fijos.

**El bloque \`combinaciones\` se arma para cada perfil**: lleva una clave por regla
disparada —la \`clave\` que trae cada una en el material— y no aparece cuando no dispara
ninguna. El ejemplo de abajo es un perfil que dispara dos.

\`\`\`json
${JSON.stringify(esquemaSalida(modelo), null, 2)}
\`\`\`
`;
}

function refMetaforas() {
  const mapa = facetasCfg
    .map((f) => {
      const m = metaforas.mapa[f.id];
      const nombre = (ids) => ids.map((i) => `${i} ${metaforas.categorias[i].nombre}`).join(" · ");
      return `| ${etiquetas.facets[f.id]} | ${nombre(m.bajo)} | ${nombre(m.alto)} |`;
    })
    .join("\n");

  const catalogo = Object.entries(metaforas.categorias)
    .sort()
    .map(
      ([id, c]) =>
        `### ${id} · ${c.nombre}\n\n` +
        c.metaforas.map((x) => `- **${x.nombre}**: ${x.texto}`).join("\n"),
    )
    .join("\n\n");

  const excluidas = Object.entries(metaforas.excluidas)
    .filter(([k]) => !k.startsWith("_"))
    .map(([id, n]) => `${id} ${n}`)
    .join(" · ");

  return `# Metáforas

Del catálogo de la skill \`metaforas-coaching\`. Sus reglas, que son las que mandan:

- **${metaforas.reglas.maximoPorInforme} en todo el informe**, nunca una por sección.
- **Una imagen-ancla al final**, la de la faceta más distintiva del perfil.
- **Nunca dos de la misma categoría**, que sería repetirse.
- Se eligen **por resonancia con el dato concreto**: solo facetas en banda extrema. Una
  puntuación del medio no justifica una imagen.

## Categorías excluidas, y por qué

${excluidas}

La propia skill las marca como transversales y delicadas: solo se abren cuando la persona
las ha nombrado, y un test de personalidad no lo hace nunca. **No están en este fichero**,
no solo fuera del mapa.

Dos cautelas más: poca sociabilidad **no es** soledad ni ansiedad social — son cosas
distintas, y por eso va a equilibrio y atención plena, que hablan de cómo recarga esa
persona y no de un problema.

## De faceta a categoría

| Faceta | Si sale baja | Si sale alta |
| --- | --- | --- |
${mapa}

## El catálogo

${catalogo}
`;
}

function refSeguridad() {
  return `# Protocolo de seguridad

${seccion("docs/02-modelo-interpretacion.md", "## Protocolo de seguridad")}

---

## Inferencias prohibidas

No se infiere del BFI-2: capacidad intelectual, salud mental, idoneidad para un puesto,
rasgos clínicos, ni predicciones de rendimiento. Describe tendencia, no comportamiento en
un momento dado.

## Los nombres de las facetas

Se mantiene la nomenclatura original del instrumento — decisión de la autora. «Ansiedad» y
«Depresión» son nombres técnicos de escalas de personalidad, no descripciones de un estado
clínico, y el informe lo dice donde aparecen las puntuaciones, no escondido en una leyenda.
`;
}

function assetInstrumento() {
  const inversos = facetasCfg
    .flatMap((f) => f.items)
    .sort((a, b) => a - b)
    .filter((n) => leer("src/config/reverseItems.json").includes(n));

  const items = Object.entries(enunciados.enunciados)
    .map(([n, t]) => {
      const q = leer("src/config/questions.json").find((x) => x.id === Number(n));
      return `| ${n} | ${t} | ${etiquetas.facets[q.facet]} | ${q.reverse ? "inverso" : "directo"} |`;
    })
    .join("\n");

  return `# El instrumento

**BFI-2** (Big Five Inventory-2, Soto & John 2017), adaptación española de Gallardo-Pujol
et al. (2022). ${Object.keys(enunciados.enunciados).length} ítems, ${dominiosCfg.length} dominios, ${facetasCfg.length} facetas.

## Escala

${Object.entries(es.scale).map(([v, t]) => `${v}. ${t}`).join(" · ")}

Enunciado común: **«${es.stem}»**

## Cálculo

- Ítems inversos: \`${formulas.reverse.formula}\`. ${inversos.length} de los 60.
- Faceta: media de sus 4 ítems ya recodificados.
- Dominio: media de sus 12 ítems ya recodificados.
- Rango de cualquier faceta o dominio: ${formulas.range.min},00 – ${formulas.range.max},00.

## Los ${Object.keys(enunciados.enunciados).length} ítems

| # | Enunciado | Faceta | Polaridad |
| --- | --- | --- | --- |
${items}

<sub>Enunciados oficiales del apéndice del postprint (OSF kp572)${
    enunciados.desviaciones?.length
      ? `, con ${enunciados.desviaciones.length} desviaciones declaradas: ítems ${enunciados.desviaciones.map((d) => d.item).join(" y ")}, en forma inclusiva por criterio editorial de IMPAUSA`
      : ""
  }.</sub>
`;
}

// ------------------------------------------------------------------- SKILL.md

const DESCRIPCION =
  `Capa de conocimiento aplicado del BFI-2 (Big Five) de Identify by Impausa: convierte ` +
  `unas puntuaciones de los 5 dominios y las 15 facetas en el contenido del informe — qué ` +
  `significa cada faceta en su nivel, las ${reglas.length} combinaciones documentadas con sus citas, ` +
  `las señales a las que falta una condición, las metáforas que anclan el patrón, el tono ` +
  `de la casa y el protocolo de seguridad. Úsala siempre que haya un perfil o unas ` +
  `puntuaciones BFI-2 y haga falta la capa práctica: interpretar un perfil, redactar o ` +
  `enriquecer el informe de Identify, saber qué dice una faceta alta o baja, qué ` +
  `combinaciones dispara un perfil, o cómo se lee sin baremos. Activa también con: ` +
  `Identify by Impausa, BFI-2, Big Five, OCEAN, informe de personalidad, ` +
  `Extraversión Cordialidad Responsabilidad "Emocionalidad negativa" "Apertura de mente", ` +
  `nombres de facetas (Sociabilidad, Asertividad, Organización, Ansiedad…), ` +
  `bandas sin baremo, niveles de evidencia E1-E4.`;

function skillMd() {
  return `---
name: ${NOMBRE}
description: >
${DESCRIPCION.match(/.{1,95}(\s|$)/g).map((l) => "  " + l.trim()).join("\n")}
---

# Identify by Impausa — capa de conocimiento del BFI-2

> Generada desde el repositorio de Identify. **No la edites a mano**: lo que cambies aquí
> se pierde en la siguiente generación, y además la separa del motor que calcula los
> informes. El sitio donde se cambia es \`src/config/interpretation/\`.

## Qué es esta skill y qué no es

**Es** la capa que convierte unas puntuaciones ya calculadas en contenido de informe:
qué significa cada faceta al nivel que ha salido, qué combinaciones dispara el perfil, qué
señales quedan cerca, y con qué tono se escribe todo eso.

**No es** un motor de cálculo. No puntúa el test, no recodifica ítems inversos y no
calcula medias: eso lo hace el código de Identify y tiene que ser reproducible. Si te
llegan las 60 respuestas en bruto en vez de las puntuaciones, dilo y pide las puntuaciones.

**Tampoco es** el instrumento. Los 60 ítems y las fórmulas están en
\`assets/instrumento.md\` para consulta, no para administrar el test por chat.

## La regla que lo gobierna todo

**Nada por debajo de E2 se afirma.** Lo que se lee de una puntuación y lo que dice una
combinación cumplida son afirmaciones; todo lo demás es pregunta o condicional. Los
niveles están en \`references/bandas-y-evidencia.md\`.

Y una segunda, que viene del material: **no hay puntuaciones buenas ni malas**. Son
tendencias que ayudan o estorban según el contexto, y una puntuación media suele indicar
flexibilidad, no ausencia.

## Paso 1 — Comprueba qué tienes antes de interpretar

| Si tienes | Qué hacer |
| --- | --- |
| Los 5 dominios y las 15 facetas | Adelante |
| Solo los 5 dominios | Trabaja a nivel de dominio **y dilo**. Sin facetas se pierde justo lo que el BFI-2 aporta sobre un Big Five corto |
| Las 60 respuestas en bruto | Pide las puntuaciones: puntuar no es trabajo de esta skill |
| Puntuaciones sin saber de dónde salen las bandas | Pregunta si vienen de un baremo o de la escala. Cambia lo que se puede afirmar |

**Sin baremo, «alta» significa alta respecto a la escala, no respecto a la gente.** El
informe tiene que decirlo con esas palabras. Ver \`references/bandas-y-evidencia.md\`.

## Paso 2 — Interpreta, en este orden

1. **Faceta a faceta** — \`references/facetas.md\`. Cada una en su nivel.
2. **La que se separa** — en cada dominio, si una faceta se aparta de las otras dos, esa
   es la noticia del bloque.
3. **Combinaciones** — \`references/combinaciones.md\`. Solo las que cumplen **todas** sus
   condiciones. Esas se pueden afirmar y citar.
4. **Señales** — las que se quedan a una condición. En condicional y sin cita.
5. **Metáforas** — \`references/metaforas.md\`. Tres en todo el informe y una de ancla.

## Paso 3 — Redacta

El tono, las longitudes por sección y el esquema de salida están en
\`references/informe.md\`, copiados del encargo que usa el comando, para que la skill y el
código pidan exactamente lo mismo.

Tres reglas de las que no se sale:

1. **Atribuye a los resultados**, no a la persona: «los resultados muestran», «tu perfil
   tiende a», «esto sugiere».
2. **Matiza**: «puede», «tiende a», «suele». Nunca un absoluto sobre alguien.
3. **Termina en algo accionable.** Si nombras un coste, di qué hacer con él.

## Paso 4 — Filtro de salida

Antes de entregar, repasa:

- ¿Están todas las secciones del esquema, con sus longitudes?
- ¿Hay algo afirmado que no salga de una puntuación o de una regla cumplida?
- ¿Alguna señal escrita como si se cumpliera?
- ¿Alguna regla clínica sin salida, o alguna delicada describiendo a la persona en vez de
  al patrón? Ver \`references/seguridad.md\`.
- ¿Más de tres metáforas, o alguna de una categoría excluida?
- ¿Aparece «Ansiedad» o «Depresión» leído como diagnóstico?

## Uso con las otras skills de la casa

- **\`laia-coach\`** — cuando Identify se cruza con otros instrumentos. Esta skill aporta la
  lectura del BFI-2; el informe integrativo de 14 secciones lo monta esa.
- **\`metaforas-coaching\`** — el catálogo completo. Aquí van solo las categorías que tocan
  al BFI-2, con sus reglas de uso.
- **\`executive-coach-senior\`** — los marcos de asertividad, conflicto y regulación
  emocional de los que salen las preguntas y el plan de acción.

## Tono

Próximo, profesional, humano, claro, motivador, profundo, respetuoso, fácil de entender,
práctico, accionable, prudente y no repetitivo. Nada grandilocuente:

| No | Sí |
| --- | --- |
| «Eres una fuerza imparable» | «Los resultados muestran una alta orientación a la acción» |
| «Eres una líder nata» | «Tu perfil puede aportar foco, dirección y capacidad de avance» |
| «Tu mente está programada para…» | «Puedes tender a tomar decisiones con rapidez» |

Segunda persona. Nunca etiquetes: «tu patrón tiende a…», no «eres un X». Toda debilidad,
con su palanca al lado. Ningún halago vacío.
`;
}

// ------------------------------------------------------------------- escritura

const REFERENCIAS = [
  ["references/facetas.md", "A", "Las quince facetas", refFacetas],
  ["references/combinaciones.md", "B", "Las combinaciones", refCombinaciones],
  ["references/bandas-y-evidencia.md", "C", "Bandas, baremos y evidencia", refBandas],
  ["references/informe.md", "D", "El informe y su esquema", refInforme],
  ["references/metaforas.md", "E", "Metáforas", refMetaforas],
  ["references/seguridad.md", "F", "Protocolo de seguridad", refSeguridad],
  ["assets/instrumento.md", "G", "El instrumento", assetInstrumento],
];

rmSync(path.join(RAIZ, "skill"), { recursive: true, force: true });
mkdirSync(path.join(DESTINO, "references"), { recursive: true });
mkdirSync(path.join(DESTINO, "assets"), { recursive: true });

const skill = skillMd();
writeFileSync(path.join(DESTINO, "SKILL.md"), skill, "utf8");

const generadas = REFERENCIAS.map(([rel, letra, titulo, fn]) => {
  const contenido = fn();
  writeFileSync(path.join(DESTINO, rel), contenido, "utf8");
  return { rel, letra, titulo, contenido };
});

// Todo en uno: la skill con las referencias como anexos
const todoEnUno =
  skill +
  "\n\n---\n\n" +
  generadas
    .map((r) => `# Anexo ${r.letra} — ${r.titulo}\n\n${r.contenido.replace(/^# .+\n+/, "")}`)
    .join("\n\n---\n\n");
mkdirSync(path.join(RAIZ, "skill/todo-en-uno"), { recursive: true });
writeFileSync(path.join(RAIZ, "skill/todo-en-uno/SKILL.md"), todoEnUno, "utf8");

const kb = (s) => (s.length / 1024).toFixed(1) + " KB";

// El paquete .skill es un ZIP con la carpeta dentro. Se escribe aqui y no con
// Compress-Archive de PowerShell porque ese guarda las rutas con barra
// invertida, y el formato las quiere hacia delante: un .skill asi no sube.
const paquete = crearZip([
  { nombre: `${NOMBRE}/SKILL.md`, datos: Buffer.from(skill, "utf8") },
  ...generadas.map((r) => ({
    nombre: `${NOMBRE}/${r.rel}`,
    datos: Buffer.from(r.contenido, "utf8"),
  })),
]);
writeFileSync(path.join(RAIZ, "skill", `${NOMBRE}.skill`), paquete);

console.log(`skill generada en skill/${NOMBRE}/`);
console.log(`  SKILL.md  ${kb(skill)}`);
for (const r of generadas) console.log(`  ${r.rel.padEnd(34)} ${kb(r.contenido)}`);
console.log(`  todo-en-uno/SKILL.md${" ".repeat(15)}${kb(todoEnUno)}`);
console.log(`
paquete skill/${NOMBRE}.skill (${(paquete.length / 1024).toFixed(1)} KB)`);
