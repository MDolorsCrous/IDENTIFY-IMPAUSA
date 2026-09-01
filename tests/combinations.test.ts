/**
 * Comprueba que las reglas de combinación son coherentes con la configuración
 * del test: facetas que existen, niveles válidos, sin duplicados y con cita.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel: string) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));

interface Condicion {
  facet: string;
  level: "low" | "high";
}
interface Regla {
  id: string;
  effect: string;
  conditions: Condicion[];
  summary: string;
  scope: string;
  evidence: string;
  safety?: string;
  references: string[];
  sourceSlides: number[];
  appearsIn: string[];
  revision?: string;
}

const reglas = leer("src/config/interpretation/combinations.json") as Regla[];
const facetas = new Set((leer("src/config/facets.json") as { id: string }[]).map((f) => f.id));

const ALCANCES = new Set(["laboral", "personal", "interpersonal", "salud"]);
const SEGURIDAD = new Set(["clinico", "delicado"]);

test("todas las reglas apuntan a facetas que existen", () => {
  for (const r of reglas) {
    for (const c of r.conditions) {
      assert.ok(facetas.has(c.facet), `regla ${r.id}: la faceta "${c.facet}" no existe`);
    }
    for (const f of r.appearsIn) {
      assert.ok(facetas.has(f), `regla ${r.id}: appearsIn "${f}" no existe`);
    }
  }
});

test("los niveles son low o high", () => {
  for (const r of reglas) {
    for (const c of r.conditions) {
      assert.ok(["low", "high"].includes(c.level), `regla ${r.id}: nivel "${c.level}"`);
    }
  }
});

test("los identificadores no se repiten", () => {
  const ids = reglas.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, "hay identificadores repetidos");
});

test("ninguna regla repite las mismas condiciones que otra", () => {
  const huella = (r: Regla) =>
    r.conditions
      .map((c) => `${c.facet}:${c.level}`)
      .sort()
      .join("|");
  const vistas = new Map<string, string>();
  for (const r of reglas) {
    const h = huella(r);
    const previa = vistas.get(h);
    assert.equal(previa, undefined, `${r.id} repite las condiciones de ${previa}`);
    vistas.set(h, r.id);
  }
});

test("ninguna regla se contradice a sí misma", () => {
  for (const r of reglas) {
    const porFaceta = new Map<string, string>();
    for (const c of r.conditions) {
      const previo = porFaceta.get(c.facet);
      assert.ok(
        previo === undefined || previo === c.level,
        `regla ${r.id}: pide "${c.facet}" en dos niveles a la vez`,
      );
      porFaceta.set(c.facet, c.level);
    }
  }
});

test("toda regla tiene al menos dos condiciones", () => {
  for (const r of reglas) {
    assert.ok(r.conditions.length >= 2, `regla ${r.id}: es una combinación, no una faceta suelta`);
  }
});

test("toda regla lleva cita, alcance y trazabilidad al original", () => {
  for (const r of reglas) {
    assert.ok(r.references.length > 0, `regla ${r.id}: sin referencia`);
    assert.ok(ALCANCES.has(r.scope), `regla ${r.id}: alcance "${r.scope}" desconocido`);
    assert.ok(r.sourceSlides.length > 0, `regla ${r.id}: sin diapositiva de origen`);
    assert.ok(r.summary.length > 40, `regla ${r.id}: resumen demasiado corto`);
    assert.equal(r.evidence, "E2", `regla ${r.id}: las combinaciones del material son E2`);
  }
});

test("las marcas de seguridad son de las previstas", () => {
  for (const r of reglas) {
    if (r.safety !== undefined) {
      assert.ok(SEGURIDAD.has(r.safety), `regla ${r.id}: safety "${r.safety}" desconocido`);
    }
  }
});

test("las reglas de riesgo de agotamiento van marcadas como clínicas", () => {
  for (const r of reglas) {
    if (/agotamiento|burnout/i.test(r.effect)) {
      assert.equal(r.safety, "clinico", `regla ${r.id}: habla de agotamiento y no está marcada`);
    }
  }
});

test("appearsIn incluye alguna faceta de las condiciones", () => {
  for (const r of reglas) {
    const enCondiciones = new Set(r.conditions.map((c) => c.facet));
    assert.ok(
      r.appearsIn.some((f) => enCondiciones.has(f)),
      `regla ${r.id}: appearsIn no coincide con sus condiciones`,
    );
  }
});

// ---- La base de conocimiento por faceta ----

interface Lectura {
  texto: string;
  referencias: string[];
}
interface FichaFaceta {
  definicion: string;
  bajo: Lectura;
  alto: Lectura;
  sourceSlides: number[];
}

const fichas = leer("src/config/interpretation/facetas.json") as Record<string, FichaFaceta>;
const idsFaceta = (leer("src/config/facets.json") as { id: string }[]).map((f) => f.id);

test("hay lectura para las 15 facetas, y para ninguna que no exista", () => {
  const conFicha = Object.keys(fichas).filter((k) => !k.startsWith("_"));
  assert.deepEqual([...conFicha].sort(), [...idsFaceta].sort());
});

test("cada faceta tiene definición y las dos lecturas, con cita", () => {
  for (const id of idsFaceta) {
    const f = fichas[id];
    assert.ok(f.definicion?.length > 20, `${id}: definición corta o ausente`);
    for (const polo of ["bajo", "alto"] as const) {
      assert.ok(f[polo]?.texto?.length > 80, `${id}.${polo}: texto demasiado corto`);
      assert.ok(f[polo].referencias?.length > 0, `${id}.${polo}: sin referencia`);
    }
    assert.ok(f.sourceSlides?.length > 0, `${id}: sin diapositiva de origen`);
  }
});

test("las dos lecturas de una faceta dicen cosas distintas", () => {
  for (const id of idsFaceta) {
    assert.notEqual(fichas[id].bajo.texto, fichas[id].alto.texto, id);
  }
});

test("los textos están redactados, no copiados en bruto", () => {
  // El material de origen arrastra estos errores de conversión. Si reaparecen,
  // es que alguien ha pegado el texto sin pasarlo por el tono de la casa.
  const enBruto = ["mucho alto", "sede gregarismo", "ninguna a los", "los cuesta", "sedes "];
  for (const id of idsFaceta) {
    for (const polo of ["bajo", "alto"] as const) {
      for (const marca of enBruto) {
        assert.ok(
          !fichas[id][polo].texto.includes(marca),
          `${id}.${polo} conserva «${marca}» del original sin redactar`,
        );
      }
    }
  }
});
