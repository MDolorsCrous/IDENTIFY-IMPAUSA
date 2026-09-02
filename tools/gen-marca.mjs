// Genera src/config/marca.json: logotipo, contacto, paleta y tipografías.
//
//   node tools/gen-marca.mjs
//
// El informe tiene que poder abrirse y imprimirse sin conexión —se manda por
// correo, se guarda, se convierte en PDF— así que ni el logotipo ni las fuentes
// pueden ser enlaces: viajan dentro del propio fichero. Esto lo prepara una vez
// y deja el resultado como dato, igual que las fuentes académicas o las
// metáforas.
//
// Si cambia el logotipo se reemplaza src/assets/impausa-logo.png y se relanza.
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("../", import.meta.url));

// Las tipografías de la casa viven en la skill del brand book, que es donde se
// mantienen. Aquí solo se copian: si allí se actualizan, se vuelve a lanzar esto.
const FUENTES = path.join(homedir(), ".claude", "skills", "impausa-brand-book", "assets", "fonts");
const leerFuente = (nombre) => readFileSync(path.join(FUENTES, nombre + ".b64.txt"), "utf8").trim();

const png = readFileSync(RAIZ + "src/assets/impausa-logo.png");
if (png[0] !== 0x89 || png[1] !== 0x50) {
  console.error("\n✖ src/assets/impausa-logo.png no es un PNG.\n");
  process.exit(1);
}

const marca = {
  _nota:
    "Datos de marca del informe: logotipo, contacto, paleta y tipografías, todo " +
    "incrustado para que el documento se vea igual sin conexión. Se regenera con: " +
    "node tools/gen-marca.mjs",
  empresa: "IMPAUSA POWER, S.L.",
  producto: "Identify by Impausa",
  correo: "hola@impausa.com",
  web: "www.impausa.com",
  copyright: "© 2026 IMPAUSA POWER, S.L. Todos los derechos reservados.",

  // La paleta de Connect, para que los dos informes de la casa se reconozcan
  // como de la misma familia.
  paleta: {
    marfil: "#F7F4EE",
    verde: "#27624F",
    verdeSuave: "#5F927D",
    menta: "#E8F0EC",
    dorado: "#D8B34D",
    naranja: "#F29A4A",
    antracita: "#292927",
    grisCalido: "#6F6B65",
    linea: "#DDD8CE",
    blanco: "#FFFDFC",
  },

  // Un color por dominio, estable en todo el informe: gráfico general, barras de
  // facetas, títulos y etiquetas. Vive aquí y no en domains.json porque aquello
  // define el instrumento —qué ítems y qué facetas— y lo usa el motor de
  // puntuación: mezclarle presentación lo haría menos claro.
  dominios: {
    extraversion: "#F29A4A",
    agreeableness: "#5FA8A0",
    conscientiousness: "#27624F",
    negative_emotionality: "#4A73A0",
    open_mindedness: "#D8B34D",
  },

  tipografias: {
    _nota: "WOFF2 en base64, de la skill impausa-brand-book. Títulos y etiquetas en " +
      "Montserrat, cuerpo en Lato. El rótulo «Identify by Impausa» conserva Playfair, " +
      "que es lo que manda la skill retol-test-impausa.",
    montserrat: leerFuente("montserrat-var"),
    lato400: leerFuente("lato-400"),
    lato700: leerFuente("lato-700"),
  },

  logo: {
    alt: "IMPAUSA",
    ancho: png.readUInt32BE(16),
    alto: png.readUInt32BE(20),
    src: "data:image/png;base64," + png.toString("base64"),
  },
};

writeFileSync(RAIZ + "src/config/marca.json", JSON.stringify(marca, null, 2) + "\n", "utf8");

const kb = (s) => (s.length / 1024).toFixed(0) + " KB";
console.log("escrito src/config/marca.json");
console.log(`  logotipo ${marca.logo.ancho}×${marca.logo.alto} · ${kb(marca.logo.src)}`);
console.log(`  tipografías · ${kb(Object.values(marca.tipografias).join(""))}`);
console.log(`  ${Object.keys(marca.dominios).length} colores de dominio · ${Object.keys(marca.paleta).length} de paleta`);
