// Audita un PDF sin instalar nada: cuántas páginas, cuánto ocupa cada una y si
// el texto es texto de verdad.
//
//   node tools/auditar-pdf.mjs fichero.pdf
//
// Existe porque «esta página queda medio vacía» no se puede arreglar a ojo sobre
// una miniatura. Lee los flujos de contenido de cada página, los descomprime,
// deshace las transformaciones y mira hasta dónde baja lo que se dibuja. Con eso
// sale la ocupación vertical real, que es lo que hay que corregir.
//
// También dice si la página lleva letras o solo una foto: el PDF que llegó de
// vuelta eran 19 imágenes JPEG sin una sola letra, y eso no se ve mirándolo.
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const PT_POR_MM = 72 / 25.4;

/** Multiplica dos matrices de PDF: primero m, luego n. */
const por = (m, n) => [
  m[0] * n[0] + m[1] * n[2],
  m[0] * n[1] + m[1] * n[3],
  m[2] * n[0] + m[3] * n[2],
  m[2] * n[1] + m[3] * n[3],
  m[4] * n[0] + m[5] * n[2] + n[4],
  m[4] * n[1] + m[5] * n[3] + n[5],
];
/** Lleva un punto a coordenadas de página. */
const punto = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

/**
 * Hasta dónde baja el contenido de una página, en puntos desde el pie.
 *
 * Chrome dibuja con el eje vertical del revés y con transformaciones anidadas,
 * así que las coordenadas del flujo no sirven tal cual: hay que llevar la pila
 * de matrices. Sin eso todas las páginas salían al 0 %.
 */
function fondoDelContenido(flujo, ancho, alto, zonaDelPie) {
  let ctm = [1, 0, 0, 1, 0, 0];
  const pila = [];
  const ys = [];
  const anota = (y) => ys.push(y);

  // Un solo recorrido por los operadores que colocan algo en la página.
  const ops = /(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(cm|Tm)|(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+re|\bq\b|\bQ\b/g;
  for (const m of flujo.matchAll(ops)) {
    if (m[0] === "q") {
      pila.push(ctm);
    } else if (m[0] === "Q") {
      ctm = pila.pop() ?? ctm;
    } else if (m[7] === "cm") {
      ctm = por(m.slice(1, 7).map(Number), ctm);
    } else if (m[7] === "Tm") {
      // La matriz de texto no toca la CTM: solo coloca esta línea.
      const t = por(m.slice(1, 7).map(Number), ctm);
      anota(t[5]);
    } else if (m[9] !== undefined) {
      const [x, y, an, al] = [Number(m[8]), Number(m[9]), Number(m[10]), Number(m[11])];
      const esquinas = [punto(ctm, x, y), punto(ctm, x + an, y + al)];
      const py = esquinas.map((p) => p[1]);
      const xs = esquinas.map((p) => p[0]);
      // El rectángulo que cubre la página entera es el fondo. Si contara, todas
      // las páginas saldrían llenas.
      const cubreTodo =
        Math.abs(Math.max(...xs) - Math.min(...xs)) > ancho * 0.97 &&
        Math.abs(Math.max(...py) - Math.min(...py)) > alto * 0.97;
      if (!cubreTodo) anota(Math.min(...esquinas.map((p) => p[1])));
    }
  }
  if (!ys.length) return Infinity;

  // El pie repetido se dibuja abajo del todo en TODAS las páginas: si contara,
  // cualquier página saldría llena y la medida no diría nada. Se descarta la
  // franja del pie y lo que queda más bajo es donde acaba el cuerpo de verdad.
  const PIE = zonaDelPie;
  const cuerpo = ys.filter((y) => y > PIE);
  return cuerpo.length ? Math.min(...cuerpo) : Math.min(...ys);
}

export function auditar(ruta, margenes = { arriba: 16, abajo: 15 }) {
  const buf = readFileSync(ruta);
  const crudo = buf.toString("latin1");

  const objetos = new Map();
  for (const m of crudo.matchAll(/(\d+)\s+(\d+)\s+obj\b/g)) {
    const ini = m.index + m[0].length;
    objetos.set(Number(m[1]), { cab: crudo.slice(ini, crudo.indexOf("endobj", ini)), ini });
  }

  const flujo = (o) => {
    const i = crudo.indexOf("stream", o.ini);
    if (i < 0) return null;
    let a = i + 6;
    if (crudo[a] === "\r") a++;
    if (crudo[a] === "\n") a++;
    const datos = buf.subarray(a, crudo.indexOf("endstream", a));
    if (!/\/FlateDecode/.test(o.cab)) return datos;
    try {
      return inflateSync(datos);
    } catch {
      return null;
    }
  };

  const numeros = (s) => (s.match(/-?\d+\.?\d*/g) ?? []).map(Number);
  const paginas = [...objetos].filter(([, o]) => /\/Type\s*\/Page\b/.test(o.cab)).sort((a, b) => a[0] - b[0]);

  const filas = [];
  for (const [i, [, o]] of paginas.entries()) {
    let caja = o.cab.match(/\/MediaBox\s*\[([^\]]+)\]/);
    if (!caja) {
      const padre = o.cab.match(/\/Parent\s+(\d+)/);
      caja = padre && objetos.get(Number(padre[1]))?.cab.match(/\/MediaBox\s*\[([^\]]+)\]/);
    }
    const [, , ancho, alto] = caja ? numeros(caja[1]) : [0, 0, 595, 842];

    const cont = o.cab.match(/\/Contents\s+(?:(\d+)\s+\d+\s+R|\[([^\]]+)\])/);
    const refs = cont
      ? cont[1]
        ? [Number(cont[1])]
        : [...cont[2].matchAll(/(\d+)\s+\d+\s+R/g)].map((m) => Number(m[1]))
      : [];
    let texto = "";
    for (const r of refs) {
      const d = objetos.get(r) && flujo(objetos.get(r));
      if (d) texto += d.toString("latin1");
    }

    const arriba = alto - margenes.arriba * PT_POR_MM;
    const abajo = margenes.abajo * PT_POR_MM;
    const minY = fondoDelContenido(texto, ancho, alto, abajo + 13 * PT_POR_MM);
    const pct = Number.isFinite(minY) ? Math.round(((arriba - minY) / (arriba - abajo)) * 100) : 0;

    filas.push({
      pagina: i + 1,
      ocupacion: Math.max(0, Math.min(pct, 100)),
      conTexto: /\bTj\b|\bTJ\b/.test(texto),
    });
  }
  return { filas, bytes: buf.length };
}

if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  const ruta = process.argv[2];
  const { filas, bytes } = auditar(ruta);
  const barra = (p) => "█".repeat(Math.round(p / 5)).padEnd(20, "·");
  console.log(`${ruta}\npáginas: ${filas.length}`);
  for (const f of filas) {
    const aviso = f.ocupacion < 50 ? "  ← menos del 50 %" : "";
    console.log(
      `  p${String(f.pagina).padStart(2)}  ${barra(f.ocupacion)} ${String(f.ocupacion).padStart(3)}%` +
        `  texto:${f.conTexto ? "sí" : "NO"}${aviso}`,
    );
  }
  const flojas = filas.filter((f) => f.ocupacion < 50);
  const media = Math.round(filas.reduce((s, f) => s + f.ocupacion, 0) / filas.length);
  console.log(`\nocupación media: ${media} %`);
  console.log(`páginas por debajo del 50 %: ${flojas.length}${flojas.length ? " → " + flojas.map((f) => f.pagina).join(", ") : ""}`);
  console.log(`páginas con texto real: ${filas.filter((f) => f.conTexto).length}/${filas.length}`);
  console.log(`tamaño: ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}
