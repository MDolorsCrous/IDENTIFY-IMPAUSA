// Convierte el texto extraido del PDF de la base de conocimiento en un documento
// navegable. No interpreta nada: reordena y limpia. El contenido es literal.
const fs = require("fs");

const ORIGEN = process.argv[2];
const SALIDA = process.argv[3];
const bruto = fs.readFileSync(ORIGEN, "utf8");

// Trocear por paginas
const paginas = {};
let actual = null;
for (const linea of bruto.split("\n")) {
  const m = linea.match(/^===== PAGINA (\d+) =====$/);
  if (m) { actual = Number(m[1]); paginas[actual] = []; continue; }
  if (actual === null) continue;
  const t = linea.trim();
  // Cabecera repetida en las 102 diapositivas
  if (t === "Lideratge en Entorns Cambiants" || t === "Liderar des de l’Autoconeixement") continue;
  if (t !== "") paginas[actual].push(t);
}

const FACETAS = [
  ["sociability", "Sociabilidad", "Extraversión", 25],
  ["assertiveness", "Asertividad", "Extraversión", 30],
  ["energy_level", "Nivel de Energía", "Extraversión", 35],
  ["compassion", "Compasión", "Cordialidad", 40],
  ["respectfulness", "Respeto", "Cordialidad", 45],
  ["trust", "Confianza social", "Cordialidad", 50],
  ["organization", "Organización", "Responsabilidad", 55],
  ["productiveness", "Productividad", "Responsabilidad", 60],
  ["responsibility", "Responsabilidad moral", "Responsabilidad", 65],
  ["anxiety", "Ansiedad", "Emocionalidad negativa", 70],
  ["depression", "Depresión", "Emocionalidad negativa", 75],
  ["emotional_volatility", "Volatilidad emocional", "Emocionalidad negativa", 80],
  ["intellectual_curiosity", "Curiosidad intelectual", "Apertura de mente", 85],
  ["aesthetic_sensitivity", "Sensibilidad estética", "Apertura de mente", 90],
  ["creative_imagination", "Imaginación creativa", "Apertura de mente", 95],
];

const bloque = (p) => (paginas[p] || []).join("\n");

const L = [];
L.push("# Base de conocimiento — interpretación del BFI-2");
L.push("");
L.push("Contenido extraído de **«Liderar desde el Autoconocimiento: BFI-2 como herramienta");
L.push("para comprender el talento en entornos cambiantes»** (102 diapositivas), aportado por");
L.push("la autora del test.");
L.push("");
L.push("> **Qué es y qué no es este fichero.** Es una copia literal reordenada: se ha quitado");
L.push("> la cabecera repetida de cada diapositiva y se ha agrupado por faceta. **No se ha");
L.push("> reescrito ni corregido ni una frase**, así que conserva las erratas de conversión del");
L.push("> original (`disparo` por `rasgo`, `sede` por `su`, `bonos` por `buenos`, catalanismos");
L.push("> sueltos). Antes de que ningún texto de aquí llegue a un informe hay que redactarlo.");
L.push("");
L.push("> Las tablas de dos columnas del original (nivel bajo / nivel alto) salen del PDF");
L.push("> aplanadas: primero la columna de la izquierda entera y después la de la derecha.");
L.push("> Se han dejado tal cual para no arriesgarse a repartir mal las frases.");
L.push("");
L.push("## Índice");
L.push("");
for (const [id, nombre, dominio] of FACETAS) {
  L.push(`- [${nombre}](#${id}) — ${dominio}`);
}
L.push("");
L.push("---");
L.push("");
L.push("## Marco general");
L.push("");
for (const [titulo, pags] of [
  ["Origen del modelo y del instrumento", [3, 4, 5, 6]],
  ["Los cinco dominios y sus quince facetas", [7, 8, 9]],
  ["Estructura del cuestionario", [10, 11, 12]],
  ["Puntuación", [13]],
  ["Interpretación de los dominios", [14, 15]],
  ["Aplicaciones", [16, 17, 18, 19]],
  ["Beneficios", [20, 21, 22, 23]],
]) {
  L.push(`### ${titulo}`);
  L.push("");
  L.push(pags.map(bloque).filter(Boolean).join("\n\n"));
  L.push("");
}

L.push("---");
L.push("");
L.push("## Facetas");
L.push("");
for (const [id, nombre, dominio, p] of FACETAS) {
  L.push(`<a id="${id}"></a>`);
  L.push("");
  L.push(`### ${nombre}`);
  L.push("");
  L.push(`Dominio: **${dominio}** · Diapositivas ${p}–${p + 4} del original`);
  L.push("");
  L.push("#### Definición");
  L.push("");
  L.push(bloque(p + 1));
  L.push("");
  L.push("#### Nivel bajo y nivel alto");
  L.push("");
  L.push(bloque(p + 2));
  L.push("");
  L.push("#### Combinaciones con otras facetas");
  L.push("");
  L.push(bloque(p + 3));
  L.push("");
  L.push("#### Resultados profesionales");
  L.push("");
  L.push(bloque(p + 4));
  L.push("");
}

fs.writeFileSync(SALIDA, L.join("\n"), "utf8");
console.log(`escrito ${SALIDA}: ${L.join("\n").split("\n").length} lineas, ${FACETAS.length} facetas`);
