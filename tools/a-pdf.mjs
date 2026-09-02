// Convierte un informe HTML en PDF con el Chrome que ya está instalado.
//
//   node tools/a-pdf.mjs informe.html [salida.pdf]
//
// Se hace así, y no imprimiendo a mano, por dos razones. Una: el PDF sale
// reproducible, y se puede medir página a página en vez de mirarlo a ojo. Dos:
// Chrome escribe **texto de verdad** con las tipografías incrustadas. El PDF que
// llegó de vuelta eran 19 fotos JPEG, sin una sola letra seleccionable: eso pasa
// cuando en el diálogo de impresión se elige «Microsoft Print to PDF» en lugar
// de «Guardar como PDF». Aquí no hay donde equivocarse.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const CHROMES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];

export function buscarChrome() {
  const encontrado = CHROMES.find((c) => existsSync(c));
  if (!encontrado) throw new Error("No encuentro Chrome ni Edge para generar el PDF.");
  return encontrado;
}

export function aPdf(entrada, salida) {
  const chrome = buscarChrome();
  const perfil = mkdtempSync(path.join(tmpdir(), "identify-pdf-"));
  const url = "file:///" + path.resolve(entrada).replace(/\\/g, "/");
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-pdf-header-footer",
    "--user-data-dir=" + perfil,
    "--print-to-pdf=" + path.resolve(salida),
    "--virtual-time-budget=10000",
    url,
  ];
  return new Promise((ok, mal) => {
    const p = spawn(chrome, args, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (c) => (c === 0 ? ok(salida) : mal(new Error("Chrome salió con " + c + "\n" + err))));
  });
}

if (import.meta.url === "file:///" + process.argv[1].replace(/\\/g, "/")) {
  const entrada = process.argv[2];
  const salida = process.argv[3] ?? entrada.replace(/\.html$/, ".pdf");
  await aPdf(entrada, salida);
  console.log("escrito " + salida);
}
