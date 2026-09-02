// Genera src/config/marca.json desde el logotipo y los datos de contacto.
//
//   node tools/gen-marca.mjs
//
// El informe tiene que poder abrirse sin conexion —se manda por correo, se
// guarda, se imprime— asi que el logotipo no puede ser un enlace: viaja dentro
// del propio fichero, en base64. Esto lo prepara una vez y deja el resultado
// como dato, igual que las fuentes o las metaforas.
//
// Si algun dia cambia el logotipo, se reemplaza src/assets/impausa-logo.png y
// se vuelve a lanzar esto.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RAIZ = fileURLToPath(new URL("../", import.meta.url));

const png = readFileSync(RAIZ + "src/assets/impausa-logo.png");
if (png[0] !== 0x89 || png[1] !== 0x50) {
  console.error("\n✖ src/assets/impausa-logo.png no es un PNG.\n");
  process.exit(1);
}
const ancho = png.readUInt32BE(16);
const alto = png.readUInt32BE(20);

const marca = {
  _nota:
    "Los datos de marca del informe. El logotipo va en base64 porque el informe " +
    "tiene que verse sin conexión. Se regenera con: node tools/gen-marca.mjs",
  empresa: "IMPAUSA POWER, S.L.",
  producto: "Identify by Impausa",
  correo: "hola@impausa.com",
  web: "www.impausa.com",
  copyright: "© 2026 IMPAUSA POWER, S.L. Todos los derechos reservados.",
  logo: {
    alt: "IMPAUSA",
    ancho,
    alto,
    src: "data:image/png;base64," + png.toString("base64"),
  },
};

const salida = RAIZ + "src/config/marca.json";
writeFileSync(salida, JSON.stringify(marca, null, 2) + "\n", "utf8");
console.log(`escrito src/config/marca.json`);
console.log(`  logotipo ${ancho}×${alto} · ${(marca.logo.src.length / 1024).toFixed(0)} KB en base64`);
