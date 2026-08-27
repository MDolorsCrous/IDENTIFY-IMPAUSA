// Renderiza el informe a HTML a partir del modelo y de los textos redactados.
//
//   node tools/render-informe.mjs salida.html
//
// El modelo lo construye el motor; los textos vienen de un objeto con una clave
// por seccion — el mismo esquema que devolvera Claude en produccion.
//
// Identidad visual: la documentada para los informes de LivePausa / IMPAUSA en la
// skill disc-insight-coach (verde #1A4A3A, verde medio #2D6B57, beige #F7F2EB,
// naranja #E8842A, Playfair Display + Source Sans 3). El rotulo de portada sigue
// la skill retol-test-impausa, que admite Playfair Display como alternativa a
// Cormorant Garamond: asi el documento entero va con una sola serif.
import { readFileSync, writeFileSync } from "node:fs";
import { score } from "../src/services/scoring.ts";
import { bands, interpret } from "../src/services/interpretation.ts";
import { buildReport } from "../src/services/report.ts";

const leer = (p) => JSON.parse(readFileSync(new URL("../" + p, import.meta.url), "utf8"));

const config = {
  questions: leer("src/config/questions.json"),
  facets: leer("src/config/facets.json"),
  domains: leer("src/config/domains.json"),
};
const reglas = leer("src/config/interpretation/combinations.json");
const labels = leer("src/i18n/es-informe.json");
const fixture = leer("tests/fixtures/ejemplo-excel.json");
const prosa = leer("tests/fixtures/prosa-ejemplo.json");

const respuestas = Object.fromEntries(Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]));
const puntuaciones = score(respuestas, config);
const banded = bands(puntuaciones);
const modelo = buildReport(puntuaciones, banded, interpret(banded.facets, reglas), config.domains, labels);

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (v) => v.toFixed(2).replace(".", ",");
/** Posicion de una puntuacion 1-5 sobre el eje, en porcentaje. */
const pos = (v) => ((v - 1) / 4) * 100;

function fila(item, destacada) {
  return `
      <div class="fila${destacada ? " fila--destacada" : ""}">
        <div class="fila__nombre">${esc(item.label)}${
          destacada ? '<span class="marca">se separa del resto</span>' : ""
        }</div>
        <div class="eje${destacada ? " eje--acento" : ""}" role="img" aria-label="${esc(item.label)}: ${num(item.score)} sobre 5, banda ${item.band}">
          <div class="eje__medio"></div>
          <div class="eje__relleno" style="width:${pos(item.score)}%"></div>
          <div class="eje__punto" style="left:${pos(item.score)}%"></div>
        </div>
        <div class="fila__dato"><b>${num(item.score)}</b><span>${esc(item.band)}</span></div>
      </div>`;
}

const escala = `<div class="escala"><div></div><div class="escala__eje"><span>1</span><span>3 · punto medio</span><span>5</span></div><div class="escala__hueco"></div></div>`;

const resumenVisual = `<div class="barras">${modelo.domains.map((d) => fila(d, false)).join("")}</div>${escala}`;

const dominios = modelo.domains
  .map((d) => {
    const nota = labels.notas?.[d.id];
    return `
    <section class="dominio">
      <header class="dominio__cab">
        <h3>${esc(d.label)}</h3>
        <span class="dominio__dato">${num(d.score)} <em>${esc(d.band)}</em></span>
      </header>
      <div class="barras">${d.facets.map((f) => fila(f, d.divergentFacet?.id === f.id)).join("")}</div>
      ${escala}
      <p>${esc(prosa.dominios[d.id])}</p>
      ${nota ? `<p class="nota">${esc(nota)}</p>` : ""}
    </section>`;
  })
  .join("");

const SENALES_MOSTRADAS = 4;
const senales = modelo.nearMisses.slice(0, SENALES_MOSTRADAS);
const senalesHtml = senales
  .map((m) => {
    const f = m.unmet[0];
    const nombre = labels.facets[f.condition.facet] ?? f.condition.facet;
    const pedido = f.condition.level === "high" ? "alta" : "baja";
    return `
      <li>
        <b>${esc(m.rule.effect)}</b>
        <span>Se daría con una ${esc(nombre.toLowerCase())} ${pedido}; en tu perfil queda ${esc(f.band)}.</span>
      </li>`;
  })
  .join("");

const leyenda = modelo.legend.length
  ? `<h4>Equivalencias de nombres</h4><ul>${modelo.legend
      .map((e) => `<li><b>${esc(e.label)}</b> — nombre técnico: ${esc(e.technicalLabel)}</li>`)
      .join("")}</ul>`
  : "";

const INDICE = [
  ["como-leer", "Cómo leer este informe"],
  ["resumen", "Resumen del perfil"],
  ["vistazo", "Resultado de un vistazo"],
  ["dominios", "Los cinco dominios en detalle"],
  ["combinaciones", "Combinaciones del perfil"],
  ["senales", "Señales de atención"],
  ["trabajo", "En el trabajo"],
  ["preguntas", "Preguntas poderosas"],
  ["plan", "Plan de acción"],
  ["conclusiones", "Conclusiones"],
  ["fuentes", "Fuentes y metodología"],
];

const html = `<title>Informe Identify</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap">
<style>
  :root{
    --verde:#1A4A3A; --verde-medio:#2D6B57; --beige:#F7F2EB; --naranja:#E8842A;
    --naranja-claro:#FDF0E4; --tarjeta:#FFFFFF; --borde:#E0D9D0;
    --ground:#F7F2EB; --ink:#1F2A25; --ink-soft:#5E6B64; --track:#E7E0D6;
    --titulo:#1A4A3A; --sombra:0 1px 2px rgba(26,74,58,.06);
  }
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --ground:#10201A; --tarjeta:#162C24; --ink:#EDE6DA; --ink-soft:#A9B8B0;
      --borde:#2C4238; --track:#22382F; --titulo:#8FCBB2; --naranja-claro:#2A2119;
      --verde-medio:#5FA588; --sombra:0 1px 2px rgba(0,0,0,.35);
    }
  }
  :root[data-theme="dark"]{
    --ground:#10201A; --tarjeta:#162C24; --ink:#EDE6DA; --ink-soft:#A9B8B0;
    --borde:#2C4238; --track:#22382F; --titulo:#8FCBB2; --naranja-claro:#2A2119;
    --verde-medio:#5FA588; --sombra:0 1px 2px rgba(0,0,0,.35);
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);
    font-family:"Source Sans 3",system-ui,sans-serif;font-size:17px;line-height:1.7;
    -webkit-font-smoothing:antialiased}
  .hoja{max-width:44rem;margin:0 auto;padding:clamp(1.4rem,4vw,3rem) clamp(1.1rem,4vw,2rem) 5rem;
    display:flex;flex-direction:column;gap:3rem}
  p{margin:0 0 .95rem;max-width:64ch}
  p:last-child{margin-bottom:0}
  h2,h3,h4{font-family:"Playfair Display",Georgia,serif;margin:0;text-wrap:balance;color:var(--titulo)}
  h2{font-size:clamp(1.55rem,4.3vw,2rem);font-weight:700;line-height:1.2}
  h3{font-size:1.3rem;font-weight:700}
  h4{font-size:1.08rem;font-weight:700}
  b{font-weight:600}
  :focus-visible{outline:2px solid var(--naranja);outline-offset:3px;border-radius:2px}

  /* Portada — rotulo segun la norma de marca */
  .portada{text-align:center;padding-block:clamp(.5rem,4vw,2.5rem) 0}
  .rotulo{font-family:"Playfair Display",Georgia,serif;font-weight:700;display:inline-block;
    font-size:clamp(3.2rem,14vw,5.5rem);line-height:.98;margin:0;color:var(--ink)}
  .rotulo__by{display:block;width:max-content;margin-inline:auto;font-style:italic;font-weight:700;
    font-size:clamp(1.5rem,6.6vw,2.6rem);line-height:1.1;margin-top:.06em;
    background:linear-gradient(90deg,#EF8A4D 0%,#DFAE6B 33%,#B9BC72 66%,#7FAE79 100%);
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .portada__pie{margin-top:1.5rem;color:var(--ink-soft);font-size:.95rem}

  .eyebrow{font-size:.71rem;letter-spacing:.15em;text-transform:uppercase;
    color:var(--verde-medio);font-weight:600;margin:0 0 .45rem}
  .seccion>h2{margin-bottom:.8rem}
  section{scroll-margin-top:1rem}

  .indice{background:var(--tarjeta);border:1px solid var(--borde);border-radius:3px;
    padding:1.2rem 1.4rem;box-shadow:var(--sombra)}
  .indice ol{margin:.5rem 0 0;padding-left:1.3rem;columns:2;column-gap:2rem}
  .indice li{margin-bottom:.3rem;break-inside:avoid}
  .indice a{color:var(--ink);text-decoration:none;border-bottom:1px solid transparent}
  .indice a:hover,.indice a:focus-visible{border-bottom-color:var(--naranja)}

  .aviso{background:var(--naranja-claro);border-left:3px solid var(--naranja);
    padding:1rem 1.2rem;font-size:.96rem;border-radius:0 3px 3px 0}
  .aviso p{max-width:none}
  .aviso ul{margin:.4rem 0 0;padding-left:1.1rem}
  .aviso li{margin-bottom:.25rem}

  .titular{font-family:"Playfair Display",Georgia,serif;font-size:clamp(1.5rem,4.4vw,2rem);
    font-weight:700;font-style:italic;line-height:1.25;margin:0 0 1rem;color:var(--titulo);
    text-wrap:balance}

  .barras{display:flex;flex-direction:column;gap:.55rem;margin:.2rem 0 0}
  .fila{display:grid;grid-template-columns:minmax(7rem,10.5rem) 1fr auto;gap:.85rem;align-items:center}
  .fila__nombre{font-size:.93rem;line-height:1.3;display:flex;flex-direction:column}
  .marca{font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:var(--naranja);font-weight:600}
  .eje{position:relative;height:9px;background:var(--track);border-radius:2px}
  .eje__medio{position:absolute;left:50%;top:-3px;bottom:-3px;width:1px;background:var(--borde)}
  .eje__relleno{position:absolute;left:0;top:0;bottom:0;border-radius:2px;
    background:var(--verde-medio);opacity:.5}
  .eje__punto{position:absolute;top:50%;width:9px;height:9px;border-radius:50%;
    background:var(--verde-medio);transform:translate(-50%,-50%);box-shadow:0 0 0 2px var(--ground)}
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

  .dominio{border-top:1px solid var(--borde);padding-top:1.4rem;margin-top:1.9rem;break-inside:avoid}
  .dominio:first-of-type{border-top:0;padding-top:0;margin-top:.6rem}
  .dominio__cab{display:flex;align-items:baseline;gap:.6rem;margin-bottom:.5rem;flex-wrap:wrap}
  .dominio__dato{margin-left:auto;font-variant-numeric:tabular-nums;font-size:.95rem}
  .dominio__dato em{font-style:normal;color:var(--ink-soft);font-size:.8rem}
  .dominio p{margin-top:1rem}
  .nota{font-size:.92rem;color:var(--ink-soft);border-left:2px solid var(--borde);padding-left:.9rem}

  .vacio{border:1px solid var(--borde);border-radius:3px;padding:1.2rem 1.35rem;background:var(--tarjeta)}
  .senales{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.75rem}
  .senales li{display:flex;flex-direction:column;gap:.1rem;padding-left:.9rem;
    border-left:2px solid var(--borde)}
  .senales span{color:var(--ink-soft);font-size:.94rem}

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

  .maqueta{position:sticky;top:0;z-index:5;background:#1A4A3A;color:#F7F2EB;
    font-size:.8rem;letter-spacing:.02em;text-align:center;padding:.5rem 1rem}

  @media print{
    @page{size:A4 portrait;margin:16mm}
    .maqueta,.indice{display:none}
    body{background:#fff;font-size:11pt}
    .hoja{max-width:none;padding:0;gap:1.6rem}
    .seccion{break-inside:avoid-page}
  }
  @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="maqueta">Maqueta · datos del caso de ejemplo del Excel oficial · los textos redactados son de muestra</div>

<div class="hoja">

  <header class="portada">
    <h1 class="rotulo"><span id="rotulo-nombre">Identify</span><span class="rotulo__by" id="rotulo-by">by Impausa</span></h1>
    <p class="portada__pie">Informe individual · BFI-2 · 60 ítems<br>Persona de ejemplo · 27 de agosto de 2026</p>
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
  </script>

  <nav class="indice" aria-label="Índice del informe">
    <p class="eyebrow" style="margin-bottom:0">Contenido</p>
    <ol>${INDICE.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join("")}</ol>
  </nav>

  <section class="seccion" id="como-leer">
    <p class="eyebrow">Aviso importante</p>
    <h2>Cómo leer este informe</h2>
    <p>Este cuestionario mide <b>tendencias de comportamiento</b> que tú mismo describes. Son
    estables, pero no fijas: cambian con el tiempo y con el contexto.</p>
    <div class="aviso">
      <p><b>Lo que este informe no es:</b></p>
      <ul>
        <li>No es un diagnóstico. Nada de lo que leas aquí es una condición clínica.</li>
        <li>No mide inteligencia, ni capacidad, ni idoneidad para un puesto.</li>
        <li>No predice lo que vas a hacer.</li>
      </ul>
      <p style="margin-top:.6rem"><b>Contra qué se compara:</b> ${esc(modelo.meta.comparisonNotice)}</p>
    </div>
    <p style="margin-top:1rem">No hay puntuaciones buenas ni malas. Son tendencias que ayudan o
    estorban según el contexto, y una puntuación intermedia suele indicar flexibilidad.</p>
  </section>

  <section class="seccion" id="resumen">
    <p class="eyebrow">Resumen del perfil</p>
    <p class="titular">${esc(prosa.titular)}</p>
    <p>${esc(prosa.perfilEnUnaFrase)}</p>
  </section>

  <section class="seccion" id="vistazo">
    <p class="eyebrow">De un vistazo</p>
    <h2>Los cinco dominios</h2>
    ${resumenVisual}
  </section>

  <section class="seccion" id="dominios">
    <p class="eyebrow">En detalle</p>
    <h2>Los cinco dominios, faceta a faceta</h2>
    <p style="color:var(--ink-soft);font-size:.95rem">Cada dominio se compone de tres facetas. Dos
    personas con la misma puntuación general pueden tenerlas repartidas de forma muy distinta, y ahí
    está lo característico de cada perfil. Cuando una faceta se separa claramente de las otras dos,
    va señalada en naranja.</p>
    ${dominios}
  </section>

  <section class="seccion" id="combinaciones">
    <p class="eyebrow">Combinaciones del perfil</p>
    <h2>Lo que aparece al cruzar las facetas</h2>
    <div class="vacio">
      <p>Tu perfil <b>no activa ninguna</b> de las 26 combinaciones descritas en la literatura
      científica sobre este cuestionario.</p>
      <p style="margin-bottom:0;color:var(--ink-soft)">No es una carencia: esas combinaciones exigen
      varias puntuaciones extremas a la vez, y la mayoría de perfiles no las reúnen. Lo característico
      de este perfil está en el recorrido faceta a faceta.</p>
    </div>
  </section>

  <section class="seccion" id="senales">
    <p class="eyebrow">Cerca, pero no</p>
    <h2>Señales de atención</h2>
    <p>${esc(prosa.senales)}</p>
    <ul class="senales">${senalesHtml}</ul>
  </section>

  <section class="seccion" id="trabajo">
    <p class="eyebrow">Aplicación</p>
    <h2>En el trabajo</h2>
    <p>${esc(prosa.enElTrabajo)}</p>
  </section>

  <section class="seccion" id="preguntas">
    <p class="eyebrow">Para pensar</p>
    <h2>Preguntas poderosas</h2>
    <ul class="preguntas">${prosa.preguntas.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
  </section>

  <section class="seccion" id="plan">
    <p class="eyebrow">Para hacer</p>
    <h2>Plan de acción</h2>
    <div class="plan">
      ${prosa.planAccion
        .map(
          (e) => `<article class="paso">
        <h4>${esc(e.titulo)}</h4>
        <p>${esc(e.texto)}</p>
        <p class="paso__ind"><b>Cómo sabrás si sirve:</b> ${esc(e.indicador)}</p>
      </article>`,
        )
        .join("")}
    </div>
  </section>

  <section class="seccion" id="conclusiones">
    <p class="eyebrow">Para cerrar</p>
    <h2>Conclusiones</h2>
    <p>${esc(prosa.conclusion)}</p>
  </section>

  <footer class="pie" id="fuentes">
    <h4>Fuentes y metodología</h4>
    <p>Instrumento: <b>BFI-2</b>, Big Five Inventory-2 (Soto &amp; John, 2017), en la adaptación
    española de Gallardo-Pujol et al. (2022). 60 ítems, escala de 1 a 5, cinco dominios y quince
    facetas. Cada faceta es la media de sus cuatro ítems; cada dominio, la media de sus doce.</p>
    <p>Las combinaciones proceden de la base de conocimiento de IMPAUSA sobre el BFI-2, con las
    referencias de Danner &amp; Lechner (2024), Ozer &amp; Benet-Martínez (2006), Soto (2019) y
    Soto &amp; John (2017).</p>
    ${leyenda}
    <h4>Aviso importante</h4>
    <p>Las facetas son escalas de cuatro ítems: sostienen menos peso que los dominios y conviene
    leerlas con más prudencia. Este informe es una herramienta de autoconocimiento y coaching; no es
    una prueba clínica ni de selección, y refleja cómo te describiste el día que lo respondiste.</p>
    <p style="margin-bottom:0"><b>Identify by Impausa</b> · LivePausa</p>
  </footer>

</div>
`;

const salida = process.argv[2] ?? "informe-ejemplo.html";
writeFileSync(new URL("../" + salida, import.meta.url), html, "utf8");
console.log(
  `escrito ${salida}\n` +
    `  ${modelo.domains.length} dominios · ${modelo.fired.length} reglas disparadas · ` +
    `${senales.length} de ${modelo.nearMisses.length} señales · leyenda: ${modelo.legend.length} entradas`,
);
