// Del catalogo de la skill metaforas-coaching a la configuracion del informe.
//
//   node tools/gen-metaforas.mjs "C:\ruta\metaforas-coaching.skill"
//
// El catalogo son 1200 metaforas en 40 categorias y 150 KB: no tiene sentido
// llevarselo entero a la pagina del test. Aqui se queda con las categorias que
// tocan al BFI-2 y con seis metaforas de cada una.
//
// El mapeo faceta+nivel -> categoria sigue el estilo del mapa-laia.md de la
// propia skill, que ya hace lo mismo con el DISC y los demas instrumentos.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = fileURLToPath(new URL("../", import.meta.url));
const SKILL = process.argv[2];
if (!SKILL) {
  console.error("Uso: node tools/gen-metaforas.mjs <ruta al .skill de metaforas-coaching>");
  process.exit(1);
}

const POR_CATEGORIA = 6;

/**
 * Categorias que la propia skill marca como transversales y delicadas: solo se
 * abren cuando la persona las ha nombrado. Un test de personalidad no lo hace
 * nunca, asi que aqui quedan excluidas del todo.
 */
const EXCLUIDAS = {
  "01": "Recuperación de la Dependencia Química",
  "03": "Imagen Corporal",
  "13": "Perdón",
  "14": "Culpa y Vergüenza",
  "15": "Duelo y Pérdida",
  "19": "Trabajo con el Niño Interior",
  "21": "Soledad",
  "25": "Desafíos de la Parentalidad",
  "33": "Sueño y Descanso",
  "34": "Ansiedad Social",
  "35": "Crecimiento Espiritual",
  "38": "Trauma",
};

/**
 * Faceta y nivel -> categorias del catalogo.
 *
 * Dos criterios al elegir: que la imagen hable del patron y no de un problema,
 * y que no se lea de mas. Poca sociabilidad no es ansiedad social ni soledad;
 * es otra forma de recargar, asi que va a equilibrio y atencion plena.
 */
const MAPA = {
  sociability: { bajo: ["40", "22"], alto: ["07"] },
  assertiveness: { bajo: ["04", "07"], alto: ["20"] },
  energy_level: { bajo: ["05", "23"], alto: ["40"] },
  compassion: { bajo: ["28"], alto: ["30"] },
  respectfulness: { bajo: ["08", "18"], alto: ["04"] },
  trust: { bajo: ["39", "28"], alto: ["39"] },
  organization: { bajo: ["37", "23"], alto: ["26"] },
  productiveness: { bajo: ["23"], alto: ["40"] },
  responsibility: { bajo: ["23"], alto: ["26"] },
  anxiety: { bajo: ["29"], alto: ["02", "36", "22"] },
  depression: { bajo: ["16"], alto: ["16", "30"] },
  emotional_volatility: { bajo: ["11"], alto: ["11", "18"] },
  intellectual_curiosity: { bajo: ["06"], alto: ["31"] },
  aesthetic_sensitivity: { bajo: ["06"], alto: ["22"] },
  creative_imagination: { bajo: ["09", "27"], alto: ["09"] },
};

// ---- Leer el catalogo de dentro del .skill ----
const catalogo = execFileSync(
  "unzip",
  ["-p", SKILL, "metaforas-coaching/references/catalogo.md"],
  { encoding: "utf8", maxBuffer: 1 << 26 },
);

const categorias = {};
let actual = null;
for (const linea of catalogo.split("\n")) {
  const cab = linea.match(/^## Categoría (\d+):\s*(.+?)\s*$/);
  if (cab) {
    actual = { id: cab[1], nombre: cab[2], metaforas: [] };
    categorias[cab[1]] = actual;
    continue;
  }
  if (!actual) continue;
  const m = linea.match(/^-\s+\*\*(.+?)\*\*:\s*(.+?)\s*$/);
  if (m) actual.metaforas.push({ nombre: m[1], texto: m[2] });
}

const total = Object.values(categorias).reduce((a, c) => a + c.metaforas.length, 0);
console.log(`catálogo: ${Object.keys(categorias).length} categorías, ${total} metáforas`);

// ---- Quedarse con las que se usan ----
const usadas = new Set(Object.values(MAPA).flatMap((n) => [...n.bajo, ...n.alto]));
for (const id of usadas) {
  if (!categorias[id]) throw new Error(`el catálogo no tiene la categoría ${id}`);
  if (EXCLUIDAS[id]) throw new Error(`la categoría ${id} está excluida y el mapa la usa`);
  if (categorias[id].metaforas.length < POR_CATEGORIA) {
    throw new Error(`la categoría ${id} solo tiene ${categorias[id].metaforas.length} metáforas`);
  }
}

const seleccion = Object.fromEntries(
  [...usadas].sort().map((id) => [
    id,
    { nombre: categorias[id].nombre, metaforas: categorias[id].metaforas.slice(0, POR_CATEGORIA) },
  ]),
);

const salida = {
  _nota:
    "Metaforas para el informe, tomadas del catalogo de la skill metaforas-coaching. " +
    "Solo las categorias que toca el BFI-2 y seis de cada una: el catalogo entero son " +
    "1200 metaforas y 150 KB. El mapeo sigue el estilo del mapa-laia.md de la skill.",
  _fuente: "skill metaforas-coaching, references/catalogo.md",
  reglas: {
    maximoPorInforme: 3,
    imagenAnclaFinal: true,
    _nota:
      "Regla de la propia skill: 3-5 metaforas en todo el informe, nunca una por " +
      "seccion, y una imagen-ancla al final. Aqui son hasta 3 mas el ancla.",
  },
  excluidas: {
    _nota:
      "Categorias que la skill marca como transversales y delicadas: solo se abren " +
      "cuando la persona las ha nombrado, y un test de personalidad no lo hace nunca.",
    ...EXCLUIDAS,
  },
  mapa: MAPA,
  categorias: seleccion,
};

const destino = path.join(RAIZ, "src/config/interpretation/metaforas.json");
writeFileSync(destino, JSON.stringify(salida, null, 2) + "\n", "utf8");
console.log(
  `escrito src/config/interpretation/metaforas.json: ` +
    `${Object.keys(seleccion).length} categorías · ${Object.keys(seleccion).length * POR_CATEGORIA} metáforas · ` +
    `${Object.keys(EXCLUIDAS).length} categorías excluidas`,
);
