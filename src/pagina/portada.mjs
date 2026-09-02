// La pantalla de inicio de Identify: qué es, en qué se apoya, qué sale al final
// y dónde están sus límites.
//
// Vive aparte de tools/render-test.mjs por dos razones. Una: ese fichero ya era
// largo, y el texto de una portada se toca mucho más que el motor de un
// cuestionario. Dos: aquí no se transcribe nada a mano. Los nombres de los cinco
// dominios, los de las quince facetas y los colores salen de src/config y de
// src/i18n, que es lo que usa el motor. Si un día se renombra una faceta, esta
// pantalla cambia sola.
//
// Los dos botones de llamada a la acción se dejan como huecos —MARCA_CTA_HERO y
// MARCA_CTA_FINAL— porque lo que va dentro depende de algo que solo se sabe en
// el navegador: si hay servidor y si la persona ya ha entrado el código. La
// página los rellena al pintar.

export const MARCA_CTA_HERO = "%%CTA_HERO%%";
export const MARCA_CTA_FINAL = "%%CTA_FINAL%%";
export const MARCA_IDIOMAS = "%%IDIOMAS%%";
export const MARCA_AVISO = "%%AVISO%%";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * El orden OCEAN, que es el del acrónimo internacional y no el que usa el
 * informe. Aquí se presenta el modelo; allí se presentan los resultados.
 *
 * De cada dominio solo se guarda lo que no está en los datos: su letra, su
 * nombre en inglés y la frase que explica qué explora. El nombre en español y
 * sus tres facetas se leen de la configuración.
 */
const OCEAN = [
  {
    id: "open_mindedness",
    letra: "O",
    ingles: "Openness",
    explica:
      "Explora tu inclinación a profundizar en ideas, apreciar la belleza e imaginar posibilidades nuevas.",
  },
  {
    id: "conscientiousness",
    letra: "C",
    ingles: "Conscientiousness",
    explica: "Observa cómo estructuras, ejecutas y sostienes tareas, objetivos y compromisos.",
  },
  {
    id: "extraversion",
    letra: "E",
    ingles: "Extraversion",
    explica:
      "Ayuda a comprender cuánto tiendes a buscar interacción, tomar la iniciativa y mantener un ritmo activo.",
  },
  {
    id: "agreeableness",
    letra: "A",
    ingles: "Agreeableness",
    explica:
      "Observa cómo consideras las necesidades de otras personas, cuidas las relaciones y confías en sus intenciones.",
  },
  {
    id: "negative_emotionality",
    letra: "N",
    ingles: "Negative Emotionality",
    explica:
      "Explora con qué facilidad registras preocupación, desánimo o cambios emocionales ante las dificultades.",
  },
];

/** Iconos de trazo, dibujados aquí para no depender de ninguna librería. */
const ICONOS = {
  mapa: "M9 3 3 5.5v15L9 18l6 3 6-2.5v-15L15 6 9 3Zm0 0v15m6-12v15",
  brujula: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5.5-5.5 2 2-5.5 5.5-2Z",
  aviso: "M12 8v5m0 3h.01M10.3 4.3 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z",
  ruta: "M6 3v12m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0v6a6 6 0 0 1-6 6H8",
  personas: "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8",
  semilla: "M12 21c0-6 3-9 9-9 0 6-3 9-9 9Zm0 0c0-6-3-9-9-9 0 5 2 8 6.5 8.8M12 21v-6",
  reloj: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2",
  libro: "M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5A2.5 2.5 0 0 0 4 20.5V4.5Zm0 16A2.5 2.5 0 0 1 6.5 18H20v4H6.5A2.5 2.5 0 0 1 4 20.5Z",
  chispa: "m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Zm7 11 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z",
  balanza: "M12 3v18M7 21h10M5 8h14M5 8 2 15a3.5 3.5 0 0 0 6 0L5 8Zm14 0-3 7a3.5 3.5 0 0 0 6 0l-3-7Z",
};

const icono = (nombre) =>
  '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
  '<path d="' + ICONOS[nombre] + '"/></svg>';

/** Una tarjeta con icono, título y explicación. */
const tarjeta = (ic, titulo, texto) =>
  '<article class="tarjeta">' +
  icono(ic) +
  "<h3>" + esc(titulo) + "</h3><p>" + esc(texto) + "</p></article>";

/** Las ondas del fondo. Decorativas: fuera del árbol de accesibilidad. */
const ondas = `
  <svg class="ondas" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M0 224 60 213.3C120 203 240 181 360 186.7 480 192 600 224 720 224s240-32 360-42.7c120-10.3 240 5.7 300 13.4l60 8V320H0Z" fill="url(#ondaA)"/>
    <path d="M0 256l80-10.7c80-10.3 240-32.3 400-21.3 160 10 320 53 480 53.3 160 .7 320-42.3 400-64l80-21.3V320H0Z" fill="url(#ondaB)"/>
    <defs>
      <linearGradient id="ondaA" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#F47A20"/><stop offset=".38" stop-color="#D5B447"/>
        <stop offset=".72" stop-color="#8FBE5A"/><stop offset="1" stop-color="#27624F"/>
      </linearGradient>
      <linearGradient id="ondaB" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#27624F"/><stop offset=".5" stop-color="#5F927D"/>
        <stop offset="1" stop-color="#D5B447"/>
      </linearGradient>
    </defs>
  </svg>`;

/**
 * Qué tinta se lee sobre un color: blanco si es oscuro, casi negro si es claro.
 *
 * Los cinco colores de dominio no son igual de oscuros —el verde y el azul lo
 * son, el dorado y el naranja no— y poner blanco sobre todos dejaba la letra
 * del dorado ilegible. Se calcula la luminancia relativa, que es lo que mide de
 * verdad si algo se lee, y no el tono.
 */
function tintaSobre(hex) {
  const canal = (i) => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luz = 0.2126 * canal(0) + 0.7152 * canal(1) + 0.0722 * canal(2);
  return luz > 0.32 ? "#2B2317" : "#FFFDFC";
}

/**
 * Las cinco tarjetas de dominio, en orden OCEAN.
 *
 * El color no es lo único que distingue una tarjeta de otra: cada una lleva su
 * letra, su nombre y sus tres facetas escritas. Quien no distinga los colores
 * recibe exactamente la misma información.
 */
function tarjetasOcean(recursos) {
  const { labels, config, marca } = recursos;
  return OCEAN.map((d) => {
    const facetas = config.facets
      .filter((f) => f.domain === d.id)
      .map((f) => esc(labels.facets[f.id]));
    const color = marca?.dominios?.[d.id] ?? "#5F927D";
    return `
      <article class="ocean" style="--tono:${color};--tono-tinta:${tintaSobre(color)}">
        <div class="ocean__cab">
          <span class="ocean__letra" aria-hidden="true">${d.letra}</span>
          <div>
            <h3>${esc(labels.domains[d.id])}</h3>
            <p class="ocean__ingles"><span class="oculto">Término internacional: </span>${d.ingles}</p>
          </div>
        </div>
        <p class="ocean__facetas">${facetas.join(" <span aria-hidden=\"true\">·</span> ")}</p>
        <p class="ocean__texto">${esc(d.explica)}</p>
      </article>`;
  }).join("");
}

/**
 * La vista previa del informe.
 *
 * Las cifras son inventadas y van marcadas como ejemplo. Poner aquí las de
 * alguien real seria publicar el perfil de una persona en la página de entrada.
 */
function vistaPrevia(recursos) {
  const ejemplo = [
    { id: "extraversion", valor: 3.4, banda: "media-alta" },
    { id: "agreeableness", valor: 4.1, banda: "alta" },
    { id: "conscientiousness", valor: 2.8, banda: "media-baja" },
    { id: "negative_emotionality", valor: 3.1, banda: "media-alta" },
    { id: "open_mindedness", valor: 3.9, banda: "alta" },
  ];
  const { labels, marca } = recursos;
  const barras = ejemplo
    .map((d) => {
      const pct = ((d.valor - 1) / 4) * 100;
      const color = marca?.dominios?.[d.id] ?? "#5F927D";
      return `
        <div class="muestra__fila">
          <span class="muestra__nombre">${esc(labels.domains[d.id])}</span>
          <span class="muestra__eje"><span class="muestra__relleno" style="width:${pct}%;background:${color}"></span></span>
          <span class="muestra__dato">${d.valor.toFixed(1).replace(".", ",")} <em>${d.banda}</em></span>
        </div>`;
    })
    .join("");

  return `
    <div class="muestra" role="group" aria-label="Ejemplo visual de un informe, con cifras inventadas">
      <p class="muestra__sello">Ejemplo visual · cifras inventadas</p>
      <div class="muestra__hoja">
        <p class="ojo">Resultado de un vistazo</p>
        <h4>Los cinco dominios</h4>
        ${barras}
        <p class="muestra__escala"><span>1</span><span>3 · punto medio</span><span>5</span></p>
        <div class="muestra__bloques">
          <div class="muestra__bloque">
            <p class="ojo">Interpretación</p>
            <p>Cada dominio se explica con su definición, la lectura de tus tres facetas y las
            tensiones que pueden aparecer.</p>
          </div>
          <div class="muestra__bloque">
            <p class="ojo">Preguntas poderosas</p>
            <p>Preguntas escritas a partir de tus resultados, para llevar a una conversación
            o a un cuaderno.</p>
          </div>
          <div class="muestra__bloque">
            <p class="ojo">Plan de acción</p>
            <p>Tres acciones concretas, cada una con una señal que te dice si está funcionando.</p>
          </div>
        </div>
      </div>
    </div>`;
}

/** El recorrido del resultado, en HTML: no es una imagen con texto dentro. */
const recorrido = `
  <ol class="recorrido">
    <li><span class="recorrido__n">1</span><b>Tus respuestas</b><span>60 afirmaciones, de 1 a 5</span></li>
    <li><span class="recorrido__n">2</span><b>5 dimensiones</b><span>doce ítems cada una</span></li>
    <li><span class="recorrido__n">3</span><b>15 facetas</b><span>cuatro ítems cada una</span></li>
    <li><span class="recorrido__n">4</span><b>Interpretación</b><span>qué dice esa combinación</span></li>
    <li><span class="recorrido__n">5</span><b>Preguntas y plan</b><span>qué puedes hacer con ella</span></li>
  </ol>`;

/**
 * La página de inicio entera.
 *
 * @param {object} recursos Lo que devuelve cargarRecursos(): config, labels y marca.
 * @returns {string} HTML con los huecos MARCA_* sin rellenar.
 */
export function paginaDeInicio(recursos) {
  const { fuentes } = recursos;
  const ref = (f) =>
    `<li>${esc(f.autores)} (${f.anio}). <i>${esc(f.titulo)}</i>. ${esc(f.publicacion)}. ` +
    `<a href="https://doi.org/${esc(f.doi)}" target="_blank" rel="noopener">doi.org/${esc(f.doi)}</a></li>`;

  return `
<div class="inicio">

  <!-- 1. HERO -->
  <header class="hero">
    ${ondas}
    <div class="ancho hero__caja">
      <h1 class="rotulo"><span id="rn">Identify</span><span class="rotulo__by" id="rb">by Impausa</span></h1>
      <p class="hero__titular">Comprende cómo tiendes a pensar, actuar, relacionarte y responder ante lo que
        vives, <span class="realce">y cómo convertir ese conocimiento en decisiones más conscientes</span></p>
      <p class="hero__base">Basado en Big Five/OCEAN <span aria-hidden="true">·</span> BFI-2
        <span aria-hidden="true">·</span> 60 ítems</p>
      <p class="hero__texto">Explora cinco grandes dimensiones y quince facetas de personalidad. Al finalizar
        recibirás un informe personalizado que transforma tus resultados en interpretaciones, preguntas y
        acciones concretas.</p>
      <p class="hero__rigor">${icono("balanza")}<span>Una herramienta de autoconocimiento basada en investigación
        publicada. No es un diagnóstico ni una predicción de conducta.</span></p>
      ${MARCA_CTA_HERO}
      <p class="micro">No hay respuestas correctas o incorrectas. Responde pensando en cómo sueles actuar
        habitualmente.</p>
      ${MARCA_IDIOMAS}
      ${MARCA_AVISO}
    </div>
  </header>

  <!-- 2. TARJETA DESPLEGABLE -->
  <section class="banda banda--blanca">
    <div class="ancho">
      <div class="desplegable">
        <button class="desplegable__cab" type="button" aria-expanded="false" aria-controls="quePuedeAportar">
          <span>
            <b>Descubre qué puede aportarte Identify</b>
            <span class="desplegable__resumen">Comprende tus tendencias, reconoce tus recursos y detecta en qué
            contextos puedes necesitar un ajuste diferente.</span>
          </span>
          <span class="desplegable__flecha" aria-hidden="true">›</span>
        </button>
        <div class="desplegable__cuerpo" id="quePuedeAportar" hidden>
          <ul class="lista">
            <li><b>Cinco dimensiones continuas.</b> No categorías cerradas: grados.</li>
            <li><b>Quince facetas.</b> Tres matices dentro de cada dimensión.</li>
            <li><b>Una lectura personalizada.</b> Escrita a partir de tu combinación, no de una plantilla.</li>
            <li><b>Fortalezas en su contexto.</b> Dónde una tendencia tuya aporta más valor.</li>
            <li><b>Posibles tensiones.</b> Cuándo esa misma tendencia puede dejar de ayudarte.</li>
            <li><b>Aplicación profesional.</b> Cómo puede expresarse en tu forma de trabajar.</li>
            <li><b>Preguntas de reflexión.</b> Para pensar mejor, no para responder rápido.</li>
            <li><b>Acciones de desarrollo.</b> Concretas, con una señal de seguimiento.</li>
          </ul>
          <p class="destacado">El objetivo no es decirte cómo eres de forma absoluta, sino ayudarte a observar
          cómo funcionan tus tendencias y qué puedes hacer con esa información.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. QUE APORTA -->
  <section class="banda">
    <div class="ancho">
      <p class="ojo">Para qué sirve</p>
      <h2>¿Qué aporta hacer el test Identify?</h2>
      <p class="entradilla">Muchas respuestas aparecen de forma automática. Identify convierte esas tendencias en
      un mapa comprensible para que puedas reconocer qué te impulsa, qué puede desgastarte y qué alternativas
      puedes incorporar según la situación.</p>
      <div class="rejilla rejilla--3">
        ${tarjeta("mapa", "Autoconocimiento con matices", "Comprende tu combinación particular de cinco dimensiones y quince facetas sin reducirte a una etiqueta.")}
        ${tarjeta("chispa", "Fortalezas contextualizadas", "Identifica tendencias que pueden ayudarte y los contextos en los que aportan más valor.")}
        ${tarjeta("aviso", "Riesgos por exceso o desajuste", "Detecta cuándo una fortaleza puede dejar de ayudarte por intensidad, desequilibrio o contexto.")}
        ${tarjeta("brujula", "Decisiones más conscientes", "Observa cómo tus tendencias pueden influir en prioridades, hábitos y decisiones.")}
        ${tarjeta("personas", "Relaciones más comprensibles", "Comprende cómo tiendes a conectar, confiar, expresarte y responder ante otras personas.")}
        ${tarjeta("semilla", "Desarrollo orientado a la acción", "Transforma los resultados en preguntas y acciones concretas que puedas experimentar.")}
      </div>
    </div>
  </section>

  <!-- 4. RIGOR -->
  <section class="banda banda--melocoton">
    <div class="ancho ancho--estrecho">
      <p class="ojo">Base metodológica</p>
      <h2>Rigor para comprenderte con más matices</h2>
      <p>Identify se apoya en el modelo Big Five/OCEAN y en la estructura jerárquica del BFI-2. Analiza cinco
      dominios amplios y quince facetas específicas para ofrecer una lectura dimensional de la personalidad.</p>
      <p>Esto permite ir más allá de una etiqueta: muestra grados, diferencias internas y combinaciones que
      ayudan a comprender cómo pueden expresarse tus tendencias en distintos contextos.</p>
      <p>Los resultados son orientativos. Describen cómo te has definido al responder y deben interpretarse
      junto con tu experiencia, tu contexto y, cuando sea necesario, el criterio de un profesional.</p>
      <p class="destacado">La ciencia no te convierte en una etiqueta: aporta un marco para comprender matices
      y formular mejores preguntas.</p>
    </div>
    <div class="ancho">
      <dl class="confianza">
        <div><dt>60 ítems</dt><dd>Cuestionario de autoinforme.</dd></div>
        <div><dt>5 dimensiones</dt><dd>Los grandes dominios del modelo Big Five.</dd></div>
        <div><dt>15 facetas</dt><dd>Tres matices dentro de cada dimensión.</dd></div>
        <div><dt>Adaptación española</dt><dd>Estudiada en investigación publicada.</dd></div>
      </dl>
    </div>
  </section>

  <!-- 5. POR QUE BIG FIVE -->
  <section class="banda banda--blanca">
    <div class="ancho">
      <p class="ojo">El modelo</p>
      <h2>Dimensiones, no etiquetas</h2>
      <p class="entradilla">Big Five/OCEAN no divide a las personas en categorías cerradas. Todas las personas
      presentan las cinco dimensiones en distintos grados, y el valor del resultado está en observar cómo se
      combinan.</p>
      <div class="rejilla rejilla--4">
        ${tarjeta("ruta", "Un modelo dimensional", "Representa grados y no categorías absolutas.")}
        ${tarjeta("libro", "Una lectura jerárquica", "Combina cinco dominios con quince facetas.")}
        ${tarjeta("mapa", "Más matices que una tipología", "Dos personas con un dominio similar pueden presentar facetas diferentes.")}
        ${tarjeta("balanza", "Interpretación contextual", "Una tendencia puede ayudar o dificultar dependiendo de la situación.")}
      </div>
      <p class="destacado">Big Five no busca encasillarte. Busca describir, con matices, cómo tiendes a
      desenvolverte.</p>
    </div>
  </section>

  <!-- 6. LAS CINCO DIMENSIONES -->
  <section class="banda banda--menta">
    <div class="ancho">
      <p class="ojo">O · C · E · A · N</p>
      <h2>Las cinco dimensiones que estudia Identify</h2>
      <p class="entradilla">Todas las personas tenemos las cinco dimensiones. Lo que cambia es la intensidad de
      cada una y la forma en que se combinan sus facetas.</p>
      <div class="oceanes">${tarjetasOcean(recursos)}</div>
      <p class="apunte">${icono("aviso")}<span><b>Ansiedad</b>, <b>Depresión</b> y <b>Volatilidad emocional</b> son
      nombres técnicos de escalas de personalidad. No representan condiciones clínicas ni diagnósticos.</span></p>
    </div>
  </section>

  <!-- 7. POR QUE ES IMPORTANTE -->
  <section class="banda">
    <div class="ancho">
      <p class="ojo">En la vida real</p>
      <h2>¿Por qué es importante conocer estas dimensiones?</h2>
      <p class="entradilla">Conocerte no significa etiquetarte. Significa comprender qué tendencias te impulsan,
      cuáles pueden desgastarte y qué ajustes pueden ayudarte a responder mejor a cada situación.</p>
      <div class="rejilla rejilla--3">
        ${tarjeta("personas", "Relacionarte", "Comprender cómo buscas contacto, expresas opiniones, muestras empatía y construyes confianza.")}
        ${tarjeta("ruta", "Actuar y organizarte", "Reconocer cómo conviertes intenciones en acciones, estructuras tareas y sostienes compromisos.")}
        ${tarjeta("aviso", "Gestionar la tensión", "Observar cómo registras preocupación, desánimo y cambios emocionales cuando aumenta la presión.")}
        ${tarjeta("chispa", "Aprender y crear", "Comprender cómo exploras ideas, imaginas alternativas y conectas con experiencias intelectuales o estéticas.")}
        ${tarjeta("semilla", "Ampliar tu repertorio", "Elegir respuestas diferentes cuando tu tendencia automática no es la más útil para la situación.")}
      </div>
    </div>
  </section>

  <!-- 8. EL RESULTADO -->
  <section class="banda banda--blanca">
    <div class="ancho">
      <p class="ojo">Lo que recibes</p>
      <h2>Mucho más que cinco puntuaciones</h2>
      <p class="entradilla">Al finalizar, Identify genera automáticamente un informe personalizado que explica
      qué significan tus resultados, cómo se combinan y qué puedes hacer con ellos.</p>
      ${recorrido}
      ${vistaPrevia(recursos)}
      <p class="apunte">${icono("balanza")}<span>Los dominios ofrecen la visión más sólida del perfil; las facetas
      permiten profundizar en sus matices y deben leerse con mayor prudencia.</span></p>
    </div>
  </section>

  <!-- 9. QUE DESCUBRIRAS -->
  <section class="banda">
    <div class="ancho">
      <p class="ojo">El informe, apartado a apartado</p>
      <h2>¿Qué descubrirás en tu informe personalizado?</h2>
      <ol class="apartados">
        <li><b>Resumen global.</b> Un titular y una interpretación general de los patrones principales.</li>
        <li><b>Gráfico de los cinco dominios.</b> Puntuaciones de 1 a 5 y bandas en Extraversión, Cordialidad,
        Responsabilidad, Emocionalidad negativa y Apertura de mente.</li>
        <li><b>Análisis de las quince facetas.</b> Las tres facetas de cada dominio, y cuál se separa
        claramente de las otras dos.</li>
        <li><b>Interpretación de cada dominio.</b> Definición, lectura personalizada, posibles aportaciones,
        tensiones y palancas prácticas.</li>
        <li><b>Combinaciones del perfil.</b> Patrones que aparecen al cruzar facetas cuando se cumplen todas
        las condiciones de una regla.</li>
        <li><b>Señales de atención.</b> Combinaciones que se quedan cerca, explicadas en condicional y nunca
        como resultados actuales.</li>
        <li><b>Aplicación en el trabajo.</b> Cómo pueden expresarse esas tendencias profesionalmente.</li>
        <li><b>Preguntas poderosas.</b> Preguntas derivadas de tus resultados.</li>
        <li><b>Plan de acción.</b> Tres acciones concretas, cada una con su indicador de seguimiento.</li>
        <li><b>Imágenes para recordar.</b> Tres metáforas ligadas a las puntuaciones más relevantes.</li>
        <li><b>Conclusiones.</b> Síntesis de recursos, ajustes y prioridades.</li>
        <li><b>Fuentes y metodología.</b> Instrumento, escala, adaptación, referencias y límites.</li>
      </ol>
    </div>
  </section>

  <!-- 10. DEL RESULTADO A LA ACCION -->
  <section class="banda banda--melocoton">
    <div class="ancho">
      <p class="ojo">Qué hacer con ello</p>
      <h2>El valor está en lo que haces con la información</h2>
      <p class="entradilla">El valor del informe no está solo en conocer una puntuación. Está en comprender cómo
      se expresa en tu vida, qué patrones conviene proteger y dónde puede resultar útil introducir un pequeño
      cambio.</p>
      <ol class="pasos">
        <li><b>Reconocer.</b> Poner nombre a tendencias que quizá ya intuías.</li>
        <li><b>Comprender.</b> Observar cómo se combinan dominios y facetas.</li>
        <li><b>Contextualizar.</b> Distinguir cuándo una tendencia ayuda y cuándo puede dificultar.</li>
        <li><b>Accionar.</b> Elegir una pregunta o acción concreta para experimentar.</li>
      </ol>
      <p class="apunte">${icono("balanza")}<span>El informe transforma las puntuaciones en hipótesis de reflexión,
      no en verdades absolutas.</span></p>
    </div>
  </section>

  <!-- 11. BASE CIENTIFICA -->
  <section class="banda banda--blanca">
    <div class="ancho ancho--estrecho">
      <div class="desplegable">
        <button class="desplegable__cab" type="button" aria-expanded="false" aria-controls="baseCientifica">
          <span>
            <b>Conoce la base científica de Identify</b>
            <span class="desplegable__resumen">Modelo, instrumento, estructura, adaptación y referencias.</span>
          </span>
          <span class="desplegable__flecha" aria-hidden="true">›</span>
        </button>
        <div class="desplegable__cuerpo" id="baseCientifica" hidden>
          <dl class="ficha">
            <dt>Modelo</dt><dd>Big Five/OCEAN, como marco dimensional de personalidad.</dd>
            <dt>Instrumento</dt><dd>Big Five Inventory-2 (BFI-2), de Christopher J. Soto y Oliver P. John.</dd>
            <dt>Estructura</dt><dd>60 ítems, cinco dominios y quince facetas; cuatro ítems por faceta y doce por
            dominio, en una escala de 1 a 5.</dd>
            <dt>Adaptación española</dt><dd>Adaptación estudiada por Gallardo-Pujol y colaboradores.</dd>
            <dt>Interpretación</dt><dd>Los resultados se presentan como tendencias y asociaciones, no como
            diagnósticos ni predicciones deterministas. Las combinaciones, las preguntas y el plan de acción
            son elaboración propia de IMPAUSA sobre esa base, y no forman parte del instrumento original.</dd>
          </dl>
          <p class="ojo">Referencias</p>
          <ol class="referencias">
            ${ref(fuentes.instrumento)}
            ${ref(fuentes.adaptacion)}
            <li>Berkeley Personality Lab. Información oficial sobre el BFI-2:
            <a href="https://www.ocf.berkeley.edu/~johnlab/bfi.html" target="_blank" rel="noopener">ocf.berkeley.edu/~johnlab/bfi.html</a></li>
          </ol>
          <p class="atribucion">BFI-2 © Oliver P. John y Christopher J. Soto.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 12. AVISO DE LECTURA -->
  <section class="banda banda--menta">
    <div class="ancho ancho--estrecho">
      <p class="ojo">Cómo leer los resultados</p>
      <h2>Un mapa para conocerte, no una etiqueta</h2>
      <div class="lectura">
        <ul class="lista">
          <li>Identify mide <b>tendencias que describe la propia persona</b>: refleja cómo te describiste al
          responder.</li>
          <li>Esas tendencias son relativamente estables, <b>pero no fijas</b>, y pueden expresarse de manera
          distinta según el contexto.</li>
          <li><b>No hay puntuaciones buenas ni malas.</b> Una tendencia puede ayudar o estorbar según la
          situación, y una puntuación intermedia suele indicar flexibilidad.</li>
          <li><b>No es un diagnóstico</b> ni una prueba clínica.</li>
          <li>No mide inteligencia ni capacidad, y <b>no determina idoneidad</b> para un puesto.</li>
          <li>No predice exactamente lo que vas a hacer, ni sustituye el criterio de un profesional.</li>
          <li>Las bandas indican tu posición <b>dentro de la escala del cuestionario</b>. No son una comparación
          con la población general: este informe no utiliza percentiles normativos.</li>
          <li>Las facetas son escalas de cuatro ítems: <b>sostienen menos peso que los dominios</b> y conviene
          leerlas con más prudencia.</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- 13. CTA FINAL -->
  <section class="banda banda--cierre">
    <div class="ancho ancho--estrecho cierre">
      <h2>Conócete con más profundidad y menos etiquetas</h2>
      <p>Responde las 60 afirmaciones y recibe una lectura personalizada de tus cinco dimensiones y quince
      facetas.</p>
      ${MARCA_CTA_FINAL}
      <p class="micro">No hay respuestas correctas o incorrectas. Elige la opción que mejor describa cómo sueles
      actuar habitualmente.</p>
    </div>
  </section>

</div>`;
}
