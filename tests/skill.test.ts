/**
 * La skill se genera desde el repositorio (`node tools/gen-skill.mjs`), y estas
 * pruebas existen para que siga siendo verdad.
 *
 * El riesgo que cubren no es que el generador falle: es que alguien edite
 * `skill/` a mano para arreglar una frase, y a partir de ahí la skill y el motor
 * digan cosas distintas sin que nadie se entere. Si estas pruebas se ponen rojas,
 * el sitio donde se cambia el texto es el JSON, y luego se regenera.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { cargarRecursos } from "../tools/recursos.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));
const skill = (rel: string) =>
  readFileSync(join(raiz, "skill/identify-bfi2-knowledge", rel), "utf8");

const facetas = cargarRecursos().facetas as Record<string, any>;
const reglas = cargarRecursos().rules as any[];
const metaforas = cargarRecursos().metaforas;
const ids = Object.keys(facetas).filter((k) => !k.startsWith("_"));

test("la skill está generada", () => {
  assert.ok(
    existsSync(join(raiz, "skill/identify-bfi2-knowledge/SKILL.md")),
    "falta skill/: ejecuta node tools/gen-skill.mjs",
  );
});

test("las 15 facetas están, con sus dos lecturas enteras", () => {
  const md = skill("references/facetas.md");
  assert.equal(ids.length, 15);
  for (const id of ids) {
    for (const nivel of ["bajo", "alto"] as const) {
      const texto = facetas[id][nivel].texto as string;
      assert.ok(md.includes(texto), `${id}/${nivel}: el texto no está, o no es el del JSON`);
      for (const ref of facetas[id][nivel].referencias as string[]) {
        assert.ok(md.includes(ref), `${id}/${nivel}: falta la referencia «${ref}»`);
      }
    }
    assert.ok(md.includes(facetas[id].definicion), `${id}: falta la definición`);
  }
});

test("las 26 combinaciones están, con su significado y sus citas", () => {
  const md = skill("references/combinaciones.md");
  assert.equal(reglas.length, 26);
  for (const r of reglas) {
    assert.ok(md.includes(r.effect), `regla ${r.id}: falta el efecto`);
    assert.ok(md.includes(r.summary), `regla ${r.id}: el resumen no es el del JSON`);
    for (const ref of r.references as string[]) {
      assert.ok(md.includes(ref), `regla ${r.id}: falta la cita «${ref}»`);
    }
  }
});

test("las reglas que piden cuidado van marcadas como tales", () => {
  const md = skill("references/combinaciones.md");
  const marcas: Record<string, string> = { clinico: "clínica", delicado: "delicada" };
  for (const r of reglas.filter((r) => r.safety)) {
    const marca = marcas[r.safety];
    const desde = md.indexOf(r.summary);
    const hasta = md.indexOf("###", desde);
    const bloque = md.slice(desde, hasta === -1 ? undefined : hasta);
    assert.ok(bloque.includes(marca), `regla ${r.id}: no lleva la marca «${marca}»`);
  }
});

test("el mapa de metáforas está entero y las excluidas fuera", () => {
  const md = skill("references/metaforas.md");
  assert.equal(Object.keys(metaforas.categorias).length, 23);
  assert.equal(Object.keys(metaforas.mapa).length, 15);

  for (const cat of Object.values(metaforas.categorias) as any[]) {
    assert.ok(md.includes(cat.nombre), `falta la categoría «${cat.nombre}»`);
    for (const m of cat.metaforas) {
      assert.ok(md.includes(m.texto), `falta la metáfora «${m.nombre}»`);
    }
  }
  // Las excluidas se nombran para decir por qué no están, pero sin sus metáforas.
  for (const id of Object.keys(metaforas.excluidas)) {
    assert.ok(!metaforas.categorias[id], `la categoría excluida ${id} está en el catálogo`);
  }
});

test("el frontmatter es válido y dice cuándo usarla", () => {
  const md = skill("SKILL.md");
  assert.ok(md.startsWith("---\n"), "SKILL.md no empieza por el frontmatter");
  const frontmatter = md.slice(4, md.indexOf("\n---", 4));
  assert.match(frontmatter, /^name: identify-bfi2-knowledge$/m);
  assert.match(frontmatter, /^description: /m);
  for (const disparador of ["BFI-2", "Big Five", "Identify"]) {
    assert.ok(frontmatter.includes(disparador), `la descripción no dispara con «${disparador}»`);
  }
});

test("SKILL.md se queda corto: el peso va en references/", () => {
  // Es lo que se carga siempre; las referencias solo cuando hacen falta. Si
  // crece por encima de esto, hay material que pertenece a references/.
  const bytes = Buffer.byteLength(skill("SKILL.md"), "utf8");
  assert.ok(bytes < 15 * 1024, `SKILL.md ocupa ${(bytes / 1024).toFixed(1)} KB`);
});

test("el paquete .skill lleva la carpeta dentro, con barras hacia delante", () => {
  // Compress-Archive las guarda con barra invertida y así el .skill no sube.
  const zip = readFileSync(join(raiz, "skill/identify-bfi2-knowledge.skill"));
  const texto = zip.toString("latin1");
  assert.ok(texto.includes("identify-bfi2-knowledge/SKILL.md"));
  assert.ok(!texto.includes("identify-bfi2-knowledge\\"), "el ZIP lleva barras invertidas");
});
