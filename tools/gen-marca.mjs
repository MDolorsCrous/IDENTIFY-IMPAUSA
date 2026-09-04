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

/**
 * Un logotipo listo para meter en cualquier documento.
 *
 * Los dos ficheros vienen en un lienzo de 1024×1024 casi vacío: el dibujo de
 * IMPAUSA ocupa 804×103, o sea el 10 % del alto. Puesto tal cual, a 20 px de
 * alto el logotipo sale de dos píxeles. Aquí se recorta el lienzo vacío —el
 * viewBox— y **no se toca ni un trazo ni un color**: solo se dice qué parte del
 * tablero se mira. Las cajas están medidas con getBBox en el navegador.
 *
 * Van como data URI de SVG y no en base64: el SVG es texto, así que ocupa menos
 * sin codificar, y encima es vectorial — se ve nítido a cualquier tamaño y en el
 * papel. El PNG anterior pesaba 161 KB; estos dos juntos, treinta.
 */
function logoDe(fichero, caja, alt) {
  const [, , ancho, alto] = caja.split(" ").map(Number);
  const svg = readFileSync(RAIZ + "src/assets/" + fichero, "utf8")
    .replace(/<\?xml[^>]*\?>\s*/, "")
    .replace(/viewBox="[^"]*"/, `viewBox="${caja}"`)
    .replace(/\s+/g, " ")
    .trim();
  if (!svg.startsWith("<svg")) throw new Error(fichero + " no parece un SVG");
  return { alt, ancho, alto, src: "data:image/svg+xml," + encodeURIComponent(svg) };
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
    // El verde del propio logotipo, el de «AUSA». Marca la respuesta elegida en
    // el cuestionario: la persona ve su elección en el color de la casa y no en
    // uno inventado para la ocasión. Texto #302A26 encima da 7,57 de contraste.
    verdeLogo: "#A7C6A1",
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

  logo: logoDe("impausa.svg", "128 451 804 103", "IMPAUSA"),
  logoLive: logoDe("livepausa.svg", "94 237 858 474", "LivePausa by ImPausa"),
};

writeFileSync(RAIZ + "src/config/marca.json", JSON.stringify(marca, null, 2) + "\n", "utf8");

const kb = (s) => (s.length / 1024).toFixed(0) + " KB";
console.log("escrito src/config/marca.json");
console.log(`  IMPAUSA ${marca.logo.ancho}×${marca.logo.alto} · ${kb(marca.logo.src)}`);
console.log(`  LivePausa ${marca.logoLive.ancho}×${marca.logoLive.alto} · ${kb(marca.logoLive.src)}`);
console.log(`  tipografías · ${kb(Object.values(marca.tipografias).join(""))}`);
console.log(`  ${Object.keys(marca.dominios).length} colores de dominio · ${Object.keys(marca.paleta).length} de paleta`);
