// Genera el test autoadministrable como una pagina autonoma.
//
//   node tools/render-test.mjs test-identify.html
//
// Los 60 items, la escala y los items inversos salen de src/config y src/i18n:
// la misma fuente que usa el motor. Aqui no se transcribe nada a mano.
//
// La pagina no lleva una copia del motor: lleva el motor. tools/empaquetar.mjs
// coge los mismos ficheros de src/services/ que usan el comando y las pruebas,
// les quita los tipos y los concatena. Aun asi, al cargar se autocomprueba
// contra el caso de ejemplo del Excel —puntuaciones, bandas, reglas y senales—
// y avisa en portada si algo no coincide.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { construirModelo } from "../src/services/pipeline.ts";
import { empaquetarMotor } from "./empaquetar.mjs";
import { cargarRecursos, cargarEjemplo, cargarIdioma, leer } from "./recursos.mjs";
import { paginaDeInicio, MARCA_CTA_HERO, MARCA_CTA_FINAL, MARCA_IDIOMAS, MARCA_AVISO } from "../src/pagina/portada.mjs";
import { estilosPortada } from "../src/pagina/portada-estilos.mjs";

const recursos = cargarRecursos("es");
const recursosEn = cargarRecursos("en");
const fixture = cargarEjemplo();
const paquete = empaquetarMotor();

// Lo que el motor de Node saca del caso de ejemplo. La pagina tiene que sacar
// exactamente esto con su copia empotrada. Las bandas y los conteos no dependen
// del idioma: las condiciones de las reglas son neutras.
const respuestasEjemplo = Object.fromEntries(
  Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
);
const modeloEjemplo = construirModelo(respuestasEjemplo, recursos);

/**
 * La capa que viaja de cada idioma: lo que cambia con la lengua, mas su portada
 * ya montada. Lo que NO cambia —la configuracion del motor y la marca, que pesa
 * (tipografias y logotipo en base64)— va una sola vez, en `comun`.
 */
function capaDeIdioma(codigo, recursosIdioma) {
  const { labels, textos, rules, facetas, metaforas, fuentes } = recursosIdioma;
  return {
    cuestionario: cargarIdioma(codigo),
    labels,
    textos,
    rules,
    facetas,
    metaforas,
    fuentes,
    portada: paginaDeInicio(recursosIdioma),
  };
}

const datos = {
  comun: { config: recursos.config, marca: recursos.marca },
  idiomas: { es: capaDeIdioma("es", recursos), en: capaDeIdioma("en", recursosEn) },
  check: {
    responses: fixture.responses,
    facets: fixture.facetsEsperado,
    domains: fixture.domainsEsperado,
    bandas: Object.fromEntries(
      modeloEjemplo.domains.flatMap((d) => d.facets).map((f) => [f.id, f.band]),
    ),
    disparadas: modeloEjemplo.fired.length,
    senales: modeloEjemplo.nearMisses.length,
  },
};


const html = `<!doctype html>
<html lang="es">
<meta charset="utf-8">
<!-- Sin esto el movil dibuja la pagina en un lienzo de 980 px y la aleja hasta
     que cabe: el texto sale diminuto y ninguna media query de movil llega a
     dispararse. Faltaba desde el principio, y afectaba al cuestionario entero,
     no solo a esta pantalla. -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${recursos.textos.test.titulo}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,700&family=Source+Sans+3:wght@0,400;0,600&display=swap">
<style>
  :root{
    --verde:#27624F; --verde-medio:#5F927D; --naranja:#F47A20; --naranja-claro:#FDF0E4;
    --dorado:#D5B447; --menta:#EAF3E5; --melocoton:#FBEFE7; --verde-suave-borde:#CBDCD2;
    --ground:#F7F4EE; --tarjeta:#FFFDFC; --ink:#302A26; --ink-soft:#6E6862;
    --borde:#E4DDD5; --track:#E7E0D6; --titulo:#27624F;
    --sombra:0 1px 3px rgba(26,74,58,.07); --sombra-alta:0 6px 24px rgba(26,74,58,.10);
  }
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --ground:#10201A; --tarjeta:#162C24; --ink:#EDE6DA; --ink-soft:#A9B8B0;
      --borde:#2C4238; --track:#22382F; --titulo:#8FCBB2; --verde-medio:#5FA588;
      --naranja-claro:#2A2119; --sombra:0 1px 3px rgba(0,0,0,.35); --sombra-alta:0 6px 24px rgba(0,0,0,.4);
      --menta:#16302A; --melocoton:#2A2119; --verde-suave-borde:#2C4238;
    }
  }
  :root[data-theme="dark"]{
    --ground:#10201A; --tarjeta:#162C24; --ink:#EDE6DA; --ink-soft:#A9B8B0;
    --borde:#2C4238; --track:#22382F; --titulo:#8FCBB2; --verde-medio:#5FA588;
    --naranja-claro:#2A2119; --sombra:0 1px 3px rgba(0,0,0,.35); --sombra-alta:0 6px 24px rgba(0,0,0,.4);
    --menta:#16302A; --melocoton:#2A2119; --verde-suave-borde:#2C4238;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);
    font-family:"Lato","Source Sans 3",system-ui,sans-serif;font-size:17px;line-height:1.55;
    -webkit-font-smoothing:antialiased}
  h1,h2,h3{font-family:"Playfair Display",Georgia,serif;margin:0;color:var(--titulo);text-wrap:balance}
  button{font:inherit;color:inherit}
  :focus-visible{outline:2px solid var(--naranja);outline-offset:3px;border-radius:4px}
  @media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}

  .marco{min-height:100vh;display:flex;flex-direction:column}
  .contenido{flex:1;display:flex;flex-direction:column;justify-content:center;
    width:100%;max-width:40rem;margin:0 auto;padding:2rem 1.25rem 3rem}

  /* Portada */
  .rotulo{font-family:"Playfair Display",Georgia,serif;font-weight:700;display:inline-block;
    font-size:clamp(3rem,13vw,4.6rem);line-height:1;margin:0;color:var(--ink);text-align:center}
  .rotulo__by{display:block;width:max-content;margin-inline:auto;font-style:italic;font-weight:700;
    font-size:clamp(1.35rem,6vw,2.15rem);line-height:1.1;margin-top:.06em;
    background:linear-gradient(90deg,#EF8A4D 0%,#DFAE6B 33%,#B9BC72 66%,#7FAE79 100%);
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .portada{text-align:center;display:flex;flex-direction:column;align-items:center;gap:1.4rem}
  .etiqueta{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;
    color:var(--verde-medio);font-weight:600}
  .portada p{max-width:32rem;margin:0;color:var(--ink-soft)}
  .datos{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-top:.3rem}
  .dato{background:var(--tarjeta);border:1px solid var(--borde);border-radius:999px;
    padding:.3rem .85rem;font-size:.85rem;color:var(--ink-soft)}
  .boton{background:var(--verde);color:#F7F2EB;border:0;border-radius:6px;
    padding:.85rem 2rem;font-weight:600;cursor:pointer;box-shadow:var(--sombra);
    transition:transform .12s ease, box-shadow .12s ease}
  .boton:hover{transform:translateY(-1px);box-shadow:var(--sombra-alta)}
  .boton:active{transform:translateY(0)}

  /* Progreso */
  .progreso{position:sticky;top:0;background:var(--ground);padding:.9rem 1.25rem .7rem;
    border-bottom:1px solid var(--borde);z-index:3}
  .progreso__fila{display:flex;justify-content:space-between;align-items:baseline;
    max-width:40rem;margin:0 auto .45rem;font-size:.82rem;color:var(--ink-soft);
    font-variant-numeric:tabular-nums}
  .barra{max-width:40rem;margin:0 auto;height:5px;background:var(--track);border-radius:3px;overflow:hidden}
  .barra__relleno{height:100%;background:var(--verde-medio);border-radius:3px;
    transition:width .25s ease;width:0}

  /* Pregunta */
  .pregunta{display:flex;flex-direction:column;gap:1.5rem}
  .stem{color:var(--ink-soft);font-size:1rem;margin:0}
  .enunciado{font-family:"Playfair Display",Georgia,serif;font-size:clamp(1.5rem,5.5vw,2.1rem);
    font-weight:700;line-height:1.25;margin:0;color:var(--titulo)}
  .opciones{display:flex;flex-direction:column;gap:.55rem}
  .opcion{display:flex;align-items:center;gap:.9rem;width:100%;text-align:left;
    background:var(--tarjeta);border:1px solid var(--borde);border-radius:6px;
    padding:.8rem 1rem;cursor:pointer;transition:border-color .12s ease, background .12s ease}
  .opcion:hover{border-color:var(--verde-medio)}
  .opcion[aria-checked="true"]{border-color:var(--naranja);background:var(--naranja-claro)}
  .opcion__num{flex:none;width:1.7rem;height:1.7rem;border-radius:50%;display:grid;place-items:center;
    background:var(--track);font-size:.85rem;font-weight:600;color:var(--ink-soft)}
  .opcion[aria-checked="true"] .opcion__num{background:var(--naranja);color:#fff}
  .pie-preg{display:flex;justify-content:space-between;align-items:center;gap:1rem}
  .enlace{background:none;border:0;color:var(--verde-medio);cursor:pointer;font-weight:600;
    padding:.4rem 0}
  .enlace[disabled]{color:var(--ink-soft);opacity:.5;cursor:default}
  .ayuda{font-size:.82rem;color:var(--ink-soft)}

  /* Resultados */
  .resultados{display:flex;flex-direction:column;gap:1.6rem}
  .bloque{background:var(--tarjeta);border:1px solid var(--borde);border-radius:6px;
    padding:1.1rem 1.25rem;box-shadow:var(--sombra)}
  .bloque h3{font-size:1.15rem;margin-bottom:.2rem}
  .bloque__sub{color:var(--ink-soft);font-size:.86rem;margin:0 0 .9rem}
  .fila{display:grid;grid-template-columns:minmax(6.5rem,10rem) 1fr auto;gap:.8rem;
    align-items:center;margin-bottom:.5rem}
  .fila:last-child{margin-bottom:0}
  .fila__n{font-size:.92rem}
  .eje{position:relative;height:8px;background:var(--track);border-radius:2px}
  .eje__medio{position:absolute;left:50%;top:-3px;bottom:-3px;width:1px;background:var(--borde)}
  .eje__relleno{position:absolute;left:0;top:0;bottom:0;border-radius:2px;
    background:var(--verde-medio);opacity:.55}
  .eje__punto{position:absolute;top:50%;width:8px;height:8px;border-radius:50%;
    background:var(--verde-medio);transform:translate(-50%,-50%);box-shadow:0 0 0 2px var(--tarjeta)}
  .fila__v{font-variant-numeric:tabular-nums;font-weight:600;min-width:2.7rem;text-align:right}
  .escala{display:grid;grid-template-columns:minmax(6.5rem,10rem) 1fr auto;gap:.8rem;
    font-size:.72rem;color:var(--ink-soft);margin-top:.5rem}
  .escala__e{display:flex;justify-content:space-between}
  .escala__h{min-width:2.7rem}
  .nota{background:var(--naranja-claro);border-left:3px solid var(--naranja);
    padding:.9rem 1.1rem;border-radius:0 4px 4px 0;font-size:.94rem}
  .nota p{margin:0 0 .5rem}
  .nota p:last-child{margin:0}
  .fallo{background:#FDEAEA;border-left:3px solid #D94040;color:#7a2020;
    padding:.9rem 1.1rem;border-radius:0 4px 4px 0;font-size:.92rem}
  .acciones{display:flex;gap:.8rem;flex-wrap:wrap}
  .boton--claro{background:var(--tarjeta);color:var(--ink);border:1px solid var(--borde)}

  /* Mientras Claude escribe, con el informe ya delante.
     Va fija abajo a la derecha: el aviso pequeño en la barra de arriba pasaba
     desapercibido y la gente se quedaba sin saber si estaba pasando algo. */
  .trabajando{position:fixed;right:1.25rem;bottom:1.25rem;z-index:10;width:min(22rem,calc(100vw - 2.5rem));
    background:var(--tarjeta);border:1px solid var(--borde);border-left:3px solid var(--naranja);
    border-radius:8px;padding:1rem 1.1rem;box-shadow:var(--sombra-alta)}
  .trabajando__t{margin:0 0 .3rem;font-weight:600;color:var(--titulo)}
  .trabajando__d{margin:0 0 .8rem;font-size:.88rem;color:var(--ink-soft)}
  .trabajando__barra{height:6px;background:var(--track);border-radius:3px;overflow:hidden}
  .trabajando__barra span{display:block;height:100%;width:0;border-radius:3px;
    background:linear-gradient(90deg,#EF8A4D,#B9BC72,#7FAE79);transition:width .9s linear}
  .trabajando__pie{margin:.5rem 0 0;font-size:.8rem;color:var(--ink-soft);
    font-variant-numeric:tabular-nums}
  @media print{.trabajando{display:none}}

  /* Los puntitos. Un rato quieto parece que se ha colgado */
  .latido{display:flex;gap:.5rem}
  .latido span{width:.6rem;height:.6rem;border-radius:50%;background:var(--verde-medio);
    animation:latido 1.2s ease-in-out infinite}
  .latido span:nth-child(2){animation-delay:.2s}
  .latido span:nth-child(3){animation-delay:.4s}
  @keyframes latido{0%,60%,100%{opacity:.25;transform:translateY(0)}30%{opacity:1;transform:translateY(-.35rem)}}

  /* Aviso del fichero local: se parece al web pero no puede redactar solo */
  .nota--local{background:var(--tarjeta);border-left-color:var(--verde-medio);margin-bottom:1rem}

  /* La puerta. El código lo valida el servidor, no esta página */
  .puerta{display:flex;flex-direction:column;gap:.2rem;align-items:center;width:100%;max-width:22rem}
  .puerta .campo{margin-bottom:.1rem;text-align:center;align-items:center}
  .puerta__fila{display:flex;gap:.5rem;width:100%}
  .puerta__fila input{flex:1;font:inherit;color:inherit;background:var(--tarjeta);
    border:1px solid var(--borde);border-radius:5px;padding:.7rem .8rem;min-width:0}
  .puerta__fila .boton{padding:.7rem 1.4rem;white-space:nowrap}
  .puerta__error{margin:.5rem 0 0;font-size:.88rem;color:#B03030}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .puerta__error{color:#E88}}

  /* Idiomas: ES y EN cambian la lengua al instante; CA explica por qué no puede */
  .idiomas{display:flex;gap:.15rem;align-items:center;font-size:.82rem;color:var(--ink-soft)}
  .idioma{background:none;border:0;padding:.3rem .5rem;border-radius:4px;cursor:pointer;
    color:var(--verde-medio);font-weight:600;letter-spacing:.04em}
  .idioma:hover{background:var(--tarjeta)}
  .idioma[aria-current="true"]{color:var(--ink-soft);cursor:default;font-weight:400}
  .idioma[aria-current="true"]:hover{background:none}
  .panel{border:1px solid var(--borde);border-radius:8px;background:var(--tarjeta);
    color:var(--ink);max-width:34rem;padding:1.6rem 1.7rem;box-shadow:var(--sombra-alta)}
  .panel::backdrop{background:rgba(15,32,26,.45)}
  .panel h2{font-size:1.35rem;margin-bottom:.8rem;text-wrap:balance}
  .panel p{margin:0 0 .8rem;text-align:left}
  .panel p:last-of-type{margin-bottom:1.3rem}
  .campo{display:flex;flex-direction:column;gap:.3rem;font-size:.9rem;margin-bottom:1rem}
  .campo span{color:var(--ink-soft);font-weight:400}
  .campo input{font:inherit;color:inherit;background:var(--ground);border:1px solid var(--borde);
    border-radius:5px;padding:.55rem .7rem;max-width:20rem}
  .barra-informe{display:flex;justify-content:space-between;align-items:center;gap:1rem;
    flex-wrap:wrap;padding:.7rem 1.25rem;background:var(--ground);
    border-bottom:1px solid var(--borde);position:sticky;top:0;z-index:3}
  .barra-informe .boton{padding:.5rem 1rem;font-size:.9rem}
  #marco{flex:1;width:100%;border:0;min-height:calc(100vh - 4rem);background:#fff}
  .json{width:100%;min-height:9rem;margin-top:.9rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
    font-size:.8rem;line-height:1.5;background:var(--ground);color:var(--ink-soft);
    border:1px solid var(--borde);border-radius:5px;padding:.7rem;resize:vertical}
${estilosPortada}
</style>

<div class="marco" id="app"></div>

<script>
${paquete}
</script>

<script>
const D = ${JSON.stringify(datos)};
const HUECO_CTA_HERO = ${JSON.stringify(MARCA_CTA_HERO)};
const HUECO_CTA_FINAL = ${JSON.stringify(MARCA_CTA_FINAL)};
const HUECO_IDIOMAS = ${JSON.stringify(MARCA_IDIOMAS)};
const HUECO_AVISO = ${JSON.stringify(MARCA_AVISO)};

/**
 * Las tipografias de la casa, puestas al arrancar.
 *
 * Viajan **una sola vez**, dentro de D, que es de donde las coge tambien el
 * informe: su iframe es un srcdoc, o sea otro documento, y necesita declarar
 * las suyas. Antes se emitian ademas como <style> en la cabecera, asi que los
 * mismos 110 KB de base64 iban dos veces en una pagina de 747.
 *
 * Ponerlas desde aqui no parpadea: el cuerpo esta vacio hasta que pinta() lo
 * llena, y ajustarRotulo ya espera a document.fonts.ready para medir.
 */
(function ponerTipografias(){
  const t = D.comun.marca && D.comun.marca.tipografias;
  if (!t) return;
  const cara = (familia, peso, b64) =>
    '@font-face{font-family:"' + familia + '";font-style:normal;font-weight:' + peso +
    ';font-display:swap;src:url(data:font/woff2;base64,' + b64 + ') format("woff2")}';
  const hoja = document.createElement("style");
  hoja.textContent =
    cara("Montserrat", "400 700", t.montserrat) +
    cara("Lato", "400", t.lato400) +
    cara("Lato", "700", t.lato700);
  document.head.appendChild(hoja);
})();

const CFG = D.comun.config;

// ---- El idioma ----
// La pagina lleva los dos dentro (D.idiomas) y el selector cambia entre ellos
// al instante, sin recargar. La eleccion se recuerda; castellano por defecto.
let idioma = "es";
let T, CUES, RECURSOS, PORTADA_HTML;

const recuerdaIdioma = {
  leer(){ try { return localStorage.getItem("identify-idioma") || ""; } catch { return ""; } },
  guardar(v){ try { localStorage.setItem("identify-idioma", v); } catch {} },
};

function aplicarIdioma(nuevo){
  idioma = nuevo;
  const capa = D.idiomas[nuevo];
  T = capa.textos.test;
  CUES = capa.cuestionario;
  PORTADA_HTML = capa.portada;
  // Lo que espera el motor y el renderizador: la capa del idioma con lo comun.
  RECURSOS = {
    config: D.comun.config,
    marca: D.comun.marca,
    labels: capa.labels,
    textos: capa.textos,
    rules: capa.rules,
    facetas: capa.facetas,
    metaforas: capa.metaforas,
    fuentes: capa.fuentes,
  };
  document.documentElement.lang = nuevo;
  document.title = T.titulo;
  recuerdaIdioma.guardar(nuevo);
}

function cambiarIdioma(nuevo){
  if (nuevo === idioma || !D.idiomas[nuevo]) return;
  aplicarIdioma(nuevo);
  // Cambiar de lengua reinicia lo volatil y vuelve a la portada: una redaccion
  // es de su idioma, y el selector solo esta en la portada, donde aun no hay
  // nada que perder.
  for (const k in respuestas) delete respuestas[k];
  persona = ""; prosa = {};
  redactando = false; yaPedida = false; indice = 0;
  pantalla = "portada";
  pintar();
}

aplicarIdioma(D.idiomas[recuerdaIdioma.leer()] ? recuerdaIdioma.leer() : "es");

const puntuar = respuestas => {
  const s = score(respuestas, CFG);
  return { facetas: s.facets, dominios: s.domains };
};

/**
 * Autocomprobacion contra el caso de ejemplo del Excel oficial.
 *
 * El motor de esta pagina es el mismo de src/services/, empotrado al generar.
 * Aun asi se comprueba al cargar: puntuaciones, bandas, reglas disparadas y
 * senales tienen que dar lo que dio el motor en Node. Si no, algo se ha roto
 * por el camino y vale mas no ensenar resultados.
 */
function comprobar(){
  const r = {};
  for (const k in D.check.responses) r[+k] = D.check.responses[k];
  const fallos = [];
  try {
    const { facetas, dominios } = puntuar(r);
    for (const id in D.check.facets) if (Math.abs(facetas[id] - D.check.facets[id]) > 1e-9) fallos.push(id);
    for (const id in D.check.domains) if (Math.abs(dominios[id] - D.check.domains[id]) > 1e-9) fallos.push(id);

    const modelo = construirModelo(r, RECURSOS);
    for (const f of modelo.domains.flatMap(d => d.facets)) {
      if (f.band !== D.check.bandas[f.id]) fallos.push("banda de " + f.id);
    }
    if (modelo.fired.length !== D.check.disparadas) fallos.push("nº de reglas disparadas");
    if (modelo.nearMisses.length !== D.check.senales) fallos.push("nº de señales");
  } catch (e) {
    fallos.push("el motor no arranca: " + e.message);
  }
  return fallos;
}
const FALLOS = comprobar();

// ---- Estado ----
let pantalla = "portada";
let indice = 0;
const respuestas = {};   // solo en memoria: no se guarda nada
let persona = "";
// Mientras Claude escribe, el informe ya se ve: se dibuja con todo lo que
// calcula el codigo y los pasajes se rellenan cuando llegan. Un minuto mirando
// una pantalla de espera es un minuto perdido; mirando tu propio informe, no.
let redactando = false;
let yaPedida = false;
let empezoLaRedaccion = 0;
let prosa = {};          // la redaccion, si se pega
const app = document.getElementById("app");
// esc, num y pos ya vienen en el paquete del motor: no se redeclaran aqui,
// que en un ambito plano seria un choque de nombres.

function pintar(){
  if (pantalla === "portada") return portada();
  if (pantalla === "test") return pregunta();
  if (pantalla === "informe") return informe();
  return resultados();
}

function portada(){
  // La pantalla de inicio se monta al generar la pagina (src/pagina/portada.mjs)
  // y llega aqui con dos huecos: el boton del hero y el del cierre. Lo que va
  // dentro depende de algo que solo se sabe aqui —si hay servidor y si esta
  // persona ya ha entrado el codigo—, y por eso no puede decidirse al generar.
  //
  // Sin comillas invertidas en toda la funcion: este texto viaja dentro de una
  // plantilla y una comilla suelta la parte por la mitad.
  const puertaCerrada = HAY_SERVIDOR && !recuerdaCodigo.leer();
  const laPuerta =
    '<form class="puerta" id="puerta">' +
      '<label class="campo" for="codigo">' + T.puerta.etiqueta +
        '<span>' + T.puerta.pista + '</span>' +
      '</label>' +
      '<div class="puerta__fila">' +
        '<input id="codigo" name="codigo" type="text" autocomplete="off" ' +
               'autocapitalize="off" spellcheck="false" required>' +
        '<button class="cta" type="submit">' + T.puerta.entrar + '</button>' +
      '</div>' +
      '<p class="puerta__error" id="puertaError" role="alert" hidden></p>' +
    '</form>';
  // Los dos botones se escriben enteros, con su id a la vista, y no se arman
  // pegando trozos: asi quien lea este fichero —o la prueba que comprueba que el
  // fichero local tiene por donde empezar— encuentra lo que busca.
  const botonHero = '<button class="cta" id="empezar" type="button">' +
    T.inicio.empezar + ' <span aria-hidden="true">→</span></button>';
  const botonCierre = '<button class="cta" id="empezar2" type="button">' +
    T.inicio.empezar + ' <span aria-hidden="true">→</span></button>';

  // Con la puerta puesta, el boton del cierre no puede empezar el test: lleva
  // al codigo, que es lo unico que abre. Mandar a alguien hasta abajo y dejarlo
  // ahi sin decirle por que no pasa nada seria peor que no poner boton.
  const alCierre = puertaCerrada
    ? '<button class="cta" id="alaPuerta" type="button">' + T.inicio.alCodigo +
      ' <span aria-hidden="true">↑</span></button>'
    : botonCierre;

  // ES y EN cambian la lengua de verdad; CA abre la explicacion de por que no
  // hay catalan. El activo lleva aria-current y no hace nada al pulsarlo.
  const selectorDeIdiomas =
    '<div class="idiomas">' +
      '<button class="idioma" data-cambia="es"' + (idioma === "es" ? ' aria-current="true"' : '') + '>ES</button><span aria-hidden="true">·</span>' +
      '<button class="idioma" data-idioma="ca">CA</button><span aria-hidden="true">·</span>' +
      '<button class="idioma" data-cambia="en"' + (idioma === "en" ? ' aria-current="true"' : '') + '>EN</button>' +
    '</div>';

  app.innerHTML = PORTADA_HTML
    .replace(HUECO_CTA_HERO, puertaCerrada ? laPuerta : botonHero)
    .replace(HUECO_CTA_FINAL, alCierre)
    .replace(HUECO_IDIOMAS, selectorDeIdiomas)
    .replace(HUECO_AVISO, FALLOS.length
      ? '<div class="fallo">' + rellena(T.inicio.avisoFallos, { lista: FALLOS.join(", ") }) + '</div>'
      : "")
    + '<dialog class="panel" id="panelIdioma" aria-labelledby="panelIdiomaT">' +
        '<h2 id="panelIdiomaT"></h2>' +
        '<div id="panelIdiomaC"></div>' +
        '<button class="boton" id="panelIdiomaX"></button>' +
      '</dialog>';

  // Los desplegables. Se abren y se cierran con el mismo boton, y el estado va
  // en aria-expanded para que un lector de pantalla lo cante igual que se ve.
  //
  // Solo uno abierto a la vez: con varios abiertos la pila crecia hasta nueve
  // mil pixeles y se perdia justo lo que se venia a buscar, que es ver los ocho
  // titulares de una vez. Al abrir uno se cierran los demas.
  const plegar = (cab, abrir) => {
    const cuerpo = document.getElementById(cab.getAttribute("aria-controls"));
    cab.setAttribute("aria-expanded", String(abrir));
    cuerpo.hidden = !abrir;
    // El pliegue abierto se marca tambien en el contenedor: asi el numero cambia
    // de color y el borde se enciende, y se ve cual esta abierto sin tener que
    // mirar la flecha.
    cab.closest(".desplegable").setAttribute("data-abierto", abrir ? "si" : "no");
  };

  for (const cab of document.querySelectorAll(".desplegable__cab")) {
    cab.onclick = () => {
      const abierto = cab.getAttribute("aria-expanded") === "true";
      for (const otro of document.querySelectorAll('.desplegable__cab[aria-expanded="true"]')) {
        if (otro !== cab) plegar(otro, false);
      }
      plegar(cab, !abierto);
      // Al cerrarse los de arriba, la pagina se acorta y el pliegue recien
      // abierto puede quedar fuera de la pantalla. Se le lleva la vista, que es
      // lo que la persona acaba de pedir mirar.
      if (!abierto) {
        const arriba = cab.getBoundingClientRect().top;
        if (arriba < 0 || arriba > window.innerHeight - 120) {
          cab.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
  }

  const empezar2 = document.getElementById("empezar2");
  if (empezar2) empezar2.onclick = () => { pantalla = "test"; pintar(); };

  const alaPuerta = document.getElementById("alaPuerta");
  if (alaPuerta) alaPuerta.onclick = () => {
    const campo = document.getElementById("codigo");
    campo.scrollIntoView({ behavior: "smooth", block: "center" });
    campo.focus({ preventScroll: true });
  };

  const empezar = document.getElementById("empezar");
  if (empezar) empezar.onclick = () => { pantalla = "test"; pintar(); };

  // La puerta. El código lo comprueba el servidor: si lo comprobara esta página
  // tendría que llevarlo dentro, y quien mirase el código fuente lo vería.
  const puerta = document.getElementById("puerta");
  if (puerta) puerta.onsubmit = async (e) => {
    e.preventDefault();
    const campo = document.getElementById("codigo");
    const aviso = document.getElementById("puertaError");
    const boton = puerta.querySelector("button");
    const codigo = campo.value.trim();
    if (!codigo) return;

    aviso.hidden = true;
    boton.disabled = true;
    const etiqueta = boton.textContent;
    boton.textContent = T.puerta.comprobando;
    try {
      const r = await fetch("/api/entrar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ codigo }),
      });
      if (r.ok) {
        recuerdaCodigo.guardar(codigo);
        pantalla = "test";
        pintar();
        return;
      }
      const datos = await r.json().catch(() => ({}));
      aviso.textContent = datos.error || T.puerta.noComprobado;
      aviso.hidden = false;
      campo.select();
    } catch {
      aviso.textContent = T.puerta.sinConexion;
      aviso.hidden = false;
    } finally {
      boton.disabled = false;
      boton.textContent = etiqueta;
    }
  };

  for (const b of document.querySelectorAll("[data-idioma]")) {
    b.onclick = () => abrirPanelIdioma(b.dataset.idioma);
  }
  for (const b of document.querySelectorAll("[data-cambia]")) {
    b.onclick = () => cambiarIdioma(b.dataset.cambia);
  }
  ajustarRotulo();
}

// El catalán no cambia de idioma: explica por qué no puede. No hay adaptación
// oficial del BFI-2 al catalán, y traducirlo por nuestra cuenta cambiaría lo
// que mide cada pregunta. La explicación va en catalán, que es lo cortés.
const IDIOMAS = {
  ca: {
    titulo: "Per què aquest test no és en català",
    cerrar: "Entesos",
    parrafos: [
      "Identify funciona amb el BFI-2, un qüestionari validat científicament. La validació és el que fa que les teves puntuacions signifiquin alguna cosa: sense ella, cinc números no són res.",
      "Del BFI-2 hi ha adaptació oficial al castellà, publicada i validada amb mostra espanyola (Gallardo-Pujol i altres, 2022). Al català, ara mateix, no n'hi ha.",
      "Podríem traduir-lo nosaltres en una tarda. <strong>No ho fem a propòsit.</strong> Una traducció no validada canvia el que mesura cada pregunta sense que es noti, i els resultats deixarien de ser comparables amb les dades publicades. Tindries un test en català que sembla igual i val menys.",
      "Preferim dir-t'ho que dissimular-ho.",
      "El qüestionari, doncs, en castellà o en anglès —l'original—. La conversa amb la teva coach, en català sempre que vulguis.",
    ],
  },
};

function abrirPanelIdioma(cual){
  const t = IDIOMAS[cual];
  if (!t) return;
  const panel = document.getElementById("panelIdioma");
  document.getElementById("panelIdiomaT").textContent = t.titulo;
  document.getElementById("panelIdiomaC").innerHTML = t.parrafos.map(p => "<p>" + p + "</p>").join("");
  const cerrar = document.getElementById("panelIdiomaX");
  cerrar.textContent = t.cerrar;
  cerrar.onclick = () => panel.close();
  panel.showModal();
}

function pregunta(){
  const q = CFG.questions[indice];
  const elegido = respuestas[q.id];
  const hechas = Object.keys(respuestas).length;
  app.innerHTML = \`
    <div class="progreso">
      <div class="progreso__fila"><span>\${rellena(T.pregunta.de60, { n: indice + 1 })}</span><span>\${rellena(T.pregunta.completado, { pct: Math.round(hechas / 60 * 100) })}</span></div>
      <div class="barra"><div class="barra__relleno" style="width:\${hechas / 60 * 100}%"></div></div>
    </div>
    <div class="contenido">
      <div class="pregunta">
        <p class="stem">\${esc(CUES.stem)}</p>
        <h2 class="enunciado">\${esc(CUES.questions[q.id])}</h2>
        <div class="opciones" role="radiogroup" aria-label="\${T.pregunta.ariaEscala}">
          \${[1,2,3,4,5].map(v => \`
            <button class="opcion" role="radio" aria-checked="\${elegido === v}" data-v="\${v}">
              <span class="opcion__num">\${v}</span><span>\${esc(CUES.scale[v])}</span>
            </button>\`).join("")}
        </div>
        <div class="pie-preg">
          <button class="enlace" id="atras" \${indice === 0 ? "disabled" : ""}>\${T.pregunta.anterior}</button>
          <span class="ayuda">\${T.pregunta.teclas}</span>
        </div>
      </div>
    </div>\`;
  app.querySelectorAll(".opcion").forEach(b => b.onclick = () => responder(+b.dataset.v));
  document.getElementById("atras").onclick = () => { if (indice > 0) { indice--; pintar(); } };
}

function responder(valor){
  const q = CFG.questions[indice];
  respuestas[q.id] = valor;
  if (indice < 59) { indice++; pintar(); }
  else if (Object.keys(respuestas).length === 60) { pantalla = "resultados"; pintar(); }
  else { indice = CFG.questions.findIndex(x => respuestas[x.id] === undefined); pintar(); }
}

document.addEventListener("keydown", e => {
  if (pantalla !== "test") return;
  if (e.key >= "1" && e.key <= "5") { responder(+e.key); e.preventDefault(); }
  if (e.key === "Backspace" && indice > 0) { indice--; pintar(); e.preventDefault(); }
});

function filas(items, etiquetas, valores){
  return items.map(x => {
    const v = valores[x.id];
    return \`<div class="fila">
      <div class="fila__n">\${esc(etiquetas[x.id])}</div>
      <div class="eje" role="img" aria-label="\${rellena(T.resultados.ariaEje, { nombre: esc(etiquetas[x.id]), valor: num(v) })}">
        <div class="eje__medio"></div>
        <div class="eje__relleno" style="width:\${pos(v)}%"></div>
        <div class="eje__punto" style="left:\${pos(v)}%"></div>
      </div>
      <div class="fila__v">\${num(v)}</div>
    </div>\`;
  }).join("");
}

function resultados(){
  const { facetas, dominios } = puntuar(respuestas);
  const escalaTest = '<div class="escala"><div></div><div class="escala__e"><span>1</span><span>3</span><span>5</span></div><div class="escala__h"></div></div>';
  const porDominio = CFG.domains.map(d => \`
    <div class="bloque">
      <h3>\${esc(RECURSOS.labels.domains[d.id])} — \${num(dominios[d.id])}</h3>
      <p class="bloque__sub">\${T.resultados.facetasSub}</p>
      \${filas(CFG.facets.filter(f => f.domain === d.id), RECURSOS.labels.facets, facetas)}
      \${escalaTest}
    </div>\`).join("");

  app.innerHTML = \`
    <div class="contenido">
      <div class="resultados">
        <div>
          <p class="etiqueta">\${T.resultados.etiqueta}</p>
          <h2 style="font-size:1.7rem">\${T.resultados.titulo}</h2>
        </div>
        <div class="nota">
          <p>\${T.resultados.nota1}</p>
          <p>\${T.resultados.nota2}</p>
        </div>
        <div class="bloque">
          <h3>\${T.resultados.dominios}</h3>
          <p class="bloque__sub">\${T.resultados.dominiosSub}</p>
          \${filas(CFG.domains, RECURSOS.labels.domains, dominios)}
          \${escalaTest}
        </div>
        \${porDominio}
        <div class="bloque">
          <h3>\${T.resultados.informeTitulo}</h3>
          <p class="bloque__sub">\${T.resultados.informeSub}</p>
          \${
            HAY_SERVIDOR
              ? ""
              : \`<div class="nota nota--local">
                   <p>\${T.resultados.local1}</p>
                   <p>\${T.resultados.local2}</p>
                 </div>\`
          }
          <label class="campo">\${T.resultados.nombre} <span>\${T.resultados.nombreOpcional}</span>
            <input id="persona" type="text" autocomplete="name" placeholder="\${T.resultados.nombreEjemplo}">
          </label>
          <div class="acciones">
            <button class="boton" id="informe">\${T.informe.nombre}</button>
            <button class="boton boton--claro" id="ver">\${T.resultados.verJson}</button>
          </div>
          <textarea id="json" class="json" readonly hidden aria-label="\${T.resultados.ariaJson}"></textarea>
        </div>
        <div class="acciones">
          <button class="boton boton--claro" id="reiniciar">\${T.resultados.reiniciar}</button>
        </div>
        <p class="ayuda">\${T.resultados.nadaGuardado}</p>
      </div>
    </div>\`;

  document.getElementById("reiniciar").onclick = () => {
    for (const k in respuestas) delete respuestas[k];
    persona = ""; prosa = {};
    redactando = false; yaPedida = false; // otro test, otra redacción
    indice = 0; pantalla = "portada"; pintar();
  };
  // Lo que se copia son las RESPUESTAS, no las puntuaciones: quien genera el
  // informe vuelve a puntuar con el motor, y asi no hay dos calculos que puedan
  // discrepar. La fecha se toma del dia en que se responde.
  const paraElInforme = () => JSON.stringify({
    test: "identify-bfi2",
    version: 1,
    fecha: new Date().toISOString().slice(0, 10),
    persona: (document.getElementById("persona")?.value || "").trim(),
    respuestas,
  }, null, 2);

  const caja = document.getElementById("json");
  document.getElementById("ver").onclick = e => {
    caja.value = paraElInforme();
    caja.hidden = !caja.hidden;
    e.target.textContent = caja.hidden ? T.resultados.verJson : T.resultados.ocultarJson;
    if (!caja.hidden) caja.select();
  };
  document.getElementById("informe").onclick = () => {
    persona = (document.getElementById("persona")?.value || "").trim();
    // El informe se abre YA, con todo lo que calcula el código. La redacción
    // arranca sola y se rellena cuando llega: el paso intermedio —abrir el
    // informe y tener que buscar otro botón arriba— parecía un final y no lo
    // era, y la pantalla de espera hacía perder un minuto mirando a la nada.
    pantalla = "informe";
    pintar();
  };
}

function copiarEnBoton(boton, texto, etiqueta){
  const caja = document.getElementById("json");
  navigator.clipboard?.writeText(texto).then(
    () => { boton.textContent = T.copiar.copiado; setTimeout(() => boton.textContent = etiqueta, 1800); },
    () => { if (caja) { caja.value = texto; caja.hidden = false; caja.select(); } boton.textContent = T.copiar.aMano; },
  );
}

// ---- El informe ----
function informe(){
  const modelo = construirModelo(respuestas, RECURSOS, { persona: persona || undefined });
  const html = renderInforme(modelo, prosa, RECURSOS.labels, {
    facetas: RECURSOS.facetas,
    textos: RECURSOS.textos.informe,
    metaforas: RECURSOS.metaforas,
    fuentes: RECURSOS.fuentes,
    marca: RECURSOS.marca,
    fecha: fechaLarga(new Date().toISOString().slice(0, 10)),
  });
  const conProsa = Object.keys(prosa).length > 0;

  app.innerHTML = \`
    <div class="barra-informe">
      <button class="enlace" id="volver">\${T.informe.volver}</button>
      <div class="acciones">
        \${conProsa || redactando || !HAY_SERVIDOR ? "" : '<button class="boton" id="generar">' + T.informe.generar + '</button>'}
        \${conProsa || redactando || HAY_SERVIDOR ? "" : '<button class="boton boton--claro" id="encargo">' + T.informe.encargo + '</button><button class="enlace" id="encargoLargo" title="' + T.informe.encargoLargoTitulo + '">' + T.informe.encargoLargo + '</button>'}
        \${redactando || (HAY_SERVIDOR && !conProsa) ? "" : '<button class="boton boton--claro" id="pegar">' + (conProsa ? T.informe.cambiarRedaccion : T.informe.pegarRedaccion) + '</button>'}
        <button class="boton boton--claro" id="imprimir">\${T.informe.imprimir}</button>
      </div>
    </div>
    <iframe id="marco" title="\${T.informe.nombre}"></iframe>
    \${
      redactando
        ? \`<aside class="trabajando" role="status" aria-live="polite">
             <p class="trabajando__t">\${T.trabajando.titulo}</p>
             <p class="trabajando__d">\${T.trabajando.detalle}</p>
             <div class="trabajando__barra"><span id="barraProgreso"></span></div>
             <p class="trabajando__pie"><span id="barraTiempo">0 s</span> · \${T.trabajando.tarda}</p>
           </aside>\`
        : ""
    }\`;

  const marco = document.getElementById("marco");
  marco.srcdoc = html;

  // La redacción arranca sola la primera vez que se abre el informe, y solo una
  // vez: si vuelves a las puntuaciones y entras otra vez, la que ya está en
  // marcha sigue su camino y no se pide —ni se paga— dos veces.
  if (redactando) moverLaBarra();

  if (HAY_SERVIDOR && !conProsa && !yaPedida) {
    yaPedida = true;
    redactando = true;
    empezoLaRedaccion = Date.now();
    pintar(); // para que salga el aviso de que se está redactando
    redactarEnElServidor(null, modelo).then((salioBien) => {
      redactando = false;
      // Si ha ido bien, la prosa ya está puesta y el informe se redibuja con
      // los pasajes dentro. Si no, se queda como está y el aviso desaparece.
      if (pantalla === "informe" || salioBien) pintar();
    });
    return;
  }

  document.getElementById("volver").onclick = () => { pantalla = "resultados"; pintar(); };
  document.getElementById("imprimir").onclick = () => marco.contentWindow?.print();
  // Dos encargos, y manda el corto: la skill identify-bfi2-knowledge ya trae el
  // tono, el metodo y el protocolo de seguridad, asi que repetirlos seria tener
  // las mismas reglas en dos sitios. El largo queda para una conversacion que no
  // la tenga cargada.
  const encargo = document.getElementById("encargo");
  if (encargo) encargo.onclick = e => copiarEnBoton(e.target, promptCorto(modelo, RECURSOS.facetas, idioma), T.informe.encargo);
  const encargoLargo = document.getElementById("encargoLargo");
  if (encargoLargo) encargoLargo.onclick = e => copiarEnBoton(e.target, promptCompleto(modelo, RECURSOS.facetas, idioma), T.informe.encargoLargo);

  const generar = document.getElementById("generar");
  if (generar) generar.onclick = () => redactarEnElServidor(generar, modelo);

  const pegar = document.getElementById("pegar");
  if (pegar) pegar.onclick = () => {
    const pegado = window.prompt(T.informe.pegarInstrucciones, "");
    if (pegado === null) return;
    let candidata;
    try { candidata = JSON.parse(pegado); }
    catch { window.alert(T.informe.jsonInvalido); return; }
    const fallos = validarProsa(candidata, modelo, idioma);
    if (fallos.length) { window.alert(rellena(T.informe.noEncaja, { lista: fallos.join("\\n· ") })); return; }
    prosa = candidata;
    pintar();
  };
}

// En la web hay una funcion que redacta con la clave del lado del servidor. En
// el fichero local no la hay, y por eso ahi salen los botones de copiar el
// encargo: son dos caminos al mismo sitio, no dos versiones del producto.
const HAY_SERVIDOR = location.protocol === "http:" || location.protocol === "https:";

const recuerdaCodigo = {
  leer(){ try { return sessionStorage.getItem("identify-codigo") || ""; } catch { return ""; } },
  guardar(c){ try { sessionStorage.setItem("identify-codigo", c); } catch {} },
  olvidar(){ try { sessionStorage.removeItem("identify-codigo"); } catch {} },
};

/**
 * La barra de la tarjeta de espera.
 *
 * No hay progreso real que medir —la API no lo da— asi que se muestra el tiempo
 * transcurrido contra lo que suele tardar, y se frena en el 92%: llegar al 100%
 * y quedarse ahi seria mentir. Los segundos que se ven al lado son de verdad.
 */
const TARDA_HABITUALMENTE = 85;

function moverLaBarra(){
  const barra = document.getElementById("barraProgreso");
  const reloj = document.getElementById("barraTiempo");
  if (!barra || !reloj) return;
  const tic = () => {
    if (!redactando) return;
    const s = (Date.now() - empezoLaRedaccion) / 1000;
    barra.style.width = Math.min(92, (s / TARDA_HABITUALMENTE) * 92).toFixed(1) + "%";
    reloj.textContent = Math.round(s) + " s";
    setTimeout(tic, 1000);
  };
  tic();
}

async function redactarEnElServidor(boton, modelo){
  // El modelo se reconstruye aqui si no viene: cuando se llama desde el boton
  // «Informe Identify» todavia no se ha dibujado ninguna pantalla de informe.
  modelo = modelo ?? construirModelo(respuestas, RECURSOS, { persona: persona || undefined });
  const codigo = recuerdaCodigo.leer() ||
    window.prompt(T.puerta.pedirCodigo, "");
  if (!codigo) return false;

  // Puede no haber boton: desde «Informe Identify» se llama con la pantalla de
  // espera dibujada, no con un boton que cambiar.
  const etiqueta = boton?.textContent;
  if (boton) { boton.disabled = true; boton.textContent = T.servidor.redactando; }

  // Un nombre para este encargo. El servidor no puede devolver el informe por
  // la misma conexion —tarda mas de lo que Netlify deja vivir una funcion— asi
  // que lo deja guardado con este nombre y aqui se va a buscar.
  const id = (crypto.randomUUID?.() ?? String(Date.now()) + Math.random().toString(36).slice(2));
  const fallo = (m) => { window.alert(m); return false; };

  try {
    const arranque = await fetch("/api/redactar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // Van las RESPUESTAS, no el perfil: el servidor vuelve a puntuar con el
      // mismo motor. Asi no hay dos calculos que puedan discrepar, y el
      // endpoint no se puede usar para pedirle a Claude cualquier otra cosa.
      // El idioma viaja con ellas: el informe se redacta en la lengua del test.
      body: JSON.stringify({ id, codigo, respuestas, persona, idioma }),
    });
    // Una funcion en segundo plano contesta 202 y nada mas: que haya arrancado
    // no dice todavia si el codigo era bueno. Eso llega con el resultado.
    if (!arranque.ok && arranque.status !== 202) {
      return fallo(T.servidor.noEmpezado);
    }

    // A buscarlo. Se pregunta cada tres segundos durante cuatro minutos: el
    // informe suele tardar entre uno y dos.
    const hasta = Date.now() + 4 * 60 * 1000;
    while (Date.now() < hasta) {
      await new Promise((r) => setTimeout(r, 3000));
      let datos;
      try {
        const r = await fetch("/api/resultado", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id, codigo }),
        });
        datos = await r.json().catch(() => ({}));
        if (r.status === 403) { recuerdaCodigo.olvidar(); return fallo(datos.error || T.servidor.codigoIncorrecto); }
      } catch {
        continue; // un fallo suelto de red no tiene por que tirar la espera
      }

      if (datos.estado === "trabajando") continue;
      if (datos.estado === "error") {
        if (datos.que === "codigo") recuerdaCodigo.olvidar();
        return fallo(datos.error || T.servidor.noGenerado);
      }
      if (datos.estado === "listo") {
        const fallos = validarProsa(datos.prosa, modelo, idioma);
        if (fallos.length) return fallo(T.servidor.incompleta);
        recuerdaCodigo.guardar(codigo);
        prosa = datos.prosa;
        if (boton) pintar(); // sin botón, quien ha llamado dibuja el informe después
        return true;
      }
    }
    return fallo(T.servidor.tardaDemasiado);
  } catch {
    return fallo(T.servidor.sinConexion);
  } finally {
    if (boton) { boton.disabled = false; boton.textContent = etiqueta; }
  }
}

function fechaLarga(iso){
  const [a, m, d] = iso.split("-").map(Number);
  return Number.isFinite(d) ? rellena(T.fechaLarga, { dia: d, mes: T.meses[m - 1], ano: a }) : iso;
}

// Norma de marca: «by Impausa» mide exactamente lo mismo que el titular.
function ajustarRotulo(){
  const n = document.getElementById("rn"), b = document.getElementById("rb");
  if (!n || !b) return;
  const ajustar = () => {
    const huecos = b.textContent.length - 1;
    const objetivo = n.getBoundingClientRect().width;
    let extra = 0;
    for (let i = 0; i < 8; i++){
      b.style.letterSpacing = extra + "px";
      b.style.marginRight = (-extra) + "px";
      const visible = b.getBoundingClientRect().width - extra;
      const dif = objetivo - visible;
      if (Math.abs(dif) < 0.3) break;
      extra += dif / huecos;
    }
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar); else ajustar();
  window.addEventListener("resize", ajustar);
}

pintar();
</script>
`;

const salida = process.argv[2] ?? "test-identify.html";
const destino = fileURLToPath(new URL("../" + salida, import.meta.url));
// La carpeta puede no existir: en Netlify el sitio se construye desde un clon
// limpio, y `publico/` no está en el repositorio.
mkdirSync(path.dirname(destino), { recursive: true });
writeFileSync(destino, html, "utf8");
console.log(
  `escrito ${salida}
` +
    `  ${recursos.config.questions.length} ítems · ${recursos.config.facets.length} facetas · ` +
    `${Object.keys(recursos.metaforas.categorias).length} categorías de metáforas
` +
    `  motor empotrado: ${(paquete.length / 1024).toFixed(0)} KB · página: ${(html.length / 1024).toFixed(0)} KB`,
);
