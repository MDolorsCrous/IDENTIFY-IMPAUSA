// Pide a Claude la redaccion del informe, desde el comando.
//
// **Vive en tools/ a proposito.** Este fichero maneja la clave y no puede
// acabar nunca dentro de test-identify.html: la pagina es un HTML suelto que
// se abre con doble clic, y cualquier clave que llevara dentro quedaria a la
// vista de quien lo abriera. tools/empaquetar.mjs solo empaqueta la lista
// explicita de src/services/, asi que desde aqui no hay forma de colarse; y
// tests/empaquetado.test.ts lo comprueba.
//
// La llamada en si vive en pedir-redaccion.mjs, compartida con la funcion de la
// web. Aqui solo queda lo propio del comando: comprobar que hay clave y decir
// los fallos de manera que se puedan leer en una terminal.
import { claveDeApi, NOMBRES } from "./clave-api.mjs";
import { pedirRedaccion, FalloDeRedaccion } from "./pedir-redaccion.mjs";

class ErrorDeRedaccion extends Error {
  constructor(mensaje, pista) {
    super(mensaje);
    this.name = "ErrorDeRedaccion";
    this.pista = pista;
  }
}

/**
 * Redacta el informe de un modelo ya interpretado.
 *
 * @param {object} modelo   el que devuelve construirModelo()
 * @param {object} facetas  facetas.json
 * @returns {Promise<{prosa: object, uso: object, coste: number, modelo: string, segundos: number}>}
 */
export async function redactar(modelo, facetas, { alEmpezar } = {}) {
  if (!claveDeApi()) {
    throw new ErrorDeRedaccion(
      "No hay clave de API.",
      `Ponla en la variable de entorno ${NOMBRES[0]} y vuelve a lanzarlo.`,
    );
  }

  alEmpezar?.();
  try {
    return await pedirRedaccion(modelo, facetas, (aviso) => {
      // Un reintento no es un fallo, pero conviene verlo: si pasa siempre, hay
      // algo que mirar en la conexion.
      process.stderr.write(`\n  (${aviso})\n  `);
    });
  } catch (e) {
    if (e instanceof FalloDeRedaccion) throw new ErrorDeRedaccion(e.message, e.pista);
    throw e;
  }
}

export { ErrorDeRedaccion };
