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
import { writeFileSync } from "node:fs";

import { construirModelo } from "../src/services/pipeline.ts";
import { empaquetarMotor } from "./empaquetar.mjs";
import { cargarRecursos, cargarEjemplo, cargarIdioma, leer } from "./recursos.mjs";

const recursos = cargarRecursos();
const es = cargarIdioma();
const fixture = cargarEjemplo();
const paquete = empaquetarMotor();

// Lo que el motor de Node saca del caso de ejemplo. La pagina tiene que sacar
// exactamente esto con su copia empotrada.
const respuestasEjemplo = Object.fromEntries(
  Object.entries(fixture.responses).map(([k, v]) => [Number(k), v]),
);
const modeloEjemplo = construirModelo(respuestasEjemplo, recursos);

const datos = {
  recursos,
  stem: es.stem,
  scale: es.scale,
  texts: es.questions,
  facetLabels: recursos.labels.facets,
  domainLabels: recursos.labels.domains,
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

const html = `<title>Test Identify</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,700&family=Source+Sans+3:wght@0,400;0,600&display=swap">
<style>
  :root{
    --verde:#1A4A3A; --verde-medio:#2D6B57; --naranja:#E8842A; --naranja-claro:#FDF0E4;
    --ground:#F7F2EB; --tarjeta:#FFFFFF; --ink:#1F2A25; --ink-soft:#5E6B64;
    --borde:#E0D9D0; --track:#E7E0D6; --titulo:#1A4A3A;
    --sombra:0 1px 3px rgba(26,74,58,.07); --sombra-alta:0 6px 24px rgba(26,74,58,.10);
  }
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]){
      --ground:#10201A; --tarjeta:#162C24; --ink:#EDE6DA; --ink-soft:#A9B8B0;
      --borde:#2C4238; --track:#22382F; --titulo:#8FCBB2; --verde-medio:#5FA588;
      --naranja-claro:#2A2119; --sombra:0 1px 3px rgba(0,0,0,.35); --sombra-alta:0 6px 24px rgba(0,0,0,.4);
    }
  }
  :root[data-theme="dark"]{
    --ground:#10201A; --tarjeta:#162C24; --ink:#EDE6DA; --ink-soft:#A9B8B0;
    --borde:#2C4238; --track:#22382F; --titulo:#8FCBB2; --verde-medio:#5FA588;
    --naranja-claro:#2A2119; --sombra:0 1px 3px rgba(0,0,0,.35); --sombra-alta:0 6px 24px rgba(0,0,0,.4);
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--ground);color:var(--ink);
    font-family:"Source Sans 3",system-ui,sans-serif;font-size:17px;line-height:1.65;
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
</style>

<div class="marco" id="app"></div>

<script>
${paquete}
</script>

<script>
const D = ${JSON.stringify(datos)};
const CFG = D.recursos.config;
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

    const modelo = construirModelo(r, D.recursos);
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
  app.innerHTML = \`
    <div class="contenido portada">
      <p class="etiqueta">Modelo OCEAN · Autoconocimiento</p>
      <h1 class="rotulo"><span id="rn">Identify</span><span class="rotulo__by" id="rb">by Impausa</span></h1>
      <p>Un cuestionario que describe tu perfil en cinco grandes rasgos de personalidad y sus quince facetas. Responde con lo primero que te encaje: no hay respuestas correctas.</p>
      <div class="datos">
        <span class="dato">60 preguntas</span>
        <span class="dato">8–10 minutos</span>
        <span class="dato">Sin registro</span>
        <span class="dato">Se calcula en tu navegador</span>
      </div>
      <button class="boton" id="empezar">Empezar cuestionario</button>
      \${FALLOS.length ? '<div class="fallo">Aviso: la autocomprobación del cálculo no coincide en: ' + FALLOS.join(", ") + '. No uses estos resultados.</div>' : ""}
    </div>\`;
  document.getElementById("empezar").onclick = () => { pantalla = "test"; pintar(); };
  ajustarRotulo();
}

function pregunta(){
  const q = CFG.questions[indice];
  const elegido = respuestas[q.id];
  const hechas = Object.keys(respuestas).length;
  app.innerHTML = \`
    <div class="progreso">
      <div class="progreso__fila"><span>Pregunta \${indice + 1} de 60</span><span>\${Math.round(hechas / 60 * 100)}% completado</span></div>
      <div class="barra"><div class="barra__relleno" style="width:\${hechas / 60 * 100}%"></div></div>
    </div>
    <div class="contenido">
      <div class="pregunta">
        <p class="stem">\${esc(D.stem)}</p>
        <h2 class="enunciado">\${esc(D.texts[q.id])}</h2>
        <div class="opciones" role="radiogroup" aria-label="Escala de respuesta">
          \${[1,2,3,4,5].map(v => \`
            <button class="opcion" role="radio" aria-checked="\${elegido === v}" data-v="\${v}">
              <span class="opcion__num">\${v}</span><span>\${esc(D.scale[v])}</span>
            </button>\`).join("")}
        </div>
        <div class="pie-preg">
          <button class="enlace" id="atras" \${indice === 0 ? "disabled" : ""}>← Anterior</button>
          <span class="ayuda">Puedes responder con las teclas 1 a 5</span>
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
      <div class="eje" role="img" aria-label="\${esc(etiquetas[x.id])}: \${num(v)} sobre 5">
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
      <h3>\${esc(D.domainLabels[d.id])} — \${num(dominios[d.id])}</h3>
      <p class="bloque__sub">Sus tres facetas</p>
      \${filas(CFG.facets.filter(f => f.domain === d.id), D.facetLabels, facetas)}
      \${escalaTest}
    </div>\`).join("");

  app.innerHTML = \`
    <div class="contenido">
      <div class="resultados">
        <div>
          <p class="etiqueta">Cuestionario completado</p>
          <h2 style="font-size:1.7rem">Tus puntuaciones</h2>
        </div>
        <div class="nota">
          <p><b>Esto son solo los números.</b> Cada valor va de 1 a 5 y es la media de las respuestas de esa escala. No hay aquí ninguna interpretación: no hay puntuaciones buenas ni malas.</p>
          <p>La lectura de lo que significan llega en el informe, que se elabora aparte.</p>
        </div>
        <div class="bloque">
          <h3>Los cinco dominios</h3>
          <p class="bloque__sub">Cada uno es la media de sus doce preguntas</p>
          \${filas(CFG.domains, D.domainLabels, dominios)}
          \${escalaTest}
        </div>
        \${porDominio}
        <div class="bloque">
          <h3>Tu informe</h3>
          <p class="bloque__sub">Con estas mismas puntuaciones, ahora interpretadas.</p>
          <label class="campo">Tu nombre <span>(opcional, sale en la portada)</span>
            <input id="persona" type="text" autocomplete="name" placeholder="Marta">
          </label>
          <div class="acciones">
            <button class="boton" id="informe">Informe Identify</button>
            <button class="boton boton--claro" id="ver">Ver el JSON</button>
          </div>
          <textarea id="json" class="json" readonly hidden aria-label="Resultado en JSON"></textarea>
        </div>
        <div class="acciones">
          <button class="boton boton--claro" id="reiniciar">Empezar de nuevo</button>
        </div>
        <p class="ayuda">Nada de esto se ha guardado ni enviado a ningún sitio. Si cierras la página, se pierde.</p>
      </div>
    </div>\`;

  document.getElementById("reiniciar").onclick = () => {
    for (const k in respuestas) delete respuestas[k];
    persona = ""; prosa = {};
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
    e.target.textContent = caja.hidden ? "Ver el JSON" : "Ocultar el JSON";
    if (!caja.hidden) caja.select();
  };
  document.getElementById("informe").onclick = () => {
    persona = (document.getElementById("persona")?.value || "").trim();
    pantalla = "informe"; pintar();
  };
}

function copiarEnBoton(boton, texto, etiqueta){
  const caja = document.getElementById("json");
  navigator.clipboard?.writeText(texto).then(
    () => { boton.textContent = "Copiado"; setTimeout(() => boton.textContent = etiqueta, 1800); },
    () => { if (caja) { caja.value = texto; caja.hidden = false; caja.select(); } boton.textContent = "Cópialo de aquí"; },
  );
}

// ---- El informe ----
function informe(){
  const modelo = construirModelo(respuestas, D.recursos, { persona: persona || undefined });
  const html = renderInforme(modelo, prosa, D.recursos.labels, {
    facetas: D.recursos.facetas,
    metaforas: D.recursos.metaforas,
    fecha: fechaLarga(new Date().toISOString().slice(0, 10)),
  });
  const conProsa = Object.keys(prosa).length > 0;

  app.innerHTML = \`
    <div class="barra-informe">
      <button class="enlace" id="volver">← Volver a las puntuaciones</button>
      <div class="acciones">
        \${conProsa ? "" : '<button class="boton boton--claro" id="encargo">Copiar el encargo</button><button class="enlace" id="encargoLargo" title="Para una conversación que no tenga cargada la skill identify-bfi2-knowledge">sin la skill</button>'}
        <button class="boton boton--claro" id="pegar">\${conProsa ? "Cambiar la redacción" : "Pegar la redacción"}</button>
        <button class="boton" id="imprimir">Imprimir</button>
      </div>
    </div>
    <iframe id="marco" title="Informe Identify"></iframe>\`;

  const marco = document.getElementById("marco");
  marco.srcdoc = html;

  document.getElementById("volver").onclick = () => { pantalla = "resultados"; pintar(); };
  document.getElementById("imprimir").onclick = () => marco.contentWindow?.print();
  // Dos encargos, y manda el corto: la skill identify-bfi2-knowledge ya trae el
  // tono, el metodo y el protocolo de seguridad, asi que repetirlos seria tener
  // las mismas reglas en dos sitios. El largo queda para una conversacion que no
  // la tenga cargada.
  const encargo = document.getElementById("encargo");
  if (encargo) encargo.onclick = e => copiarEnBoton(e.target, promptCorto(modelo, D.recursos.facetas), "Copiar el encargo");
  const encargoLargo = document.getElementById("encargoLargo");
  if (encargoLargo) encargoLargo.onclick = e => copiarEnBoton(e.target, promptCompleto(modelo, D.recursos.facetas), "sin la skill");

  document.getElementById("pegar").onclick = () => {
    const pegado = window.prompt(
      "Pega aquí el JSON que te haya devuelto Claude con la redacción.\\n\\n" +
      "Se comprueba antes de meterlo: si le falta alguna sección, te lo digo y no toco el informe.",
      "",
    );
    if (pegado === null) return;
    let candidata;
    try { candidata = JSON.parse(pegado); }
    catch { window.alert("Eso no es un JSON válido. Cópialo entero, desde la primera llave hasta la última."); return; }
    const fallos = validarProsa(candidata, modelo);
    if (fallos.length) { window.alert("La redacción no encaja con el esquema:\\n\\n· " + fallos.join("\\n· ")); return; }
    prosa = candidata;
    pintar();
  };
}

function fechaLarga(iso){
  const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const [a, m, d] = iso.split("-").map(Number);
  return Number.isFinite(d) ? d + " de " + meses[m - 1] + " de " + a : iso;
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
writeFileSync(new URL("../" + salida, import.meta.url), html, "utf8");
console.log(
  `escrito ${salida}
` +
    `  ${recursos.config.questions.length} ítems · ${recursos.config.facets.length} facetas · ` +
    `${Object.keys(recursos.metaforas.categorias).length} categorías de metáforas
` +
    `  motor empotrado: ${(paquete.length / 1024).toFixed(0)} KB · página: ${(html.length / 1024).toFixed(0)} KB`,
);
