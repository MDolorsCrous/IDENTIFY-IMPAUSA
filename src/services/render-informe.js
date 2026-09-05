// Monta el HTML del informe. Funcion pura: recibe el modelo y los textos y
// devuelve una cadena. No lee disco ni conoce Node, para que la pagina del test
// pueda llevarse este mismo fichero y no haya dos renderizadores que se separen.
//
// Identidad visual: la misma que los informes Connect de la casa, para que los
// dos documentos se reconozcan como de la misma familia. Montserrat para titulos
// y etiquetas, Lato para el cuerpo, chevron dorado en los titulos de seccion,
// tarjetas en verde menta y un color estable por dominio. Los valores —colores,
// tipografias, logotipo, contacto— no estan aqui: vienen de src/config/marca.json,
// que es donde se cambian.
//
// El rotulo de portada es la excepcion y conserva su serif: lo manda la skill
// retol-test-impausa, y es la marca del producto, no el cuerpo del texto.

import { POLO, MATIZADA } from "./bandas.js";
import { pasosDelPlan, claveDeCombinacion } from "./prompt.ts";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (v) => v.toFixed(2).replace(".", ",");
/** Posicion de una puntuacion 1-5 sobre el eje, en porcentaje. */
const pos = (v) => ((v - 1) / 4) * 100;
/**
 * Rellena los huecos {asi} de una cadena de src/i18n con valores ya preparados.
 * Los valores llegan escapados por quien llama; la plantilla puede llevar <b>.
 */
const rellena = (plantilla, valores) =>
  plantilla.replace(/\{(\w+)\}/g, (_, clave) => valores[clave]);

function fila(item, destacada, color, t, nombreBanda) {
  return `
      <div class="fila${destacada ? " fila--destacada" : ""}"${color ? ` style="--dominio:${color}"` : ""}>
        <div class="fila__nombre">${esc(item.label)}${
          destacada ? `<span class="marca">${t.seSepara}</span>` : ""
        }</div>
        <div class="eje${destacada ? " eje--acento" : ""}" role="img" aria-label="${rellena(t.aria, { nombre: esc(item.label), valor: num(item.score), banda: nombreBanda(item.band) })}">
          <div class="eje__medio"></div>
          <div class="eje__relleno" style="width:${pos(item.score)}%"></div>
          <div class="eje__punto" style="left:${pos(item.score)}%"></div>
        </div>
        <div class="fila__dato"><b>${num(item.score)}</b><span>${nombreBanda(item.band)}</span></div>
      </div>`;
}

const lineaEscala = (t) =>
  `<div class="escala"><div></div><div class="escala__eje"><span>1</span><span>${t.medio}</span><span>5</span></div><div class="escala__hueco"></div></div>`;

/**
 * Un pasaje de Claude, partido en parrafos.
 *
 * Los textos largos llegan con una linea en blanco donde cambia la idea, y aqui
 * se convierte en un parrafo de verdad. Doscientas palabras en un solo bloque se
 * leen mal por bien escritas que esten: el ojo no encuentra donde descansar.
 *
 * Una redaccion antigua, sin lineas en blanco, sale como un solo parrafo y no se
 * rompe nada.
 */
function parrafos(texto) {
  return String(texto)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("\n      ");
}

/**
 * La entradilla de las señales, escrita por el codigo.
 *
 * La escribia Claude, y era pagar por poner en prosa una lista que el motor ya
 * tiene: que reglas se han quedado a una condicion, cual les falta y en que
 * banda esta. Ademas es el apartado donde mas facil seria afirmar como hecho una
 * combinacion que NO se ha cumplido; escrito por el codigo, eso no puede pasar.
 */
function introSenales(modelo, labels, t) {
  const n = modelo.nearMisses.length;
  if (!n) {
    return `<p>${t.ninguna}</p>`;
  }
  const cuantas = n === 1 ? t.una : rellena(t.varias, { n });
  const faltan = new Set(modelo.nearMisses.flatMap((m) => m.unmet.map((u) => u.condition.facet)));
  const nombres = [...faltan].map((id) => esc((labels.facets?.[id] ?? id).toLowerCase()));
  const cuales =
    nombres.length === 1
      ? rellena(t.unaFaceta, { faceta: nombres[0] })
      : rellena(t.variasFacetas, {
          lista: nombres.slice(0, -1).map((x) => `<b>${x}</b>`).join(", "),
          ultima: nombres.at(-1),
        });

  return `<p>${rellena(t.entrada, { cuantas, cuales })}</p>
    <p>${t.porEso}</p>`;
}

/**
 * El aviso de si estas respuestas sostienen una lectura.
 *
 * Va en «Cómo leer este informe», que es donde toca: quien lo reciba tiene que
 * saberlo antes de leer nada de lo que viene después. Con «nula» el informe
 * escrito no llega a pedirse, así que aquí solo se ve el caso dudoso — salvo
 * que alguien vuelva a montar un informe viejo, y entonces también se dice.
 */
function avisoDeAtencion(a, t) {
  if (!a || a.nivel === "ok" || !t) return "";
  if (a.nivel === "nula") {
    return `<div class="aviso aviso--atencion"><p><b>${esc(t.nulaTitulo)}</b></p>
      <p style="margin-bottom:0">${esc(t.nulaTexto)}</p></div>`;
  }
  const motivos = a.motivos
    .map((m) => {
      if (m === "racha") return rellena(t.motivoRacha, { n: a.racha });
      if (m === "pocosValores") return rellena(t.motivoPocosValores, { n: a.valores });
      if (m === "sinVariacion") return t.motivoSinVariacion;
      return "";
    })
    .filter(Boolean);
  return `<div class="aviso aviso--atencion"><p><b>${esc(t.dudosaTitulo)}</b></p>
    <p style="margin-bottom:0">${esc(rellena(t.dudosaTexto, { motivo: motivos.join("; ") }))}</p></div>`;
}

/**
 * Las tipografias de la casa, dentro del documento.
 *
 * Montserrat para titulos y etiquetas, Lato para el cuerpo — las dos de la skill
 * impausa-brand-book, que es donde se mantienen. Van incrustadas y no enlazadas
 * porque el informe se imprime y se convierte en PDF: con un enlace, el dia que
 * no haya red o cambie el servicio de fuentes, la maquetacion se descuadra.
 *
 * El rotulo «Identify by Impausa» conserva Playfair, que es lo que manda la
 * skill retol-test-impausa. Es la marca del producto, no el cuerpo del texto.
 */
function tipografias(marca) {
  const t = marca?.tipografias;
  if (!t) return "";
  const cara = (familia, peso, b64) => `@font-face{font-family:"${familia}";font-style:normal;
    font-weight:${peso};font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2")}`;
  return `<style>
    ${cara("Montserrat", "400 700", t.montserrat)}
    ${cara("Lato", "400", t.lato400)}
    ${cara("Lato", "700", t.lato700)}
  </style>`;
}

/**
 * La cabecera de marca: la banda de color y el logotipo, arriba del todo.
 *
 * Misma composicion que los informes de Connect, para que los dos documentos de
 * la casa se reconozcan como de la misma familia. El degradado es el del propio
 * logotipo, el mismo que cierra el informe abajo.
 */
function cabeceraDeMarca(marca) {
  if (!marca) return "";
  return `
  <header class="cabecera">
    <div class="cabecera__banda" aria-hidden="true"></div>
    <img class="cabecera__logo" src="${marca.logo.src}" alt="${esc(marca.logo.alt)}"
      width="${marca.logo.ancho}" height="${marca.logo.alto}">
  </header>`;
}

/**
 * El cierre de marca: logotipo, contacto y copyright.
 *
 * El logotipo va incrustado en base64 y no enlazado: el informe se manda por
 * correo, se guarda y se imprime, y tiene que verse igual sin conexion.
 */
function cierreDeMarca(marca, t) {
  if (!marca) return "";
  const { logo, logoLive, correo, web, copyright, producto } = marca;
  return `
  <footer class="firma">
    <div class="firma__logos">
      <img class="firma__logo" src="${logo.src}" alt="${esc(logo.alt)}" width="${logo.ancho}" height="${logo.alto}">
      ${
        logoLive
          ? `<img class="firma__live" src="${logoLive.src}" alt="${esc(logoLive.alt)}"
        width="${logoLive.ancho}" height="${logoLive.alto}">`
          : ""
      }
    </div>
    <p class="firma__linea">
      <a href="mailto:${esc(correo)}">${esc(correo)}</a>
      <span class="firma__sep" aria-hidden="true">·</span>
      <a href="https://${esc(web)}">${esc(web)}</a>
    </p>
    <p class="firma__copy">${esc(copyright)}</p>
    <p class="firma__copy firma__quien">${rellena(t.quien, { producto: esc(producto) })}</p>
  </footer>`;
}

/**
 * La bibliografia, al final del informe.
 *
 * Sale de src/config/fuentes.json, no de aqui: cada referencia esta verificada
 * contra Crossref y lleva su DOI, para que quien lea el informe pueda ir a
 * comprobarlo. Un informe que cita autores dentro del texto y no dice que son
 * deja al lector colgado.
 */
function bibliografia(fuentes) {
  if (!fuentes) return "";
  const entradas = [fuentes.instrumento, fuentes.adaptacion, ...fuentes.interpretacion];
  return `
    <ol class="fuentes">
      ${entradas
        .map(
          (f) => `<li>
        <span class="fuentes__ref">${esc(f.autores)} (${f.anio}). <i>${esc(f.titulo)}</i>.
        ${esc(f.publicacion)}. <a href="https://doi.org/${esc(f.doi)}">doi.org/${esc(f.doi)}</a></span>
        <span class="fuentes__papel">${esc(f.papel)}</span>
      </li>`,
        )
        .join("\n      ")}
    </ol>
    <p class="fuentes__copy">${esc(fuentes._atribucion)}</p>`;
}

/**
 * La linea de datos de un dominio, escrita por el codigo.
 *
 * No es interpretacion, es descripcion: dice lo que pone el numero. Por eso puede
 * ir en el informe aunque no haya capa de redaccion.
 */
function lineaDatos(d, t, nombreBanda) {
  const partes = [rellena(t.linea, { nombre: esc(d.label), valor: num(d.score), banda: nombreBanda(d.band) })];
  if (d.divergentFacet) {
    const f = d.divergentFacet;
    partes.push(rellena(t.divergente, { nombre: esc(f.label), valor: num(f.score) }));
  } else {
    partes.push(t.juntas);
  }
  return `<p>${partes.join(" ")}</p>`;
}

/**
 * Lo que significa cada faceta al nivel que ha salido.
 *
 * Sale de la base de conocimiento de IMPAUSA. Las bandas centrales llevan el
 * mismo texto que su polo pero avisando de que la puntuación está cerca del
 * punto medio: la lectura orienta, no describe un extremo que no se ha dado.
 */
function lecturasFacetas(dominio, facetas, t, nombreBanda) {
  if (!facetas) return "";
  const bloques = dominio.facets
    .map((f) => {
      const ficha = facetas[f.id];
      const polo = POLO[f.band];
      const lectura = ficha?.[polo];
      if (!lectura) return "";
      const matizada = MATIZADA.has(f.band);
      return `
        <div class="lectura">
          <div class="lectura__cab">
            <b>${esc(f.label)}</b>
            <span>${num(f.score)} · ${nombreBanda(f.band)}</span>
          </div>
          ${ficha.definicion ? `<p class="lectura__def">${esc(ficha.definicion)}</p>` : ""}
          <p>${matizada ? `<em class="matiz">${t.matiz}</em> ` : ""}${esc(lectura.texto)}</p>
          ${lectura.referencias?.length ? `<p class="lectura__ref">${esc(lectura.referencias.join(" · "))}</p>` : ""}
        </div>`;
    })
    .join("");
  return bloques ? `<div class="lecturas">${bloques}</div>` : "";
}

/**
 * Elige las metaforas del informe.
 *
 * Reglas de la skill metaforas-coaching, que las trae escritas: **tres en todo
 * el informe, nunca una por seccion, y una imagen-ancla al final**. Y se eligen
 * "por resonancia con el dato concreto", asi que solo entran facetas en banda
 * extrema: una puntuacion del medio no justifica una imagen.
 *
 * La eleccion dentro de cada categoria es determinista —depende de la propia
 * puntuacion— para que dos perfiles distintos no reciban siempre la misma
 * imagen, pero el mismo perfil reciba siempre la suya.
 */
export function metaforasParaInforme(modelo, metaforas) {
  if (!metaforas?.mapa) return null;

  const extremas = modelo.domains
    .flatMap((d) => d.facets)
    .filter((f) => f.band === "baja" || f.band === "alta")
    .sort((a, b) => Math.abs(b.score - 3) - Math.abs(a.score - 3));

  const elegidas = [];
  const categoriasUsadas = new Set();
  const tope = metaforas.reglas?.maximoPorInforme ?? 3;

  for (const f of extremas) {
    if (elegidas.length >= tope) break;
    const nivel = f.band === "baja" ? "bajo" : "alto";
    const candidatas = metaforas.mapa[f.id]?.[nivel] ?? [];
    const categoria = candidatas.find((c) => !categoriasUsadas.has(c));
    const ficha = categoria && metaforas.categorias[categoria];
    if (!ficha) continue;

    categoriasUsadas.add(categoria);
    const indice = Math.round(f.score * 100) % ficha.metaforas.length;
    elegidas.push({
      faceta: f.id,
      etiqueta: f.label,
      banda: f.band,
      categoria: ficha.nombre,
      ...ficha.metaforas[indice],
    });
  }

  if (!elegidas.length) return null;

  // El ancla es la de la faceta mas distintiva del perfil si esta entre las
  // elegidas; si no, la primera, que es la mas extrema.
  const encontrada = elegidas.findIndex((m) => m.faceta === modelo.headline.mostDistinctiveFacet);
  const iAncla = encontrada >= 0 ? encontrada : 0;
  return { imagenes: elegidas.filter((_, i) => i !== iAncla), ancla: elegidas[iAncla] };
}

export function renderInforme(modelo, prosa = {}, labels, opciones = {}) {
  const textos = opciones.textos;
  if (!textos) throw new Error("renderInforme necesita opciones.textos: el grupo «informe» de src/i18n/*-textos.json");
  const facetas = opciones.facetas;
  const colores = opciones.marca?.dominios;
  const metaforas = metaforasParaInforme(modelo, opciones.metaforas);
  const conProsa = Boolean(prosa && Object.keys(prosa).length);
  const fecha = opciones.fecha ?? "";
  const persona = modelo.meta.generatedFor ?? "";
  // La lengua del documento. Sin ella, `hyphens` parte con las reglas de otro
  // idioma; y con el informe ya en dos lenguas, ponerla fija sería mentir.
  const lang = opciones.lang ?? opciones.idioma ?? "es";

  // El motor trabaja con los ids de banda (baja…alta); lo que se lee sale del
  // mapa de labels, que en castellano es la identidad. Ya llega escapado.
  const nombreBanda = (b) => esc(labels.bandas?.[b] ?? b);

  const escala = lineaEscala(textos.escala);
  /**
   * Hueco de redaccion. Se marca en vez de dejarse en blanco: un vacio parece
   * un error, y esto dice exactamente que falta y quien lo escribe.
   */
  const hueco = (que) =>
    `<p class="pendiente"><b>${textos.pendiente.titulo}</b> — ${esc(que)}. ${textos.pendiente.cola}</p>`;

  const resumenVisual = `<div class="barras">${modelo.domains.map((d) => fila(d, false, colores?.[d.id], textos.fila, nombreBanda)).join("")}</div>${escala}`;

  const dominios = modelo.domains
    .map((d) => {
      const nota = labels.notas?.[d.id];
      const texto = prosa.dominios?.[d.id];
      return `
    <section class="dominio"${colores?.[d.id] ? ` style="--dominio:${colores[d.id]}"` : ""}>
      <header class="dominio__cab">
        <h3>${esc(d.label)}</h3>
        <span class="dominio__dato">${num(d.score)} <em>${nombreBanda(d.band)}</em></span>
      </header>
      <div class="barras">${d.facets.map((f) => fila(f, d.divergentFacet?.id === f.id, colores?.[d.id], textos.fila, nombreBanda)).join("")}</div>
      ${escala}
      ${lineaDatos(d, textos.datos, nombreBanda)}
      ${lecturasFacetas(d, facetas, textos.lectura, nombreBanda)}
      ${texto ? parrafos(texto) : hueco(textos.huecos.dominio)}
      ${nota ? `<p class="nota">${esc(nota)}</p>` : ""}
    </section>`;
    })
    .join("");

/**
 * Las combinaciones que SÍ se cumplen.
 *
 * Esta sección estaba escrita a mano con el texto de «no activas ninguna», y no
 * miraba modelo.fired en ningún momento: a quien activaba una regla, el informe
 * le decía por escrito que no activaba ninguna. Es la sección que docs/03 llama
 * «la parte que justifica el informe entero».
 *
 * Se escribe con lo que ya está curado en combinations.json —el efecto, el
 * resumen y las referencias— y no con prosa inventada aquí. Y se afirma, con su
 * cita, que es justo lo que la distingue de las señales: allí falta una
 * condición y se habla en condicional; aquí se cumplen todas.
 */
const combinacionesHtml = modelo.fired
  .map((m) => {
    const quien = m.met
      .map((x) => `${(labels.facets[x.condition.facet] ?? x.condition.facet).toLowerCase()} ${labels.bandas?.[x.band] ?? x.band}`)
      .join(" + ");
    // Las marcadas «clinico» no aparecen nunca solas: describen un patrón de la
    // investigación, no a la persona, y llevan al lado qué hacer con eso.
    const cuidado =
      m.rule.safety === "clinico"
        ? `<span class="combi__aviso">${textos.combis.avisoClinico}</span>`
        : "";
    // La lectura de esta combinación en ESTE perfil. El efecto y el resumen de
    // arriba son iguales para todo el que dispare la misma regla; esto es lo
    // único de la sección que habla de esta persona, y por eso es lo que se le
    // encarga a Claude. Si falta, se marca como hueco igual que los dominios.
    const lectura = prosa.combinaciones?.[claveDeCombinacion(m.rule.id)];
    return `
      <li>
        <b>${esc(m.rule.effect)}</b>
        <span>${esc(m.rule.summary)}</span>
        <div class="combi__lectura">${lectura ? parrafos(lectura) : hueco(textos.huecos.combinacion)}</div>
        <span class="combi__quien">${rellena(textos.combis.seCumplePor, { quien: esc(quien) })} ${esc(m.rule.references.join(" · "))}</span>
        ${cuidado}
      </li>`;
  })
  .join("");

/** La entradilla de las combinaciones, escrita por el código igual que la de las señales. */
function introCombinaciones(modelo) {
  const t = textos.combis;
  const n = modelo.fired.length;
  if (!n) {
    return `<div class="vacio">
      <p>${rellena(t.vacio1, { total: modelo.reglasTotales ?? 26 })}</p>
      <p style="margin-bottom:0;color:var(--ink-soft)">${t.vacio2}</p>
    </div>`;
  }
  const cuantas = n === 1 ? t.una : rellena(t.varias, { n });
  return `<p>${rellena(t.entera, { cuantas })}</p>
    <p>${t.describen}</p>
    <ul class="senales combis">${combinacionesHtml}</ul>`;
}

const SENALES_MOSTRADAS = 4;
const senales = modelo.nearMisses.slice(0, SENALES_MOSTRADAS);
const senalesHtml = senales
  .map((m) => {
    const f = m.unmet[0];
    const nombre = labels.facets[f.condition.facet] ?? f.condition.facet;
    const pedido = f.condition.level === "high" ? textos.senales.alta : textos.senales.baja;
    return `
      <li>
        <b>${esc(m.rule.effect)}</b>
        <span>${esc(m.rule.summary)}</span>
        <span class="senal__falta">${rellena(textos.senales.falta, { nombre: esc(nombre.toLowerCase()), pedido, banda: nombreBanda(f.band) })} ${esc(m.rule.references.join(" · "))}</span>
      </li>`;
  })
  .join("");

const leyenda = modelo.legend.length
  ? `<h4>${textos.leyenda.titulo}</h4><ul>${modelo.legend
      .map((e) => `<li>${rellena(textos.leyenda.entrada, { nombre: esc(e.label), tecnico: esc(e.technicalLabel) })}</li>`)
      .join("")}</ul>`
  : "";

// Los apartados del índice: el ancla del documento y su clave en los textos.
const INDICE = [
  ["como-leer", "comoLeer"],
  ["resumen", "resumen"],
  ["vistazo", "vistazo"],
  ["dominios", "dominios"],
  ["combinaciones", "combinaciones"],
  ["senales", "senales"],
  ["trabajo", "trabajo"],
  ["preguntas", "preguntas"],
  ["plan", "plan"],
  ["imagenes", "imagenes"],
  ["conclusiones", "conclusiones"],
  ["fuentes", "fuentes"],
];

// El <html lang> es lo que le dice al navegador con qué reglas partir las
// palabras. Sin él, `hyphens:auto` no hace nada y el justificado abre huecos.
//
// El viewport hacía falta y no estaba. Dentro del iframe de la aplicación no se
// notaba, porque manda el ancho del marco; pero este documento se guarda, se
// manda por correo y se abre suelto, y abierto en un móvil el teléfono lo
// maquetaba en un lienzo de 980 px y lo alejaba hasta que cabía. Texto diminuto.
const html = `<!doctype html>
<html lang="${lang}">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${textos.titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700&display=swap">
${tipografias(opciones.marca)}
<style>
  /* La paleta de Connect, para que los dos informes de la casa se reconozcan
     como de la misma familia. Los valores vienen de src/config/marca.json. */
  :root{
    --verde:#27624F; --verde-medio:#5F927D; --beige:#F7F4EE; --naranja:#F29A4A;
    --naranja-claro:#FDF0E4; --dorado:#D8B34D; --menta:#E8F0EC;
    --tarjeta:#FFFDFC; --borde:#DDD8CE; --menta-borde:#D3E2DA;
    /* El verde de la casa de FONDO se queda oscuro siempre —lleva letra clara
       encima—; el de LETRA se aclara en modo oscuro, donde el oscuro no llega
       ni a 2 de contraste. */
    --verde-texto:#27624F; --naranja-texto:#C2410C;
    --ground:#F7F4EE; --ink:#292927; --ink-soft:#6F6B65; --track:#E9E4DA;
    --titulo:#27624F; --sombra:0 1px 2px rgba(39,98,79,.06);
  }
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --ground:#10201A; --tarjeta:#162C24; --ink:#EDE6DA; --ink-soft:#A9B8B0;
      --borde:#2C4238; --track:#22382F; --titulo:#8FCBB2; --naranja-claro:#2A2119;
      --verde-medio:#5FA588; --sombra:0 1px 2px rgba(0,0,0,.35);
      --menta:#163026; --menta-borde:#25453A; --verde-texto:#8FCBB2; --naranja-texto:#F59E5B;
    }
  }
  :root[data-theme="dark"]{
    --ground:#10201A; --tarjeta:#162C24; --ink:#EDE6DA; --ink-soft:#A9B8B0;
    --borde:#2C4238; --track:#22382F; --titulo:#8FCBB2; --naranja-claro:#2A2119;
    --verde-medio:#5FA588; --sombra:0 1px 2px rgba(0,0,0,.35);
    --menta:#163026; --menta-borde:#25453A; --verde-texto:#8FCBB2; --naranja-texto:#F59E5B;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);
    font-family:"Lato","Source Sans 3",system-ui,sans-serif;font-size:16.5px;line-height:1.7;
    -webkit-font-smoothing:antialiased}
  .hoja{max-width:44rem;margin:0 auto;padding:clamp(1.4rem,4vw,3rem) clamp(1.1rem,4vw,2rem) 5rem}
  .cuerpo{display:flex;flex-direction:column;gap:3rem}
  /* Cabecera y pie propios, repetidos en cada página impresa.
     El navegador solo sabe repetir algo en cada página si es el thead o el tfoot
     de una tabla; no hay otra manera de conseguirlo desde la web. En pantalla la
     tabla no existe: todas sus partes vuelven a ser bloques normales y los dos
     cintillos se esconden, así que la lectura en pantalla no cambia en nada.
     Se hace porque los cintillos del navegador —fecha, título y la dirección de
     la app— no se querían, y al quitarlos se va también la numeración. */
  .papel,.papel>*,.papel tr,.papel td{display:block;width:auto}
  .papel__cab,.papel__pie{display:none}
  .cintillo{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;
    font-family:"Montserrat",system-ui,sans-serif;font-size:7.6pt;letter-spacing:.04em;
    color:var(--ink-soft);text-transform:uppercase}
  .cintillo__marca{color:var(--verde-texto);font-weight:700;letter-spacing:.1em}
  .cintillo__marca i{font-style:italic;font-weight:400}
  /* El correo y el web, tal como se escriben: en minúsculas. Una dirección en
     mayúsculas se lee peor y se copia mal, y aquí no es un rótulo sino algo que
     alguien puede querer pulsar o teclear. */
  .cintillo__contacto{text-transform:none;letter-spacing:0;font-size:8pt}
  .cintillo__contacto a{color:inherit;text-decoration:none;
    border-bottom:1px solid var(--borde)}
  /* Sin partir palabras: la partición automática dejaba cortes feos
     —cons-tante, téc-nicos, regis-trar— que en un informe que se entrega a
     alguien cantan mucho. */
  p,li{hyphens:none;-webkit-hyphens:none;word-break:normal;overflow-wrap:normal}
  /* En pantalla, bandera; el justificado queda para el papel (más abajo, en
     @media print). Justificar sin partir palabras abre huecos entre palabras,
     y text-wrap:pretty los agrandaba: al bajar una palabra para que la última
     línea no quedara corta, la línea de arriba se estiraba. En la columna A4
     el justificado aguanta; en una pantalla, no. */
  p{margin:0 0 .95rem;text-align:left;text-wrap:pretty}
  /* Lo que tampoco se justifica en papel: listas de datos, pies y cabeceras
     cortas, donde el justificado solo produce huecos. */
  .lectura__ref,.fuentes__papel,.senal__falta,.escala span,.fila__dato{text-align:left}
  p:last-child{margin-bottom:0}
  h2,h3,h4{font-family:"Montserrat",system-ui,sans-serif;font-weight:600;margin:0;
    text-wrap:balance;color:var(--titulo);letter-spacing:-.01em}
  h2{font-size:clamp(1.55rem,4.3vw,2rem);font-weight:700;line-height:1.2}
  h3{font-size:1.3rem;font-weight:700}
  h4{font-size:1.08rem;font-weight:700}
  b{font-weight:600}
  :focus-visible{outline:2px solid var(--naranja);outline-offset:3px;border-radius:2px}

  /* Portada — rotulo segun la norma de marca */
  /* Cabecera de marca: la banda de color y el logotipo, arriba del todo.
     Misma composición que los informes de Connect, para que los documentos de
     la casa se reconozcan como de la misma familia. */
  .cabecera{text-align:center;margin-bottom:.5rem}
  .cabecera__banda{height:14px;border-radius:7px;margin-bottom:1.6rem;
    background:linear-gradient(90deg,#EF8A4D 0%,#DFAE6B 33%,#B9BC72 66%,#7FAE79 100%)}
  .cabecera__logo{width:340px;max-width:80%;height:auto;display:block;margin:0 auto}
  @media print{
    .cabecera{margin-bottom:0}
    .cabecera__banda{height:10px;margin-bottom:1.1rem}
    .cabecera__logo{width:260px}
  }

  .portada{text-align:center;padding-block:clamp(.5rem,4vw,2.5rem) 0}
  .rotulo{font-family:"Playfair Display",Georgia,serif;font-weight:700;display:inline-block;
    font-size:clamp(3.2rem,14vw,5.5rem);line-height:.98;margin:0;color:var(--ink)}
  .rotulo__by{display:block;width:max-content;margin-inline:auto;font-style:italic;font-weight:700;
    font-size:clamp(1.5rem,6.6vw,2.6rem);line-height:1.1;margin-top:.06em;
    background:linear-gradient(90deg,#EF8A4D 0%,#DFAE6B 33%,#B9BC72 66%,#7FAE79 100%);
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .portada__pie{margin-top:1.5rem;color:var(--ink-soft);font-size:.95rem}

  .eyebrow{font-family:"Montserrat",system-ui,sans-serif;font-size:.68rem;
    letter-spacing:.18em;text-transform:uppercase;color:var(--verde-texto);font-weight:700;
    margin:0 0 .5rem}
  /* Título de sección: chevrón dorado delante y línea fina debajo, como Connect.
     El chevrón es decorativo, así que se dibuja con ::before y no va en el texto:
     quien escuche el informe con un lector de pantalla no oirá «doble mayor que». */
  .seccion>h2{margin-bottom:.9rem;padding-bottom:.55rem;position:relative}
  .seccion>h2::before{content:"»";color:var(--dorado);font-weight:700;margin-right:.4rem}
  .seccion>h2::after{content:"";position:absolute;left:0;bottom:0;width:3.2rem;height:2px;
    background:var(--dorado);border-radius:1px}
  section{scroll-margin-top:1rem}

  /* Las tarjetas de Connect: verde menta, cantonada redonda y sin borde duro.
     El menta se apaga en modo oscuro, donde un verde claro deslumbraria. */
  .indice{background:var(--menta);border:1px solid var(--menta-borde);border-radius:10px;
    padding:1.3rem 1.5rem}
  .indice ol{margin:.5rem 0 0;padding-left:1.3rem;columns:2;column-gap:2rem}
  .indice li{margin-bottom:.3rem;break-inside:avoid}
  .indice a{color:var(--ink);text-decoration:none;border-bottom:1px solid transparent}
  .indice a:hover,.indice a:focus-visible{border-bottom-color:var(--naranja)}

  .aviso{background:var(--naranja-claro);border-left:3px solid var(--naranja);
    padding:1rem 1.2rem;font-size:.96rem;border-radius:0 3px 3px 0}
  .aviso p{max-width:none}
  .aviso--atencion{margin-bottom:1.1rem}
  .aviso--atencion{margin-bottom:1.1rem}
  .aviso ul{margin:.4rem 0 0;padding-left:1.1rem}
  .aviso li{margin-bottom:.25rem}

  /* El titular del resumen, dentro de una banda verde, como en Connect. Es la
     frase que se lleva quien solo lee la primera página, así que se destaca del
     resto del texto en vez de ser un párrafo más en negrita. */
  .titular{font-family:"Montserrat",system-ui,sans-serif;font-weight:600;
    font-size:clamp(1.15rem,3vw,1.4rem);line-height:1.35;margin:0 0 1.2rem;
    background:var(--verde);color:#FFFDFC;padding:1.1rem 1.35rem;border-radius:10px;
    max-width:none;text-align:left;hyphens:none;text-wrap:balance;break-inside:avoid}

  .barras{display:flex;flex-direction:column;gap:.55rem;margin:.2rem 0 0}
  .fila{display:grid;grid-template-columns:minmax(7rem,10.5rem) 1fr auto;gap:.85rem;align-items:center}
  .fila__nombre{font-size:.93rem;line-height:1.3;display:flex;flex-direction:column}
  .marca{font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:var(--naranja-texto);font-weight:600}
  .eje{position:relative;height:9px;background:var(--track);border-radius:2px}
  .eje__medio{position:absolute;left:50%;top:-3px;bottom:-3px;width:1px;background:var(--borde)}
  /* El color de cada dominio llega por --dominio desde marca.json, así que el
     gráfico general, las barras de facetas y los títulos van siempre a juego y
     hay un solo sitio donde cambiarlo. */
  .eje__relleno{position:absolute;left:0;top:0;bottom:0;border-radius:2px;
    background:var(--dominio,var(--verde-medio));opacity:.6}
  .eje__punto{position:absolute;top:50%;width:9px;height:9px;border-radius:50%;
    background:var(--dominio,var(--verde-medio));transform:translate(-50%,-50%);
    box-shadow:0 0 0 2px var(--ground)}
  .eje--acento .eje__relleno,.eje--acento .eje__punto{background:var(--naranja)}
  .fila__dato{text-align:right;font-variant-numeric:tabular-nums;line-height:1.2;
    display:flex;flex-direction:column;min-width:4.6rem}
  .fila__dato b{font-size:1rem}
  .fila__dato span{font-size:.73rem;color:var(--ink-soft)}
  .fila--destacada .fila__nombre{font-weight:600}
  .escala{display:grid;grid-template-columns:minmax(7rem,10.5rem) 1fr auto;gap:.85rem;
    font-size:.71rem;color:var(--ink-soft);margin-top:.3rem;font-variant-numeric:tabular-nums}
  .escala__eje{display:flex;justify-content:space-between}
  .escala__hueco{min-width:4.6rem}

  /* Un dominio NO lleva break-inside:avoid. Ocupa media página larga, y pedir
     que no se parta obliga al navegador a empujarlo entero a la hoja siguiente
     cada vez que no cabe: de ahí salían las páginas que acababan al 15 %. Lo que
     no se puede partir son sus piezas —el gráfico, cada faceta—, no el bloque. */
  .dominio{border-top:1px solid var(--borde);padding-top:1.4rem;margin-top:1.9rem}
  .dominio:first-of-type{border-top:0;padding-top:0;margin-top:.6rem}
  .dominio__cab{display:flex;align-items:baseline;gap:.6rem;margin-bottom:.5rem;flex-wrap:wrap}
  .dominio__dato{margin-left:auto;font-variant-numeric:tabular-nums;font-size:.95rem}
  .dominio__dato em{font-style:normal;color:var(--ink-soft);font-size:.8rem}
  .dominio p{margin-top:1rem}
  .nota{font-size:.92rem;color:var(--ink-soft);border-left:2px solid var(--borde);padding-left:.9rem}
  .pendiente{font-size:.9rem;color:var(--ink-soft);background:var(--naranja-claro);
    border:1px dashed var(--naranja);border-radius:3px;padding:.7rem .9rem;max-width:none}
  .pendiente b{color:var(--ink)}
  .lecturas{display:flex;flex-direction:column;gap:1rem;margin:1.1rem 0}
  .lectura{border-left:2px solid var(--borde);padding-left:1rem;break-inside:avoid}
  .lectura__cab{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;
    margin-bottom:.15rem}
  .lectura__cab span{font-size:.8rem;color:var(--ink-soft);font-variant-numeric:tabular-nums;
    white-space:nowrap}
  .lectura__def{font-size:.86rem;color:var(--ink-soft);margin-bottom:.4rem}
  .lectura p{margin-bottom:.35rem;font-size:.97rem}
  .lectura__ref{font-size:.78rem;color:var(--ink-soft);margin-bottom:0}
  .matiz{color:var(--naranja-texto);font-style:normal;font-weight:600;font-size:.88rem}
  .imagen{margin:0 0 1.1rem;padding:0;break-inside:avoid}
  .imagen blockquote{margin:0;padding:.9rem 0 .5rem 1.1rem;border-left:3px solid var(--naranja);
    font-family:"Playfair Display",Georgia,serif;font-size:1.12rem;font-style:italic;
    line-height:1.45;color:var(--titulo)}
  .imagen figcaption{font-size:.84rem;color:var(--ink-soft);padding-left:1.1rem}
  .imagen--ancla{background:var(--menta);border:1px solid var(--menta-borde);border-radius:10px;
    padding:1.15rem 1.35rem;margin-top:1.4rem}
  .imagen--ancla blockquote{padding-top:.2rem;font-size:1.2rem}
  .imagen__etiqueta{font-size:.71rem;letter-spacing:.15em;text-transform:uppercase;
    color:var(--verde-texto);font-weight:600;margin:0}

  .vacio{border:1px solid var(--menta-borde);border-radius:10px;padding:1.3rem 1.5rem;background:var(--menta)}
  .senales{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.75rem}
  .senales li{display:flex;flex-direction:column;gap:.1rem;padding-left:.9rem;
    border-left:2px solid var(--borde)}
  .senales span{color:var(--ink-soft);font-size:.94rem}
  .senal__falta{font-size:.84rem!important;font-style:italic;margin-top:.15rem}
  /* Las combinaciones que sí se cumplen: mismo esqueleto que las señales, pero
     con el filete en verde en vez de gris, porque estas se afirman. */
  .combis li{border-left-color:var(--verde-medio)}
  .combi__quien{font-size:.84rem!important;font-style:italic;margin-top:.15rem}
  /* La lectura redactada. En tinta normal y no en el gris de los datos: es el
     texto de la seccion, no un pie de linea. */
  .combi__lectura{margin:.45rem 0 .2rem}
  .combi__lectura p{margin:0 0 .5rem;color:var(--ink)}
  .combi__lectura p:last-child{margin-bottom:0}
  .combi__aviso{font-size:.86rem!important;background:var(--naranja-claro);
    border-radius:3px;padding:.5rem .7rem;margin-top:.4rem;color:var(--ink)!important}

  .preguntas{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:.7rem;
    counter-reset:p}
  .preguntas li{padding-left:1.6rem;position:relative;max-width:62ch;counter-increment:p}
  .preguntas li::before{content:counter(p);position:absolute;left:0;color:var(--naranja);
    font-weight:600;font-variant-numeric:tabular-nums}

  .plan{display:flex;flex-direction:column;gap:1rem}
  .paso{background:var(--tarjeta);border:1px solid var(--borde);border-radius:3px;
    padding:1.05rem 1.2rem;box-shadow:var(--sombra);break-inside:avoid}
  .paso h4{margin-bottom:.25rem}
  .paso p{font-size:.97rem;margin-bottom:.5rem}
  .paso__ind{font-size:.86rem;color:var(--ink-soft);border-top:1px solid var(--borde);
    padding-top:.5rem;margin:0}

  .pie{border-top:1px solid var(--borde);padding-top:1.5rem;font-size:.9rem;color:var(--ink-soft)}
  .pie h4{margin:1.1rem 0 .4rem}
  .pie h4:first-child{margin-top:0}
  .pie ul{margin:.3rem 0 .9rem;padding-left:1.1rem}
  .pie b{color:var(--ink)}
  .fuentes{margin:.6rem 0 1rem;padding-left:1.3rem;font-size:.86rem}
  .fuentes li{margin-bottom:.7rem;break-inside:avoid}
  .fuentes__ref{display:block;color:var(--ink)}
  .fuentes__papel{display:block;margin-top:.15rem;font-style:italic}
  .fuentes a{color:inherit}
  .fuentes__copy{margin:.2rem 0 0;font-size:.84rem}

  /* Cierre de marca. Centrado y con aire: es una firma, no un bloque más.
     El degradado repite el del rótulo de portada, que es el del propio logo. */
  .firma{margin-top:2.5rem;padding-top:2rem;text-align:center;
    border-top:2px solid transparent;
    border-image:linear-gradient(90deg,#EF8A4D 0%,#DFAE6B 33%,#B9BC72 66%,#7FAE79 100%) 1}
  /* Las dos marcas de la casa, juntas: IMPAUSA firma el producto y LivePausa
     es el acompanamiento que hay detras. Tienen proporciones muy distintas
     —una es una linea de texto y la otra casi cuadrada—, asi que se igualan por
     lo que se ve y no por una altura comun. */
  .firma__logos{display:flex;align-items:center;justify-content:center;
    gap:2.4rem;flex-wrap:wrap;margin:0 auto 1.1rem}
  .firma__logo{height:34px;width:auto;max-width:100%;display:block}
  .firma__live{height:66px;width:auto;max-width:100%;display:block}
  /* Los párrafos del informe llevan un ancho máximo —una regla tipográfica: las
     líneas muy largas se leen mal—, y eso los dejaba más estrechos que su bloque
     y pegados a la izquierda. Centrar el texto dentro de una caja que ya está
     desplazada no centra nada. Aquí ocupan todo el ancho y se centran de verdad.
     Pasa en los dos sitios donde algo tiene que cuadrar con el eje del logotipo:
     la cabecera de portada y la firma del final. */
  .firma p,.portada p{max-width:none;text-align:center;hyphens:none}
  .firma__linea{margin:0 0 .5rem;font-size:.92rem}
  .firma__linea a{color:var(--verde-texto);text-decoration:none;font-weight:600}
  .firma__linea a:hover{text-decoration:underline}
  .firma__sep{color:var(--ink-soft);margin:0 .5rem}
  .firma__copy{margin:.15rem 0 0;font-size:.8rem;color:var(--ink-soft)}
  /* En papel el logotipo va algo menor y el bloque nunca se parte. */
  @media print{.firma{break-inside:avoid;margin-top:1.8rem}
    .firma__logos{gap:1.6rem;margin-bottom:.8rem}
    .firma__logo{height:22px}.firma__live{height:44px}}

  .maqueta{position:sticky;top:0;z-index:5;background:#1A4A3A;color:#F7F2EB;
    font-size:.8rem;letter-spacing:.02em;text-align:center;padding:.5rem 1rem}

  /* Impreso igual que en pantalla.
     Antes se imprimia en blanco y negro sobre fondo blanco, y el documento que
     recibia la persona no se parecia al que habia visto. Lo unico que se quita
     es el indice —en papel no se puede pulsar— y la banda de aviso. */
  @media print{
    @page{size:A4 portrait;margin:15mm 16mm 17mm}
    /* Sin esto el navegador descarta TODOS los fondos y colores al imprimir, y
       las barras de puntuacion salen en blanco: justo lo que hay que ver. */
    *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}
    /* En papel se imprime siempre la version clara, mande lo que mande el
       sistema: un informe en modo oscuro gasta tinta y se lee peor. */
    :root, :root[data-theme="dark"]{
      --ground:#FFFFFF; --tarjeta:#FFFDFC; --ink:#292927; --ink-soft:#6F6B65;
      --borde:#DDD8CE; --track:#E9E4DA; --titulo:#27624F; --verde:#27624F;
      --verde-medio:#5F927D; --menta:#E8F0EC; --menta-borde:#D3E2DA;
      --dorado:#D8B34D; --naranja:#F29A4A; --naranja-claro:#FDF0E4;
    }
    body{background:#FFFFFF;font-size:10.4pt;line-height:1.55}
    /* En papel sí se justifica: la columna A4 es ancha y el justificado no
       abre huecos. Los centrados (.firma p, .portada p) y las listas de datos
       ganan por especificidad, como hasta ahora. */
    p{text-align:justify}
    .maqueta,.indice{display:none}
    .hoja{max-width:none;padding:0}
    .cuerpo{gap:1.5rem}
    /* Aquí la tabla vuelve a ser tabla, y con ella los dos cintillos repetidos. */
    .papel{display:table;width:100%}
    .papel__cab{display:table-header-group}
    .papel__pie{display:table-footer-group}
    .papel tbody{display:table-row-group}
    .papel tr{display:table-row}
    .papel td{display:table-cell}
    .papel__cab td{padding-bottom:5mm}
    .papel__pie td{padding-top:5mm}
    /* Qué NO se puede partir: solo las piezas que se leen de una vez. Un gráfico
       cortado por la mitad no se entiende, una tarjeta partida tampoco.
       Una sección entera sí se puede partir, y tiene que poder: es la diferencia
       entre un documento que fluye y uno lleno de páginas a medias. */
    .barras,.escala,.lectura,.paso,.imagen,.aviso,.vacio,.titular,
    .fuentes li,.senales li,.preguntas li,.firma{break-inside:avoid}
    /* Y qué tiene que seguir junto a lo que viene detrás. Un título al final de
       una página, con su texto en la siguiente, deja el encabezado colgando; un
       gráfico separado de su escala se queda sin las cifras que lo explican. */
    h2,h3,h4,.eyebrow,.dominio__cab,.barras,.lectura__cab,.lectura__def{break-after:avoid}
    .escala{break-before:avoid}
    p,li{orphans:3;widows:3}
    /* Las sombras se convierten en manchas grises en papel. */
    .dominio,.lectura,.paso,.bloque,.indice,.vacio{box-shadow:none}
    a{text-decoration:none;color:inherit}
    /* El contacto y el copyright ya van en el pie de cada página. Repetirlos en
       el cierre sería decir lo mismo dos veces en la misma hoja. En pantalla no
       hay pie, así que allí el cierre los mantiene. */
    .firma__linea,.firma__copy:not(.firma__quien){display:none}
    .firma{margin-top:1.4rem;padding-top:1.2rem}
    /* La bibliografía, algo más apretada: son entradas cortas y muy seguidas, y
       el aire que va bien en un párrafo aquí solo estira la página. */
    .fuentes{line-height:1.32}
    .fuentes li{margin-bottom:.42rem}
  }
  @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

${opciones.aviso ? '<div class="maqueta">' + esc(opciones.aviso) + "</div>" : conProsa ? "" : '<div class="maqueta">' + textos.maqueta + "</div>"}

<div class="hoja">
<table class="papel"><thead class="papel__cab"><tr><td>
  <div class="cintillo">
    <span class="cintillo__marca">Identify <i>by Impausa</i></span>
    <span>${textos.cintilloTipo}</span>
  </div>
</td></tr></thead>
<tfoot class="papel__pie"><tr><td>
  <div class="cintillo cintillo--pie">
    <span class="cintillo__contacto">
      <a href="mailto:${esc(opciones.marca?.correo ?? "")}">${esc(opciones.marca?.correo ?? "")}</a>
      <span aria-hidden="true"> · </span>
      <a href="https://${esc(opciones.marca?.web ?? "")}">${esc(opciones.marca?.web ?? "")}</a>
    </span>
    <span>${esc(opciones.marca?.copyright ?? "")}</span>
  </div>
</td></tr></tfoot>
<tbody><tr><td>
<div class="cuerpo">

  ${cabeceraDeMarca(opciones.marca)}

  <header class="portada">
    <h1 class="rotulo"><span id="rotulo-nombre">Identify</span><span class="rotulo__by" id="rotulo-by">by Impausa</span></h1>
    <p class="portada__pie">${textos.portadaPie}${persona || fecha ? "<br>" + esc([persona, fecha].filter(Boolean).join(" · ")) : ""}</p>
  </header>

  <script>
    // Norma de marca: «by Impausa» tiene que medir exactamente lo mismo que el
    // titular. Se mide una vez cargada la tipografia y se reparte la diferencia.
    (function ajustarRotulo(){
      const nombre=document.getElementById("rotulo-nombre");
      const by=document.getElementById("rotulo-by");
      if(!nombre||!by) return;
      const ajustar=()=>{
        const huecos=by.textContent.length-1;
        if(huecos<1) return;
        const objetivo=nombre.getBoundingClientRect().width;
        // El espaciado se anade tambien detras de la ultima letra, asi que el ancho
        // medido lleva un sobrante. Se descuenta con un margen negativo y se converge
        // en unas pocas pasadas, en vez de calcularlo de una sola division.
        let extra=0;
        for(let i=0;i<8;i++){
          by.style.letterSpacing=extra+"px";
          by.style.marginRight=(-extra)+"px";
          const visible=by.getBoundingClientRect().width-extra;
          const diferencia=objetivo-visible;
          if(Math.abs(diferencia)<0.3) break;
          extra+=diferencia/huecos;
        }
      };
      if(document.fonts&&document.fonts.ready) document.fonts.ready.then(ajustar);
      else window.addEventListener("load",ajustar);
      window.addEventListener("resize",ajustar);
    })();

    // El indice, sin navegar.
    //
    // Dentro del iframe de la pagina del test este documento no tiene direccion
    // propia, asi que un enlace «#seccion» el navegador lo resuelve contra la
    // direccion de la web y se lleva el iframe entero a cargarla. Y como el
    // sitio manda X-Frame-Options: DENY, se queda en «ha rechazado la conexion»
    // y el informe desaparece. Aqui se hace lo unico que se queria: desplazarse.
    (function(){
      document.addEventListener("click", function(e){
        const a = e.target.closest && e.target.closest('a[href^="#"]');
        if(!a) return;
        const destino = document.getElementById(a.getAttribute("href").slice(1));
        if(!destino) return;
        e.preventDefault();
        destino.scrollIntoView({behavior:"smooth", block:"start"});
      });
    })();
  </script>

  <nav class="indice" aria-label="${textos.indice.aria}">
    <p class="eyebrow" style="margin-bottom:0">${textos.indice.titulo}</p>
    <ol>${INDICE.map(([id, clave]) => `<li><a href="#${id}">${esc(textos.indice.secciones[clave])}</a></li>`).join("")}</ol>
  </nav>

  <section class="seccion" id="como-leer">
    <p class="eyebrow">${textos.comoLeer.eyebrow}</p>
    <h2>${textos.comoLeer.titulo}</h2>
    ${avisoDeAtencion(modelo.meta.atencion, textos.atencion)}
    <p>${textos.comoLeer.intro}</p>
    <div class="aviso">
      <p><b>${textos.comoLeer.noEsTitulo}</b></p>
      <ul>
        ${textos.comoLeer.noEs.map((linea) => `<li>${linea}</li>`).join("\n        ")}
      </ul>
      <p style="margin-top:.6rem"><b>${textos.comoLeer.comparacion}</b> ${esc(modelo.meta.comparisonNotice)}</p>
    </div>
    <p style="margin-top:1rem">${textos.comoLeer.cierre}</p>
  </section>

  <section class="seccion" id="resumen">
    <p class="eyebrow">${textos.resumen.eyebrow}</p>
    ${prosa.titular ? '<p class="titular">' + esc(prosa.titular) + "</p>" : ""}
    ${prosa.perfilEnUnaFrase ? parrafos(prosa.perfilEnUnaFrase) : hueco(textos.huecos.resumen)}
  </section>

  <section class="seccion" id="vistazo">
    <p class="eyebrow">${textos.vistazo.eyebrow}</p>
    <h2>${textos.vistazo.titulo}</h2>
    ${resumenVisual}
  </section>

  <section class="seccion" id="dominios">
    <p class="eyebrow">${textos.dominios.eyebrow}</p>
    <h2>${textos.dominios.titulo}</h2>
    <p style="color:var(--ink-soft);font-size:.95rem">${textos.dominios.intro}</p>
    ${dominios}
  </section>

  <section class="seccion" id="combinaciones">
    <p class="eyebrow">${textos.combinaciones.eyebrow}</p>
    <h2>${textos.combinaciones.titulo}</h2>
    ${introCombinaciones(modelo)}
  </section>

  <section class="seccion" id="senales">
    <p class="eyebrow">${textos.senalesSeccion.eyebrow}</p>
    <h2>${textos.senalesSeccion.titulo}</h2>
    ${introSenales(modelo, labels, textos.senales)}
    <ul class="senales">${senalesHtml}</ul>
  </section>

  <section class="seccion" id="trabajo">
    <p class="eyebrow">${textos.trabajo.eyebrow}</p>
    <h2>${textos.trabajo.titulo}</h2>
    ${prosa.enElTrabajo ? parrafos(prosa.enElTrabajo) : hueco(textos.huecos.trabajo)}
  </section>

  <section class="seccion" id="preguntas">
    <p class="eyebrow">${textos.preguntas.eyebrow}</p>
    <h2>${textos.preguntas.titulo}</h2>
    ${prosa.preguntas?.length ? '<ul class="preguntas">' + prosa.preguntas.map((q) => "<li>" + esc(q) + "</li>").join("") + "</ul>" : hueco(textos.huecos.preguntas)}
  </section>

  <section class="seccion" id="plan">
    <p class="eyebrow">${textos.plan.eyebrow}</p>
    <h2>${textos.plan.titulo}</h2>
    <div class="plan">
      ${
        pasosDelPlan(prosa.planAccion).length
          ? pasosDelPlan(prosa.planAccion)
              .map(
                (e) => `<article class="paso">
        <h4>${esc(e.titulo)}</h4>
        <p>${esc(e.texto)}</p>
        <p class="paso__ind"><b>${textos.plan.indicador}</b> ${esc(e.indicador)}</p>
      </article>`,
              )
              .join("")
          : hueco(textos.huecos.plan)
      }
    </div>
  </section>
${
  metaforas
    ? `
  <section class="seccion" id="imagenes">
    <p class="eyebrow">${textos.imagenes.eyebrow}</p>
    <h2>${textos.imagenes.titulo}</h2>
    <p style="color:var(--ink-soft);font-size:.95rem">${textos.imagenes.intro}</p>
    ${metaforas.imagenes
      .map(
        (m) => `<figure class="imagen">
      <blockquote>${esc(m.texto)}</blockquote>
      <figcaption><b>${esc(m.nombre)}</b> · ${rellena(textos.imagenes.porTu, { faceta: esc(m.etiqueta.toLowerCase()), banda: nombreBanda(m.banda) })}</figcaption>
    </figure>`,
      )
      .join("")}
    <figure class="imagen imagen--ancla">
      <p class="imagen__etiqueta">${textos.imagenes.ancla}</p>
      <blockquote>${esc(metaforas.ancla.texto)}</blockquote>
      <figcaption><b>${esc(metaforas.ancla.nombre)}</b> · ${rellena(textos.imagenes.porTu, { faceta: esc(metaforas.ancla.etiqueta.toLowerCase()), banda: nombreBanda(metaforas.ancla.banda) })}</figcaption>
    </figure>
  </section>`
    : ""
}

  <section class="seccion" id="conclusiones">
    <p class="eyebrow">${textos.conclusiones.eyebrow}</p>
    <h2>${textos.conclusiones.titulo}</h2>
    ${prosa.conclusion ? parrafos(prosa.conclusion) : hueco(textos.huecos.conclusion)}
  </section>

  <footer class="pie" id="fuentes">
    <h4>${textos.fuentesSeccion.titulo}</h4>
    <p>${textos.fuentesSeccion.intro}</p>
    ${bibliografia(opciones.fuentes)}
    ${leyenda}
    <h4>${textos.fuentesSeccion.avisoTitulo}</h4>
    <p>${textos.fuentesSeccion.aviso}</p>
  </footer>

  ${cierreDeMarca(opciones.marca, textos.firma)}

</div>
</td></tr></tbody></table>
</div>
`;

  return html;
}
