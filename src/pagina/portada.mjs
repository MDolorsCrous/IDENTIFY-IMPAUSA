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
 * De cada dominio solo se guarda lo que no cambia con el idioma: su letra y su
 * nombre en inglés. El nombre en español y sus tres facetas se leen de la
 * configuración, y la frase que explica qué explora, de los textos de idioma.
 */
const OCEAN = [
  { id: "open_mindedness", letra: "O", ingles: "Openness" },
  { id: "conscientiousness", letra: "C", ingles: "Conscientiousness" },
  { id: "extraversion", letra: "E", ingles: "Extraversion" },
  { id: "agreeableness", letra: "A", ingles: "Agreeableness" },
  { id: "negative_emotionality", letra: "N", ingles: "Negative Emotionality" },
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
function tarjetasOcean(recursos, t) {
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
            ${
              // En inglés el nombre del dominio YA es el término internacional:
              // repetirlo debajo sería decir «Extraversion — Extraversion».
              labels.domains[d.id] === d.ingles
                ? ""
                : `<p class="ocean__ingles"><span class="oculto">${t.oculto}</span>${d.ingles}</p>`
            }
          </div>
        </div>
        <p class="ocean__facetas">${facetas.join(" <span aria-hidden=\"true\">·</span> ")}</p>
        <p class="ocean__texto">${esc(t.explica[d.id])}</p>
      </article>`;
  }).join("");
}

/**
 * La vista previa del informe.
 *
 * Las cifras son inventadas y van marcadas como ejemplo. Poner aquí las de
 * alguien real seria publicar el perfil de una persona en la página de entrada.
 */
function vistaPrevia(recursos, t) {
  const ejemplo = [
    { id: "extraversion", valor: 3.4 },
    { id: "agreeableness", valor: 4.1 },
    { id: "conscientiousness", valor: 2.8 },
    { id: "negative_emotionality", valor: 3.1 },
    { id: "open_mindedness", valor: 3.9 },
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
          <span class="muestra__dato">${d.valor.toFixed(1).replace(".", ",")} <em>${t.bandas[d.id]}</em></span>
        </div>`;
    })
    .join("");

  return `
    <div class="muestra" role="group" aria-label="${t.aria}">
      <p class="muestra__sello">${t.sello}</p>
      <div class="muestra__hoja">
        <p class="ojo">${t.ojo}</p>
        <h4>${t.titulo}</h4>
        ${barras}
        <p class="muestra__escala"><span>1</span><span>${t.escalaMedio}</span><span>5</span></p>
        <div class="muestra__bloques">
          ${t.bloques
            .map(
              (b) => `<div class="muestra__bloque">
            <p class="ojo">${b.ojo}</p>
            <p>${b.texto}</p>
          </div>`,
            )
            .join("\n          ")}
        </div>
      </div>
    </div>`;
}

/** El recorrido del resultado, en HTML: no es una imagen con texto dentro. */
const recorrido = (pasos) => `
  <ol class="recorrido">
    ${pasos
      .map(
        (p, i) =>
          `<li><span class="recorrido__n">${i + 1}</span><b>${esc(p.titulo)}</b><span>${esc(p.detalle)}</span></li>`,
      )
      .join("\n    ")}
  </ol>`;

/**
 * La página de inicio entera.
 *
 * @param {object} recursos Lo que devuelve cargarRecursos(): config, labels y marca.
 * @returns {string} HTML con los huecos MARCA_* sin rellenar.
 */
/**
 * Un pliegue de la pila: cabecera siempre visible, contenido a un clic.
 *
 * La cabecera lleva el título y una línea de resumen que se lee con el pliegue
 * cerrado. Es lo que hace que la página siga contando algo aunque no se abra
 * nada: quien pasa de largo se lleva los seis titulares y las seis frases.
 *
 * Es un button de verdad, con aria-expanded y aria-controls, para que un lector
 * de pantalla cante lo mismo que se ve.
 */
function plegable({ id, numero, titulo, resumen, cuerpo }) {
  return `
      <div class="desplegable pliegue">
        <button class="desplegable__cab" type="button" aria-expanded="false" aria-controls="${id}">
          <span class="pliegue__n" aria-hidden="true">${numero}</span>
          <span class="pliegue__texto">
            <b>${esc(titulo)}</b>
            <span class="desplegable__resumen">${esc(resumen)}</span>
          </span>
          <span class="desplegable__flecha" aria-hidden="true">›</span>
        </button>
        <div class="desplegable__cuerpo" id="${id}" hidden>${cuerpo}</div>
      </div>`;
}

/**
 * La página de inicio entera.
 *
 * Va plegada a propósito. Desplegada eran diez pantallas de scroll antes de
 * llegar al botón, y quien entra a hacer un test no lee diez pantallas: o
 * empieza, o se va. Plegada, los seis titulares y sus seis frases caben de una
 * vez, y quien quiera el detalle lo abre.
 *
 * Los límites de lo que mide van en el pliegue 7, y no sueltos: ella los quiso
 * ahí. Van antes de la letra pequeña de las referencias y con su titular a la
 * vista, que es lo que importa — quien recorre la pila los lee de todos modos.
 *
 * @param {object} recursos Lo que devuelve cargarRecursos(): config, labels y marca.
 * @returns {string} HTML con los huecos MARCA_* sin rellenar.
 */
export function paginaDeInicio(recursos) {
  const { fuentes } = recursos;
  const t = recursos.textos.portada;
  const ref = (f) =>
    `<li>${esc(f.autores)} (${f.anio}). <i>${esc(f.titulo)}</i>. ${esc(f.publicacion)}. ` +
    `<a href="https://doi.org/${esc(f.doi)}" target="_blank" rel="noopener">doi.org/${esc(f.doi)}</a></li>`;

  // Cada rejilla de tarjetas: el icono es estructura y se queda aquí; el texto
  // de cada tarjeta viene de los textos de idioma, emparejado por posición.
  const rejilla = (columnas, iconos, tarjetas) =>
    `<div class="rejilla rejilla--${columnas}">
            ${iconos.map((ic, i) => tarjeta(ic, tarjetas[i].titulo, tarjetas[i].texto)).join("\n            ")}
          </div>`;

  const pliegues = [
    plegable({
      id: "queAporta",
      numero: "1",
      titulo: t.pliegues.queAporta.titulo,
      resumen: t.pliegues.queAporta.resumen,
      cuerpo: `
          <p>${t.pliegues.queAporta.intro}</p>
          ${rejilla(3, ["mapa", "chispa", "aviso", "brujula", "personas", "semilla"], t.pliegues.queAporta.tarjetas)}
          <p class="destacado">${t.pliegues.queAporta.destacado}</p>`,
    }),

    plegable({
      id: "rigor",
      numero: "2",
      titulo: t.pliegues.rigor.titulo,
      resumen: t.pliegues.rigor.resumen,
      cuerpo: `
          ${t.pliegues.rigor.parrafos.map((p) => `<p>${p}</p>`).join("\n          ")}
          <p class="destacado">${t.pliegues.rigor.destacado}</p>
          <dl class="confianza">
            ${t.pliegues.rigor.confianza
              .map((c) => `<div><dt>${esc(c.dato)}</dt><dd>${esc(c.texto)}</dd></div>`)
              .join("\n            ")}
          </dl>`,
    }),

    plegable({
      id: "dimensiones",
      numero: "3",
      titulo: t.pliegues.dimensiones.titulo,
      resumen: t.pliegues.dimensiones.resumen,
      cuerpo: `
          <p>${t.pliegues.dimensiones.intro}</p>
          ${rejilla(4, ["ruta", "libro", "mapa", "balanza"], t.pliegues.dimensiones.tarjetas)}
          <p class="destacado">${t.pliegues.dimensiones.destacado}</p>`,
    }),

    plegable({
      id: "cincoDimensiones",
      numero: "4",
      titulo: t.pliegues.cincoDimensiones.titulo,
      resumen: t.pliegues.cincoDimensiones.resumen,
      cuerpo: `
          <p>${t.pliegues.cincoDimensiones.intro}</p>
          <div class="oceanes">${tarjetasOcean(recursos, t.ocean)}</div>
          <p class="apunte">${icono("aviso")}<span>${t.pliegues.cincoDimensiones.apunte}</span></p>`,
    }),

    plegable({
      id: "porQueImporta",
      numero: "5",
      titulo: t.pliegues.porQueImporta.titulo,
      resumen: t.pliegues.porQueImporta.resumen,
      cuerpo: `
          <p>${t.pliegues.porQueImporta.intro}</p>
          ${rejilla(3, ["personas", "ruta", "aviso", "chispa", "semilla"], t.pliegues.porQueImporta.tarjetas)}`,
    }),

    plegable({
      id: "informe",
      numero: "6",
      titulo: t.pliegues.informe.titulo,
      resumen: t.pliegues.informe.resumen,
      cuerpo: `
          <p>${t.pliegues.informe.intro}</p>
          ${recorrido(t.recorrido)}
          ${vistaPrevia(recursos, t.muestra)}
          <p class="apunte">${icono("balanza")}<span>${t.pliegues.informe.apunteDominios}</span></p>

          <h3 class="pliegue__sub">${t.pliegues.informe.descubriras}</h3>
          <ol class="apartados">
            ${t.pliegues.informe.apartados.map((a) => `<li>${a}</li>`).join("\n            ")}
          </ol>

          <h3 class="pliegue__sub">${t.pliegues.informe.valorTitulo}</h3>
          <p>${t.pliegues.informe.valorTexto}</p>
          <ol class="pasos">
            ${t.pliegues.informe.pasos.map((p) => `<li>${p}</li>`).join("\n            ")}
          </ol>
          <p class="apunte">${icono("balanza")}<span>${t.pliegues.informe.apunteHipotesis}</span></p>`,
    }),

    plegable({
      id: "comoLeer",
      numero: "7",
      titulo: t.pliegues.comoLeer.titulo,
      resumen: t.pliegues.comoLeer.resumen,
      cuerpo: `
          <div class="lectura">
            <ul class="lista">
              ${t.pliegues.comoLeer.lista.map((l) => `<li>${l}</li>`).join("\n              ")}
            </ul>
          </div>`,
    }),

    plegable({
      id: "baseCientifica",
      numero: "8",
      titulo: t.pliegues.baseCientifica.titulo,
      resumen: t.pliegues.baseCientifica.resumen,
      cuerpo: `
          <dl class="ficha">
            ${t.pliegues.baseCientifica.ficha
              .map((c) => `<dt>${esc(c.dato)}</dt><dd>${esc(c.texto)}</dd>`)
              .join("\n            ")}
          </dl>
          <p class="ojo">${t.pliegues.baseCientifica.referencias}</p>
          <ol class="referencias">
            ${ref(fuentes.instrumento)}
            ${ref(fuentes.adaptacion)}
            <li>${t.pliegues.baseCientifica.berkeley}
            <a href="https://www.ocf.berkeley.edu/~johnlab/bfi.html" target="_blank" rel="noopener">ocf.berkeley.edu/~johnlab/bfi.html</a></li>
          </ol>
          <p class="atribucion">${esc(t.pliegues.baseCientifica.atribucion)}</p>`,
    }),
  ].join("");

  return `
<div class="inicio">

  <header class="hero">
    ${ondas}
    <div class="ancho hero__caja">
      <h1 class="rotulo"><span id="rn">Identify</span><span class="rotulo__by" id="rb">by Impausa</span></h1>
      <p class="hero__titular">${t.hero.titular}</p>
      <p class="hero__base">${t.hero.base}</p>
      <p class="hero__texto">${t.hero.texto}</p>
      <p class="hero__rigor">${icono("balanza")}<span>${t.hero.rigor}</span></p>
      ${MARCA_CTA_HERO}
      <p class="micro">${t.hero.micro}</p>
      ${MARCA_IDIOMAS}
      ${MARCA_AVISO}
    </div>
  </header>

  <section class="banda banda--blanca">
    <div class="ancho">
      <p class="ojo">${t.central.ojo}</p>
      <h2>${t.central.titulo}</h2>
      <p class="entradilla">${t.central.entradilla}</p>
      <div class="pila">${pliegues}</div>
    </div>
  </section>

  <section class="banda banda--cierre">
    <div class="ancho ancho--estrecho cierre">
      <h2>${t.cierre.titulo}</h2>
      <p>${t.cierre.texto}</p>
      ${MARCA_CTA_FINAL}
      <p class="micro">${t.cierre.micro}</p>
    </div>
  </section>

</div>`;
}
