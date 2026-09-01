// De banda a polo de la base de conocimiento.
//
// Lo usan el renderizador y el encargo de redaccion. Vive aparte porque los dos
// lo necesitan y porque en el paquete del navegador todo comparte ambito: dos
// constantes con el mismo nombre en dos ficheros serian un choque.

/** Que lectura —la del nivel bajo o la del alto— corresponde a cada banda. */
export const POLO = {
  baja: "bajo",
  "media-baja": "bajo",
  "media-alta": "alto",
  alta: "alto",
};

/**
 * Bandas centrales. Llevan la lectura de su polo, pero avisando: la puntuacion
 * esta cerca del punto medio y no describe un extremo que no se ha dado.
 */
export const MATIZADA = new Set(["media-baja", "media-alta"]);
