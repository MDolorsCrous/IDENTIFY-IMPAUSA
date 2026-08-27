// Genera los ficheros de configuracion del BFI-2 a partir del Excel oficial.
// Nada se transcribe a mano: los textos y la polaridad salen del fichero.
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const XLSX = process.argv[2];
const DEST = process.argv[3];
const dump = execSync(`node "${__dirname}/xlsx.js" "${XLSX}"`, { maxBuffer: 1 << 28 }).toString();

const resp = {}, rec = {}, texto = {};
for (const line of dump.split("\n")) {
  const m = line.match(/^(\d+)\s*\.?\s*(.*?)\s*\|\s*(\d)\s*\|\s*(\d)/);
  if (m) { const n = +m[1]; texto[n] = m[2].trim(); resp[n] = +m[3]; rec[n] = +m[4]; }
}
if (Object.keys(texto).length !== 60) throw new Error("esperaba 60 items, encontrados " + Object.keys(texto).length);

const DOMINIOS = [
  { id: "extraversion", es: "Extraversión", facetas: [
    { id: "sociability", es: "Sociabilidad", items: [1, 16, 31, 46] },
    { id: "assertiveness", es: "Asertividad", items: [6, 21, 36, 51] },
    { id: "energy_level", es: "Nivel de Energía", items: [11, 26, 41, 56] }] },
  { id: "agreeableness", es: "Cordialidad", facetas: [
    { id: "compassion", es: "Compasión", items: [2, 17, 32, 47] },
    { id: "respectfulness", es: "Respeto", items: [7, 22, 37, 52] },
    { id: "trust", es: "Confianza", items: [12, 27, 42, 57] }] },
  { id: "conscientiousness", es: "Responsabilidad", facetas: [
    { id: "organization", es: "Organización", items: [3, 18, 33, 48] },
    { id: "productiveness", es: "Productividad", items: [8, 23, 38, 53] },
    { id: "responsibility", es: "Responsabilidad", items: [13, 28, 43, 58] }] },
  { id: "negative_emotionality", es: "Emocionalidad negativa", facetas: [
    { id: "anxiety", es: "Ansiedad", items: [4, 19, 34, 49] },
    { id: "depression", es: "Depresión", items: [9, 24, 39, 54] },
    { id: "emotional_volatility", es: "Volatilidad Emocional", items: [14, 29, 44, 59] }] },
  { id: "open_mindedness", es: "Apertura de mente", facetas: [
    { id: "intellectual_curiosity", es: "Curiosidad Intelectual", items: [10, 25, 40, 55] },
    { id: "aesthetic_sensitivity", es: "Sensibilidad Estética", items: [5, 20, 35, 50] },
    { id: "creative_imagination", es: "Imaginación Creativa", items: [15, 30, 45, 60] }] },
];

// Polaridad. Fuente autoritativa: la clave de correccion de la pagina 3 del PDF
// oficial ("Escalas de las facetas del BFI-2"), donde los inversos van marcados con R.
const INVERSOS_PDF = new Set([
  16, 31, 36, 51, 11, 26,          // Extraversion
  17, 47, 22, 37, 12, 42,          // Cordialidad
  3, 48, 8, 23, 28, 58,            // Responsabilidad
  4, 49, 9, 24, 29, 44,            // Emocionalidad negativa
  25, 55, 5, 50, 30, 45,           // Apertura de mente
]);
if (INVERSOS_PDF.size !== 30) throw new Error("la clave del PDF tiene " + INVERSOS_PDF.size + " inversos, esperaba 30");

const esInverso = (n) => INVERSOS_PDF.has(n);

// Contraste con el Excel: para los 57 items cuya respuesta de ejemplo no es 3, la
// polaridad se puede deducir del propio fichero. Las dos fuentes tienen que coincidir.
const discrepancias = [];
for (let n = 1; n <= 60; n++) {
  if (resp[n] === 3) continue;
  const segunExcel = rec[n] === 6 - resp[n];
  if (segunExcel !== esInverso(n)) discrepancias.push(n);
}
if (discrepancias.length > 0) {
  throw new Error("el Excel y la clave del PDF no coinciden en los items " + discrepancias.join(", "));
}
console.log(`polaridad: clave oficial del PDF, contrastada con el Excel en 57 items sin discrepancias\n`);

const facetaDe = {}, dominioDe = {};
for (const d of DOMINIOS) for (const f of d.facetas) for (const i of f.items) { facetaDe[i] = f.id; dominioDe[i] = d.id; }

// --- questions.json: estructura, sin texto (el texto vive en i18n) ---
const questions = [];
for (let n = 1; n <= 60; n++) {
  questions.push({ id: n, domain: dominioDe[n], facet: facetaDe[n], reverse: esInverso(n) });
}

// --- domains.json y facets.json ---
const domains = DOMINIOS.map((d) => ({ id: d.id, facets: d.facetas.map((f) => f.id),
  items: d.facetas.flatMap((f) => f.items).sort((a, b) => a - b) }));
const facets = DOMINIOS.flatMap((d) => d.facetas.map((f) => ({ id: f.id, domain: d.id, items: f.items })));

// --- reverseItems.json ---
const reverseItems = questions.filter((q) => q.reverse).map((q) => q.id);

// --- formulas.json ---
const formulas = {
  scale: { min: 1, max: 5, points: [1, 2, 3, 4, 5] },
  reverse: { formula: "6 - response", constant: 6 },
  facet: { method: "mean", of: "recoded items" },
  domain: { method: "mean", of: "recoded items" },
  range: { min: 1, max: 5 },
};

// --- i18n/es.json ---
const es = {
  scale: { 1: "Muy en desacuerdo", 2: "Algo en desacuerdo", 3: "Neutral, sin opinión",
    4: "Algo de acuerdo", 5: "Muy de acuerdo" },
  stem: "Soy alguien que…",
  domains: Object.fromEntries(DOMINIOS.map((d) => [d.id, d.es])),
  facets: Object.fromEntries(DOMINIOS.flatMap((d) => d.facetas.map((f) => [f.id, f.es]))),
  questions: Object.fromEntries(Array.from({ length: 60 }, (_, i) => [i + 1, texto[i + 1]])),
};

// --- fixture: el caso de ejemplo del propio Excel, para las pruebas ---
const fixture = {
  origen: "Juego de respuestas de ejemplo del propio BFI-2_formules_correctes_inversos.xlsx",
  responses: Object.fromEntries(Array.from({ length: 60 }, (_, i) => [i + 1, resp[i + 1]])),
  recodedEsperado: Object.fromEntries(Array.from({ length: 60 }, (_, i) => [i + 1, rec[i + 1]])),
  facetsEsperado: { sociability: 2.75, assertiveness: 3, energy_level: 3.75,
    compassion: 3.25, respectfulness: 2.5, trust: 2.25,
    organization: 1.75, productiveness: 3.75, responsibility: 2.5,
    anxiety: 4.5, depression: 3, emotional_volatility: 3,
    intellectual_curiosity: 4, aesthetic_sensitivity: 3.5, creative_imagination: 2.25 },
  domainsEsperado: { extraversion: 3.1666666666666665, agreeableness: 2.6666666666666665,
    conscientiousness: 2.6666666666666665, negative_emotionality: 3.5, open_mindedness: 3.25 },
};

const write = (rel, obj) => {
  const p = path.join(DEST, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
  console.log("  " + rel);
};
console.log("escritos:");
write("src/config/questions.json", questions);
write("src/config/domains.json", domains);
write("src/config/facets.json", facets);
write("src/config/reverseItems.json", reverseItems);
write("src/config/formulas.json", formulas);
write("src/i18n/es.json", es);
write("tests/fixtures/ejemplo-excel.json", fixture);
console.log(`\n${questions.length} items, ${reverseItems.length} inversos, ${facets.length} facetas, ${domains.length} dominios`);
