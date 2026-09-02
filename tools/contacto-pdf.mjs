// Monta una vista de contacto con todas las páginas de un PDF.
//
//   node tools/contacto-pdf.mjs fichero.pdf [salida.html]
//
// El PDF viaja dentro del HTML en base64 y se dibuja con pdf.js, para no
// depender de nada instalado. Sirve para lo que no se puede medir con números:
// ver de un vistazo si una página se ha quedado a medias o si un gráfico se ha
// partido por la mitad.
import { readFileSync, writeFileSync } from "node:fs";

const entrada = process.argv[2];
const salida = process.argv[3] ?? "vista-contacto.html";
const b64 = readFileSync(entrada).toString("base64");

writeFileSync(
  salida,
  `<!doctype html><html lang="es"><meta charset="utf-8"><title>Vista de contacto</title>
<style>
  body{margin:0;background:#5c5c5c;font:13px system-ui;color:#fff}
  h1{font-size:14px;font-weight:600;padding:12px 16px;margin:0;background:#2b2b2b}
  .rejilla{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;padding:16px}
  figure{margin:0}
  canvas{width:100%;height:auto;display:block;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.4)}
  figcaption{padding:5px 2px 0;font-size:11px;color:#ddd}
</style>
<h1>${entrada}</h1>
<div class="rejilla" id="r"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs" type="module"></script>
<script type="module">
  const { getDocument, GlobalWorkerOptions } = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs");
  GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";
  const bin = Uint8Array.from(atob("${b64}"), (c) => c.charCodeAt(0));
  const pdf = await getDocument({ data: bin }).promise;
  const r = document.getElementById("r");
  for (let n = 1; n <= pdf.numPages; n++) {
    const pagina = await pdf.getPage(n);
    const vista = pagina.getViewport({ scale: 1.1 });
    const c = document.createElement("canvas");
    c.width = vista.width; c.height = vista.height;
    await pagina.render({ canvasContext: c.getContext("2d"), viewport: vista }).promise;
    const f = document.createElement("figure");
    f.append(c, Object.assign(document.createElement("figcaption"), { textContent: "página " + n }));
    r.append(f);
  }
</script>
</html>`,
  "utf8",
);
console.log("escrito " + salida);
