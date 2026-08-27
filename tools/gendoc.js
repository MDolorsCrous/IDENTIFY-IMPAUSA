// Genera docs/01-especificacion-test.md a partir del Excel oficial.
// Los textos de los items se copian del fichero, no se transcriben a mano.
const { execSync } = require("child_process");
const fs = require("fs");
const XLSX = process.argv[2];
const SALIDA = process.argv[3];
const dump = execSync(`node "${__dirname}/xlsx.js" "${XLSX}"`, { maxBuffer: 1 << 28 }).toString();

const resp = {}, rec = {}, texto = {};
for (const line of dump.split("\n")) {
  const m = line.match(/^(\d+)\s*\.?\s*(.*?)\s*\|\s*(\d)\s*\|\s*(\d)/);
  if (m) { const n = +m[1]; texto[n] = m[2].trim(); resp[n] = +m[3]; rec[n] = +m[4]; }
}

const FACETAS = {
  "Sociabilidad": [1, 16, 31, 46], "Asertividad": [6, 21, 36, 51], "Nivel de Energía": [11, 26, 41, 56],
  "Compasión": [2, 17, 32, 47], "Respeto": [7, 22, 37, 52], "Confianza": [12, 27, 42, 57],
  "Organización": [3, 18, 33, 48], "Productividad": [8, 23, 38, 53], "Responsabilidad": [13, 28, 43, 58],
  "Ansiedad": [4, 19, 34, 49], "Depresión": [9, 24, 39, 54], "Volatilidad Emocional": [14, 29, 44, 59],
  "Curiosidad Intelectual": [10, 25, 40, 55], "Sensibilidad Estética": [5, 20, 35, 50], "Imaginación Creativa": [15, 30, 45, 60],
};
const DOMINIOS = {
  "Extraversión": ["Sociabilidad", "Asertividad", "Nivel de Energía"],
  "Cordialidad": ["Compasión", "Respeto", "Confianza"],
  "Responsabilidad": ["Organización", "Productividad", "Responsabilidad"],
  "Emocionalidad negativa": ["Ansiedad", "Depresión", "Volatilidad Emocional"],
  "Apertura de mente": ["Curiosidad Intelectual", "Sensibilidad Estética", "Imaginación Creativa"],
};
const facetaDe = {}, dominioDe = {};
for (const [f, items] of Object.entries(FACETAS)) for (const i of items) facetaDe[i] = f;
for (const [d, fs_] of Object.entries(DOMINIOS)) for (const f of fs_) for (const i of FACETAS[f]) dominioDe[i] = d;

// Polaridad segun la clave de correccion de la pagina 3 del PDF oficial
const INVERSOS_PDF = new Set([
  16, 31, 36, 51, 11, 26, 17, 47, 22, 37, 12, 42, 3, 48, 8, 23,
  28, 58, 4, 49, 9, 24, 29, 44, 25, 55, 5, 50, 30, 45,
]);
const polaridad = (n) => (INVERSOS_PDF.has(n) ? "**inverso**" : "directo");
const inversos = [...INVERSOS_PDF].sort((a, b) => a - b);

// El Excel tiene que estar de acuerdo con el PDF en los 57 items deducibles
for (let n = 1; n <= 60; n++) {
  if (resp[n] === 3) continue;
  if ((rec[n] === 6 - resp[n]) !== INVERSOS_PDF.has(n)) throw new Error("discrepancia en el item " + n);
}

const L = [];
L.push("# 01 — Especificación del test Identify (BFI-2)");
L.push("");
L.push("> **Fuente de verdad:** `BFI-2_formules_correctes_inversos.xlsx`");
L.push("> (`Documents\\00 FITXERS PC ANTIC 2026 AGOST - RAMO\\10_IMPAUSA\\coaching_eines\\`).");
L.push("> Los textos de los ítems de esta tabla están copiados del fichero, no transcritos a mano.");
L.push("");
L.push("## Constructo");
L.push("");
L.push("**BFI-2** (Big Five Inventory–2, Soto & John 2017), versión en español. Mide los cinco");
L.push("grandes dominios de personalidad y sus 15 facetas, 3 por dominio.");
L.push("");
L.push("- **Qué mide:** tendencias de comportamiento autoinformadas, estables en el tiempo.");
L.push("- **Qué NO mide:** capacidad intelectual, salud mental, idoneidad para un puesto,");
L.push("  ni predice rendimiento. No es una prueba clínica ni de selección.");
L.push("- **Uso previsto:** coaching y autoconocimiento.");
L.push("- Más información y material oficial: https://osf.io/kp572/files/osfstorage");
L.push("");
L.push("## Escala de respuesta");
L.push("");
L.push("Cinco puntos, sin modificar:");
L.push("");
L.push("| Valor | Etiqueta |");
L.push("| --- | --- |");
["Muy en desacuerdo", "Algo en desacuerdo", "Neutral, sin opinión", "Algo de acuerdo", "Muy de acuerdo"].forEach((e, i) => L.push(`| ${i + 1} | ${e} |`));
L.push("");
L.push("Enunciado común a todos los ítems: **«Soy alguien que…»**");
L.push("");
L.push("## Puntuación");
L.push("");
L.push("1. **Ítems inversos:** `puntuación = 6 − respuesta`. No se usa ninguna otra fórmula.");
L.push("2. **Faceta:** media aritmética de sus 4 ítems ya recodificados.");
L.push("3. **Dominio:** media aritmética de sus 12 ítems ya recodificados");
L.push("   (equivale a la media de sus 3 facetas, porque todas pesan igual).");
L.push("");
L.push("Rango de cualquier faceta o dominio: **1,00 – 5,00**.");
L.push("");
L.push("> Verificado: aplicando estas reglas al juego de respuestas de ejemplo del Excel se");
L.push("> reproducen exactamente los 15 valores de faceta y los 5 de dominio que el propio");
L.push("> fichero ya tenía calculados. La asignación ítem → faceta → dominio no es una");
L.push("> suposición: la confirma el fichero.");
L.push("");
L.push("## Estructura");
L.push("");
L.push("| Dominio | Faceta | Ítems |");
L.push("| --- | --- | --- |");
for (const [d, fs_] of Object.entries(DOMINIOS)) {
  fs_.forEach((f, i) => L.push(`| ${i === 0 ? "**" + d + "**" : ""} | ${f} | ${FACETAS[f].join(", ")} |`));
}
L.push("");
L.push(`## Ítems inversos (${inversos.length} de 60)`);
L.push("");
L.push(inversos.join(", "));
L.push("");
L.push("Fuente: la **clave de corrección oficial**, página 3 del PDF, sección «Escalas de las");
L.push("facetas del BFI-2», donde los inversos van marcados con una R.");
L.push("");
L.push("> **Doblemente verificado.** El Excel permite deducir la polaridad de 57 ítems");
L.push("> comparando cada respuesta de ejemplo con su valor recodificado (los otros 3 tienen");
L.push("> respuesta 3, y como `6 − 3 = 3` no se puede saber). En esos 57 el Excel y la clave del");
L.push("> PDF coinciden **sin una sola discrepancia**, y la clave completa está copiada en");
L.push("> `tests/clave-oficial.test.ts`: si alguien toca la configuración y se desvía, la prueba");
L.push("> se pone roja.");
L.push("");
L.push("## Los 60 ítems");
L.push("");
L.push("| # | Texto | Dominio | Faceta | Polaridad |");
L.push("| --- | --- | --- | --- | --- |");
for (let n = 1; n <= 60; n++) {
  L.push(`| ${n} | ${texto[n]} | ${dominioDe[n]} | ${facetaDe[n]} | ${polaridad(n)} |`);
}
L.push("");
L.push("> Los textos conservan las erratas del Excel (`afirnaciones`, `Metóidico/a`,");
L.push("> `IServicial`, tildes sueltas). Antes de publicar el test hay que corregirlos contra");
L.push("> el PDF oficial: son los textos que va a leer la persona.");
L.push("");
L.push("## Baremos");
L.push("");
L.push("**No hay.** El instrumento devuelve medias de 1 a 5, no percentiles. Convertir esas");
L.push("medias en bandas («alto», «bajo») exige una muestra de referencia que hoy no existe.");
L.push("");
L.push("Ver [`02-modelo-interpretacion.md`](02-modelo-interpretacion.md), donde se decide qué");
L.push("hacer al respecto. Lo que no se puede hacer es presentar percentiles inventados como");
L.push("si vinieran de una muestra.");
L.push("");
fs.writeFileSync(SALIDA, L.join("\n"), "utf8");
console.log("escrito " + SALIDA + " (" + L.length + " lineas)");
