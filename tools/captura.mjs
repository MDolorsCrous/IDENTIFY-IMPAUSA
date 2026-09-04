// Fotografía una pantalla de la aplicación, en el ancho que se le pida.
//
//   node tools/captura.mjs <url> <salida.png> [ancho] [alto] [--guion "js"]
//
// Chrome sin cabeza sabe hacer capturas pero no sabe pulsar, y meter la página
// en un iframe para pulsarla desde fuera falsea el ancho: dentro de un marco de
// 390 px el documento se maqueta a 500 y la foto sale recortada. Así que se
// conduce el navegador de verdad, por su protocolo de depuración.
//
// Sin dependencias: Node 24 ya trae WebSocket.
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { buscarChrome } from "./a-pdf.mjs";

const PUERTO = 9333;

/** Espera a que algo deje de fallar, o se rinde. */
async function esperar(intento, veces = 60, pausa = 200) {
  for (let i = 0; i < veces; i++) {
    try {
      return await intento();
    } catch {
      await new Promise((r) => setTimeout(r, pausa));
    }
  }
  throw new Error("el navegador no ha contestado a tiempo");
}

/** Un hilo con Chrome por su protocolo de depuración. */
function conectar(url) {
  const ws = new WebSocket(url);
  const pendientes = new Map();
  let n = 0;
  const listo = new Promise((ok, mal) => {
    ws.addEventListener("open", () => ok(), { once: true });
    ws.addEventListener("error", () => mal(new Error("no se ha podido conectar")), { once: true });
  });
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    const p = pendientes.get(m.id);
    if (!p) return;
    pendientes.delete(m.id);
    m.error ? p.mal(new Error(m.error.message)) : p.ok(m.result);
  });
  return {
    listo,
    cerrar: () => ws.close(),
    manda(metodo, params = {}) {
      const id = ++n;
      return new Promise((ok, mal) => {
        pendientes.set(id, { ok, mal });
        ws.send(JSON.stringify({ id, method: metodo, params }));
      });
    },
  };
}

export async function capturar(url, salida, { ancho = 1280, alto = 900, guion = "", espera = 700 } = {}) {
  const perfil = mkdtempSync(path.join(tmpdir(), "identify-captura-"));
  const chrome = spawn(
    buscarChrome(),
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--hide-scrollbars",
      "--remote-debugging-port=" + PUERTO,
      "--user-data-dir=" + perfil,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    const lista = await esperar(async () => {
      const r = await fetch(`http://127.0.0.1:${PUERTO}/json/list`);
      const j = await r.json();
      const pagina = j.find((t) => t.type === "page");
      if (!pagina) throw new Error("sin pestaña");
      return pagina;
    });

    const cdp = conectar(lista.webSocketDebuggerUrl);
    await cdp.listo;
    await cdp.manda("Page.enable");
    await cdp.manda("Emulation.setDeviceMetricsOverride", {
      width: ancho,
      height: alto,
      deviceScaleFactor: 1,
      mobile: ancho < 768,
    });
    await cdp.manda("Page.navigate", { url });
    // Sin dependencias no hay `waitForLoad` fino: se da tiempo, y despues el
    // guion que deja la aplicacion en la pantalla que se quiere.
    await new Promise((r) => setTimeout(r, espera));
    if (guion) {
      const r = await cdp.manda("Runtime.evaluate", { expression: guion, awaitPromise: true });
      if (r.exceptionDetails) throw new Error("el guion ha fallado: " + r.exceptionDetails.text);
      await new Promise((r) => setTimeout(r, 400));
    }
    const foto = await cdp.manda("Page.captureScreenshot", { format: "png" });
    writeFileSync(salida, Buffer.from(foto.data, "base64"));
    cdp.cerrar();
    return salida;
  } finally {
    chrome.kill();
    try {
      rmSync(perfil, { recursive: true, force: true });
    } catch {}
  }
}

if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  const [url, salida, ancho, alto] = process.argv.slice(2);
  const i = process.argv.indexOf("--guion");
  await capturar(url, salida, {
    ancho: Number(ancho) || 1280,
    alto: Number(alto) || 900,
    guion: i > -1 ? process.argv[i + 1] : "",
  });
  console.log("escrito " + salida);
}
