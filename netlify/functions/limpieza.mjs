// Borra lo que ya no toca guardar. Una vez al dia, sola.
//
// **Por que existe.** Hasta ahora no se borraba nada nunca: cada informe que se
// redactaba se quedaba en Netlify Blobs para siempre, con las respuestas y el
// nombre de quien lo hizo. Guardar material personal sin un plazo no es una
// decision tecnica que se pueda dejar pendiente — es la decision.
//
// **El plazo es un año.** Suficiente para que alguien vuelva a su informe meses
// despues, lo relea con su coach o lo compare con un segundo test; pasado eso,
// se va. Se puede cambiar con `DIAS_GUARDADOS` en Netlify sin tocar el codigo,
// pero el numero de aqui es el que vale por defecto y el que dice la pagina:
// si se cambia uno, hay que cambiar el otro.
//
// La cuota diaria tambien se limpia. No lleva nada de nadie —un numero por
// fecha— pero una clave por dia que no se borra nunca es basura que crece.
import { getStore } from "@netlify/blobs";

import { ALMACEN } from "./redactar-background.mjs";

/** Cuanto se guarda un informe. Un año. */
export const DIAS_POR_DEFECTO = 365;

/** La cuota es un contador operativo: con un mes de historia sobra. */
const DIAS_DE_CUOTA = 35;

const DIA = 24 * 60 * 60 * 1000;

export function diasQueSeGuardan(entorno = process.env) {
  const puesto = Number(entorno.DIAS_GUARDADOS);
  return Number.isFinite(puesto) && puesto > 0 ? puesto : DIAS_POR_DEFECTO;
}

/**
 * Los informes caducados.
 *
 * Se separa del barrido para poder probarla: decidir que se borra es la parte
 * que importa, y no se puede comprobar contra un almacen de verdad.
 */
export function caducados(fichas, dias, ahora = Date.now()) {
  const limite = ahora - dias * DIA;
  // Sin fecha no se borra. Es material de alguien y la duda no se resuelve
  // borrando: si algun dia apareciera uno asi, se ve en el registro.
  return fichas.filter((f) => typeof f.cuando === "number" && f.cuando < limite);
}

/** Las fechas de cuota que ya no sirven. Las claves son `YYYY-MM-DD`. */
export function cuotasViejas(claves, ahora = Date.now()) {
  const limite = new Date(ahora - DIAS_DE_CUOTA * DIA).toISOString().slice(0, 10);
  return claves.filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k) && k < limite);
}

export default async function handler() {
  const dias = diasQueSeGuardan();
  let informes = 0;
  let cuotas = 0;

  try {
    const almacen = getStore(ALMACEN);
    const { blobs } = await almacen.list();
    const fichas = [];
    for (const b of blobs) {
      const d = await almacen.get(b.key, { type: "json" });
      if (d) fichas.push({ id: b.key, cuando: d.cuando });
      else fichas.push({ id: b.key });
    }
    for (const f of caducados(fichas, dias)) {
      await almacen.delete(f.id);
      informes++;
    }
    const sinFecha = fichas.filter((f) => typeof f.cuando !== "number").length;
    if (sinFecha) console.warn(`${sinFecha} informe(s) sin fecha: no se tocan.`);
  } catch (e) {
    console.error("No se ha podido limpiar los informes:", e?.message);
  }

  try {
    const cuota = getStore("identify-cuota");
    const { blobs } = await cuota.list();
    for (const k of cuotasViejas(blobs.map((b) => b.key))) {
      await cuota.delete(k);
      cuotas++;
    }
  } catch (e) {
    console.error("No se ha podido limpiar la cuota:", e?.message);
  }

  console.log(`limpieza: ${informes} informe(s) de mas de ${dias} dias · ${cuotas} contador(es) de cuota`);
  return new Response(null, { status: 204 });
}

// Cada noche, a las cuatro. No hay prisa: lo que caduca hoy puede irse hoy.
export const config = { schedule: "0 4 * * *" };
