// Empaqueta el motor y el renderizador para que corran en el navegador.
//
// El riesgo de calcular el informe en la pagina seria acabar con dos motores
// que se separan sin que nadie lo note. Aqui no hay segundo motor: se leen los
// MISMOS ficheros de src/services/ que usan el comando y las pruebas, se les
// quitan los tipos con el propio Node y se concatenan.
//
// Node expone stripTypeScriptTypes desde node:module. Sustituye los tipos por
// espacios, asi que conserva los numeros de linea y no reescribe nada mas.
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RAIZ = fileURLToPath(new URL("../", import.meta.url));

/** En orden de dependencia: cada uno solo usa los de arriba. */
const MODULOS = [
  "src/services/bandas.js",
  "src/services/reverseScoring.ts",
  "src/services/scoring.ts",
  "src/services/interpretation.ts",
  "src/services/report.ts",
  "src/services/atencion.ts",
  "src/services/prompt.ts",
  "src/services/pipeline.ts",
  "src/services/render-informe.js",
];

/** Quita los `import` y el prefijo `export`: en el paquete todo comparte ambito. */
function aPlano(fuente) {
  return fuente
    .replace(/^\s*import\s[\s\S]*?from\s*["'][^"']+["']\s*;?\s*$/gm, "")
    .replace(/^export\s+(?=(function|const|let|class|interface|type)\b)/gm, "")
    .replace(/^export\s*\{[\s\S]*?\}\s*;?\s*$/gm, "");
}

export function empaquetarMotor() {
  const piezas = MODULOS.map((rel) => {
    const fuente = readFileSync(path.join(RAIZ, rel), "utf8");
    const js = rel.endsWith(".ts") ? stripTypeScriptTypes(fuente, { mode: "strip" }) : fuente;
    return `/* ===== ${rel} ===== */\n${aPlano(js)}`;
  });

  const paquete = piezas.join("\n");

  // Si sobrevive un import o un export, el paquete no corre en el navegador y
  // vale mas enterarse aqui que con una pagina en blanco.
  const sobrante = paquete.match(/^\s*(import|export)\s/m);
  if (sobrante) {
    const linea = paquete.slice(0, paquete.indexOf(sobrante[0])).split("\n").length;
    throw new Error(`queda un ${sobrante[1]} sin quitar, hacia la línea ${linea} del paquete`);
  }

  // En modulos separados dos constantes pueden llamarse igual; aqui comparten
  // ambito y el navegador se queda en blanco con un "already been declared".
  const declarados = new Map();
  for (const m of paquete.matchAll(/^(?:const|let|class|function)\s+([A-Za-z_$][\w$]*)/gm)) {
    const previo = declarados.get(m[1]);
    if (previo !== undefined) {
      throw new Error(
        `«${m[1]}» está declarado dos veces en el paquete. En módulos separados no ` +
          `pasa nada, pero aquí comparten ámbito: sácalo a src/services/bandas.js ` +
          `o cámbiale el nombre.`,
      );
    }
    declarados.set(m[1], true);
  }

  // El renderizador lleva un <script> dentro de una plantilla —el que ajusta el
  // rotulo—. Al empotrar el paquete en una pagina, ese </script> cerraria el
  // bloque a media funcion y el resto se parsearia como HTML. Se escapa.
  return paquete.replace(/<\/script/gi, "<\\/script");
}

// Ejecutado directamente, lo escribe por pantalla para poder inspeccionarlo.
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  const paquete = empaquetarMotor();
  console.error(`paquete: ${paquete.length} caracteres, ${paquete.split("\n").length} líneas`);
  process.stdout.write(paquete);
}
