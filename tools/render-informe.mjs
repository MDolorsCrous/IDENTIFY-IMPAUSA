// Renderiza el informe a HTML a partir del modelo y de los textos redactados.
//
//   node tools/render-informe.mjs salida.html
//
// El modelo lo construye el motor; los textos vienen de un objeto con una clave
// por seccion — el mismo esquema que devolvera Claude en produccion. Aqui se usa
// la prosa de ejemplo de tests/fixtures/prosa-ejemplo.json.
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
const modelo = buildReport(
  puntuaciones,
  banded,
  interpret(banded.facets, reglas),
  config.domains,
  labels,
);

// Cada dominio se queda con una posicion del degradado del logo de IMPAUSA.
const TONOS = {
  extraversion: "#EF8A4D",
  agreeableness: "#E3A05C",
  conscientiousness: "#DFAE6B",
  negative_emotionality: "#B9BC72",
  open_mindedness: "#7FAE79",
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (v) => v.toFixed(2).replace(".", ",");
/** Posicion de una puntuacion 1-5 sobre el eje, en porcentaje. */
const pos = (v) => ((v - 1) / 4) * 100;

function barra(item, tono, destacada) {
  return `
      <div class="fila${destacada ? " fila--destacada" : ""}">
        <div class="fila__nombre">${esc(item.label)}${
          destacada ? '<span class="marca" title="Se separa de las otras dos facetas">se separa</span>' : ""
        }</div>
        <div class="eje" role="img" aria-label="${esc(item.label)}: ${num(item.score)} de 5, banda ${item.band}">
          <div class="eje__medio"></div>
          <div class="eje__relleno" style="width:${pos(item.score)}%;background:${tono}"></div>
          <div class="eje__punto" style="left:${pos(item.score)}%;background:${tono}"></div>
        </div>
        <div class="fila__dato"><b>${num(item.score)}</b><span>${esc(item.band)}</span></div>
      </div>`;
}

const dominios = modelo.domains
  .map((d) => {
    const tono = TONOS[d.id];
    return `
    <section class="dominio">
      <header class="dominio__cab">
        <span class="dominio__pip" style="background:${tono}"></span>
        <h3>${esc(d.label)}</h3>
        <span class="dominio__dato">${num(d.score)} <em>${esc(d.band)}</em></span>
      </header>
      <div class="barras">
        ${d.facets.map((f) => barra(f, tono, d.divergentFacet?.id === f.id)).join("")}
      </div>
      <p>${esc(prosa.dominios[d.id])}</p>
    </section>`;
  })
  .join("");

const resumen = modelo.domains
  .map(
    (d) => `
      <div class="fila">
        <div class="fila__nombre">${esc(d.label)}</div>
        <div class="eje">
          <div class="eje__medio"></div>
          <div class="eje__relleno" style="width:${pos(d.score)}%;background:${TONOS[d.id]}"></div>
          <div class="eje__punto" style="left:${pos(d.score)}%;background:${TONOS[d.id]}"></div>
        </div>
        <div class="fila__dato"><b>${num(d.score)}</b><span>${esc(d.band)}</span></div>
      </div>`,
  )
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
        <span>Se daría si tu ${esc(nombre.toLowerCase())} fuera ${pedido}; está ${esc(f.band)}.</span>
      </li>`;
  })
  .join("");

const leyenda = modelo.legend
  .map((e) => `<li><b>${esc(e.label)}</b> — nombre técnico: ${esc(e.technicalLabel)}</li>`)
  .join("");

const html = `<title>Informe Identify</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap">
<style>
  :root{
    --ground:#FBF5E9; --surface:#FFFDF7; --ink:#241910; --ink-soft:#5C4B3C;
    --rule:#E4D9C6; --rule-soft:#EFE6D6; --track:#EBE0CD;
    --aviso:#F6EDDC; --sombra:0 1px 2px rgba(36,25,16,.05);
  }
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --ground:#191410; --surface:#221B15; --ink:#F2E9DA; --ink-soft:#B9A894;
      --rule:#3A2F26; --rule-soft:#2C231C; --track:#31281F;
      --aviso:#2A211A; --sombra:0 1px 2px rgba(0,0,0,.3);
    }
  }
  :root[data-theme="dark"]{
    --ground:#191410; --surface:#221B15; --ink:#F2E9DA; --ink-soft:#B9A894;
    --rule:#3A2F26; --rule-soft:#2C231C; --track:#31281F;
    --aviso:#2A211A; --sombra:0 1px 2px rgba(0,0,0,.3);
  }
  *{box-sizing:border-box}
  body{
    margin:0; background:var(--ground); color:var(--ink);
    font-family:"Source Sans 3",system-ui,sans-serif; font-size:17px; line-height:1.65;
    -webkit-font-smoothing:antialiased;
  }
  .hoja{max-width:46rem;margin:0 auto;padding:clamp(1.5rem,4vw,3.5rem) clamp(1.1rem,4vw,2rem) 5rem;
    display:flex;flex-direction:column;gap:3.25rem}
  p{margin:0 0 .9rem;max-width:65ch}
  p:last-child{margin-bottom:0}
  h2,h3,h4{font-family:"Cormorant Garamond",Georgia,serif;margin:0;text-wrap:balance;letter-spacing:.01em}
  h2{font-size:clamp(1.6rem,4.5vw,2.1rem);font-weight:700;line-height:1.15}
  h3{font-size:1.35rem;font-weight:700}
  h4{font-size:1.15rem;font-weight:700}
  b{font-weight:600}

  /* Portada */
  .portada{text-align:center;padding-block:clamp(1rem,5vw,3rem) 0}
  .rotulo{font-family:"Cormorant Garamond",Georgia,serif;font-weight:700;display:inline-block;
    font-size:clamp(3.4rem,15vw,6rem);line-height:.95;letter-spacing:-.01em;margin:0}
  .rotulo__by{display:block;width:max-content;margin-inline:auto;font-style:italic;font-weight:700;
    font-size:clamp(1.7rem,7.4vw,3rem);line-height:1.1;margin-top:.06em;
    background:linear-gradient(90deg,#EF8A4D 0%,#DFAE6B 33%,#B9BC72 66%,#7FAE79 100%);
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .portada__pie{margin-top:1.6rem;color:var(--ink-soft);font-size:.95rem}

  .eyebrow{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;
    color:var(--ink-soft);font-weight:600;margin:0 0 .5rem}
  section{scroll-margin-top:1rem}
  .seccion>h2{margin-bottom:.85rem}

  .aviso{background:var(--aviso);border:1px solid var(--rule);border-radius:2px;
    padding:1.1rem 1.25rem;font-size:.95rem}
  .aviso p{max-width:none}
  .aviso ul{margin:.4rem 0 0;padding-left:1.1rem}
  .aviso li{margin-bottom:.3rem}

  .titular{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(1.7rem,5vw,2.3rem);
    font-weight:700;font-style:italic;line-height:1.2;margin:0 0 1rem;text-wrap:balance}

  /* Ejes 1-5 */
  .barras{display:flex;flex-direction:column;gap:.55rem;margin:.2rem 0 1.2rem}
  .fila{display:grid;grid-template-columns:minmax(7.5rem,11rem) 1fr auto;gap:.85rem;align-items:center}
  .fila__nombre{font-size:.92rem;line-height:1.3;display:flex;flex-direction:column}
  .marca{font-size:.66rem;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-soft)}
  .eje{position:relative;height:9px;background:var(--track);border-radius:1px}
  .eje__medio{position:absolute;left:50%;top:-3px;bottom:-3px;width:1px;background:var(--rule);opacity:.9}
  .eje__relleno{position:absolute;left:0;top:0;bottom:0;border-radius:1px;opacity:.55}
  .eje__punto{position:absolute;top:50%;width:9px;height:9px;border-radius:50%;
    transform:translate(-50%,-50%);box-shadow:0 0 0 2px var(--ground)}
  .fila__dato{text-align:right;font-variant-numeric:tabular-nums;line-height:1.2;
    display:flex;flex-direction:column;min-width:4.6rem}
  .fila__dato b{font-size:1rem}
  .fila__dato span{font-size:.74rem;color:var(--ink-soft)}
  .fila--destacada .fila__nombre{font-weight:600}
  .escala{display:grid;grid-template-columns:minmax(7.5rem,11rem) 1fr auto;gap:.85rem;
    font-size:.72rem;color:var(--ink-soft);margin-top:.15rem;font-variant-numeric:tabular-nums}
  .escala__eje{display:flex;justify-content:space-between}
  .escala__hueco{min-width:4.6rem}

  .dominio{border-top:1px solid var(--rule);padding-top:1.4rem;margin-top:1.9rem}
  .dominio:first-child{border-top:0;padding-top:0;margin-top:0}
  .dominio__cab{display:flex;align-items:baseline;gap:.6rem;margin-bottom:.9rem;flex-wrap:wrap}
  .dominio__pip{width:9px;height:9px;border-radius:50%;flex:none;transform:translateY(-1px)}
  .dominio__dato{margin-left:auto;font-variant-numeric:tabular-nums;font-size:.95rem}
  .dominio__dato em{font-style:normal;color:var(--ink-soft);font-size:.8rem}

  .vacio{border:1px dashed var(--rule);border-radius:2px;padding:1.3rem 1.4rem;background:var(--surface)}
  .senales{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.75rem}
  .senales li{display:flex;flex-direction:column;gap:.15rem;padding-left:.9rem;
    border-left:2px solid var(--rule)}
  .senales span{color:var(--ink-soft);font-size:.94rem}

  .preguntas{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:.7rem}
  .preguntas li{padding-left:1.15rem;position:relative;max-width:62ch}
  .preguntas li::before{content:"—";position:absolute;left:0;color:var(--ink-soft)}

  .exps{display:flex;flex-direction:column;gap:1.1rem}
  .exp{background:var(--surface);border:1px solid var(--rule);border-radius:2px;
    padding:1.1rem 1.25rem;box-shadow:var(--sombra)}
  .exp h4{margin-bottom:.3rem}
  .exp p{font-size:.97rem;margin-bottom:.55rem}
  .exp__ind{font-size:.86rem;color:var(--ink-soft);border-top:1px solid var(--rule-soft);
    padding-top:.5rem;margin:0}

  .pie{border-top:1px solid var(--rule);padding-top:1.5rem;font-size:.9rem;color:var(--ink-soft)}
  .pie ul{margin:.4rem 0 1rem;padding-left:1.1rem}
  .pie li{margin-bottom:.25rem}
  .pie b{color:var(--ink)}

  .maqueta{position:sticky;top:0;z-index:5;background:var(--ink);color:var(--ground);
    font-size:.8rem;letter-spacing:.03em;text-align:center;padding:.5rem 1rem}
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
    // titular, mismo borde izquierdo y mismo borde derecho. Se mide una vez
    // cargada la tipografía y se reparte la diferencia entre las letras.
    (function ajustarRotulo() {
      const nombre = document.getElementById("rotulo-nombre");
      const by = document.getElementById("rotulo-by");
      if (!nombre || !by) return;
      const ajustar = () => {
        by.style.letterSpacing = "0";
        by.style.paddingRight = "0";
        const objetivo = nombre.getBoundingClientRect().width;
        const actual = by.getBoundingClientRect().width;
        const huecos = by.textContent.length - 1;
        if (huecos < 1 || actual <= 0) return;
        const extra = (objetivo - actual) / huecos;
        by.style.letterSpacing = extra + "px";
        by.style.paddingRight = extra + "px"; // compensa el espaciado sobrante final
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar);
      else window.addEventListener("load", ajustar);
      window.addEventListener("resize", ajustar);
    })();
  </script>

  <section class="seccion">
    <p class="eyebrow">Antes de empezar</p>
    <h2>Cómo leer este informe</h2>
    <p>Este cuestionario mide <b>tendencias de comportamiento</b> que tú mismo describes. Son
    estables, pero no fijas: cambian con el tiempo y con el contexto.</p>
    <div class="aviso">
      <p><b>Lo que este informe no es:</b></p>
      <ul>
        <li>No es un diagnóstico. Nada de lo que leas aquí es una condición clínica.</li>
        <li>No mide inteligencia, ni capacidad, ni si encajas en un puesto.</li>
        <li>No predice lo que vas a hacer.</li>
      </ul>
      <p style="margin-top:.7rem"><b>Contra qué se compara:</b> ${esc(modelo.meta.comparisonNotice)}</p>
    </div>
    <p style="margin-top:1.1rem">No hay puntuaciones buenas ni malas. Son tendencias que ayudan o
    estorban según dónde estés, y una puntuación intermedia suele indicar flexibilidad.</p>
  </section>

  <section class="seccion">
    <p class="eyebrow">Tu perfil en una frase</p>
    <p class="titular">${esc(prosa.titular)}</p>
    <p>${esc(prosa.perfilEnUnaFrase)}</p>
  </section>

  <section class="seccion">
    <p class="eyebrow">Vista general</p>
    <h2>Los cinco dominios</h2>
    <div class="barras">${resumen}</div>
    <div class="escala"><div></div><div class="escala__eje"><span>1</span><span>3 · punto medio</span><span>5</span></div><div class="escala__hueco"></div></div>
  </section>

  <section class="seccion">
    <p class="eyebrow">En detalle</p>
    <h2>Dominio a dominio</h2>
    <p style="color:var(--ink-soft);font-size:.95rem">Cada dominio se compone de tres facetas. Dos
    personas con la misma puntuación general pueden tenerlas repartidas de forma muy distinta, y ahí
    es donde está lo tuyo. Cuando una faceta se separa claramente de las otras dos, va señalada.</p>
    ${dominios}
  </section>

  <section class="seccion">
    <p class="eyebrow">Combinaciones</p>
    <h2>Lo que aparece al cruzarlas</h2>
    <div class="vacio">
      <p>Tu perfil <b>no activa ninguna</b> de las 26 combinaciones descritas en la literatura.</p>
      <p style="margin-bottom:0;color:var(--ink-soft)">No es una carencia: esas combinaciones piden
      varias puntuaciones extremas a la vez, y la mayoría de perfiles no las tienen. Lo que dice de ti
      lo dice el recorrido de arriba.</p>
    </div>
  </section>

  <section class="seccion">
    <p class="eyebrow">Cerca, pero no</p>
    <h2>Señales de atención</h2>
    <p>${esc(prosa.senales)}</p>
    <ul class="senales">${senalesHtml}</ul>
  </section>

  <section class="seccion">
    <p class="eyebrow">Aplicación</p>
    <h2>En el trabajo</h2>
    <p>${esc(prosa.enElTrabajo)}</p>
  </section>

  <section class="seccion">
    <p class="eyebrow">Para llevarte</p>
    <h2>Seis preguntas</h2>
    <ul class="preguntas">${prosa.preguntas.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>
  </section>

  <section class="seccion">
    <p class="eyebrow">Para probar</p>
    <h2>Tres experimentos</h2>
    <div class="exps">
      ${prosa.experimentos
        .map(
          (e) => `<article class="exp">
        <h4>${esc(e.titulo)}</h4>
        <p>${esc(e.texto)}</p>
        <p class="exp__ind"><b>Cómo sabrás si sirve:</b> ${esc(e.indicador)}</p>
      </article>`,
        )
        .join("")}
    </div>
  </section>

  <footer class="pie">
    <h4 style="color:var(--ink);margin-bottom:.5rem">Leyenda</h4>
    <p>Este informe usa nombres en castellano corriente. Sus equivalentes técnicos, por si
    comparas con otra fuente:</p>
    <ul>${leyenda}</ul>
    <h4 style="color:var(--ink);margin-bottom:.5rem">Límites y buen uso</h4>
    <p>Instrumento: <b>BFI-2</b> (Soto &amp; John, 2017), adaptación española de Gallardo-Pujol
    et al. (2022). 60 ítems, escala de 1 a 5, cinco dominios y quince facetas.</p>
    <p>Las facetas son escalas de cuatro ítems: sostienen menos peso que los dominios y conviene
    leerlas con más prudencia. Este informe es una herramienta de autoconocimiento y coaching, no
    una prueba clínica ni de selección. Refleja cómo te describiste el día que lo respondiste.</p>
    <p style="margin-bottom:0"><b>Identify by Impausa</b> · LivePausa</p>
  </footer>

</div>
`;

const salida = process.argv[2] ?? "informe-ejemplo.html";
writeFileSync(new URL("../" + salida, import.meta.url), html, "utf8");
console.log(
  `escrito ${salida}\n` +
    `  ${modelo.domains.length} dominios, ${modelo.fired.length} reglas disparadas, ` +
    `${senales.length} de ${modelo.nearMisses.length} señales mostradas`,
);
