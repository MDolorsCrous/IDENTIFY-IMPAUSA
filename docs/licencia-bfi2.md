# La licencia del BFI-2

**Estado: permiso pedido, sin respuesta todavía.** El problema se encontró el 1 de
septiembre de 2026, buscando los ítems oficiales en inglés. El correo a
`ucbpersonalitylab@gmail.com` **ya está enviado**; a 4 de septiembre de 2026 no hay
respuesta.

**Y mientras tanto se publicó igualmente el inglés.** El 3 de septiembre de 2026 se
añadieron los 60 ítems oficiales en inglés (`src/i18n/en.json`), transcritos del apéndice
del artículo original y verificados en `docs/bfi2-form-en.md`. Es **una decisión expresa de
Maria Dolors Crous**, tomada sabiendo lo que dice el apartado siguiente y después de que se
le advirtiera de ello. Queda escrito aquí para que el repositorio no diga una cosa y el
código haga otra.

## Lo que dicen los autores

En la página del Berkeley Personality Lab, de Oliver P. John:

> «Christopher J. Soto and I hold the copyright to the BFI-2… freely available for
> researchers to use for **non-commercial research purposes**… If you are interested in
> using the BFI-2 for commercial purposes, please submit a request to
> ucbpersonalitylab@gmail.com. **At this time, the BFI-2 is for non-commercial uses only.**»

Fuentes: [Berkeley Personality Lab](https://www.ocf.berkeley.edu/~johnlab/bfi.html) ·
[Colby Personality Lab](https://www.colby.edu/academics/departments-and-programs/psychology/research-opportunities/personality-lab/the-bfi-2/)

## Qué significa para Identify

Identify es un producto de pago. Eso lo sitúa fuera del uso no comercial que los autores
permiten sin pedir nada, **y afecta también a la versión española que ya está publicada**,
no solo a la inglesa que estaba previsto añadir.

No es un problema de código y no se arregla programando. Es un permiso: hay que pedirlo a
`ucbpersonalitylab@gmail.com`. El borrador del correo está en
[`correo-a-los-autores.md`](../correo-a-los-autores.md), en la raíz del proyecto.

## El orden que se recomendó, y el que se siguió

Lo recomendado era: **permiso → ítems oficiales → validación ítem a ítem → test e informe
en inglés**. Reproducir los 60 ítems de un instrumento con copyright dentro de un producto
de pago, antes de tener el permiso, es crear un problema en vez de resolverlo.

El orden que se siguió fue el mismo **menos el primer paso**: los ítems se transcribieron
del apéndice del artículo original, se verificaron por tres vías —la clave del apéndice
contra `CLAVE_OFICIAL`, la Tabla 6 contra el apéndice, y la polaridad ítem a ítem contra el
castellano— y se publicaron sin esperar la respuesta.

Conviene tener presente que **esto no es un problema nuevo del inglés**: la versión española
publicada está en la misma situación desde el primer día. La respuesta de los autores
resuelve las dos, o ninguna.

## Lo que sí se ha hecho

- El informe y la pantalla de inicio **atribuyen el instrumento** a sus autores —
  `BFI-2 © Oliver P. John y Christopher J. Soto`— en las dos lenguas.
- Se listan las cinco fuentes con su DOI en `src/config/fuentes.json`, verificadas contra
  Crossref.
- Ni la pantalla ni el informe afirman en ningún momento que Identify esté autorizado,
  avalado o publicado por los autores, ni por la Universidad de California.

Atribuir es lo primero que pide cualquier licencia, y hacía falta igualmente.

## Qué hacer cuando contesten

- **Si autorizan:** actualizar este documento con la fecha y las condiciones, y ponerlas
  donde toque (normalmente una línea de crédito en el informe).
- **Si ponen condiciones económicas o de uso:** valorarlas antes de seguir vendiendo.
- **Si deniegan:** hay que retirar los ítems de las dos versiones. El instrumento es suyo.

## Dato relacionado: el catalán

La misma página lista las traducciones oficiales que existen —chino, neerlandés, alemán,
inglés, hebreo, italiano, lituano, portugués, español y sueco— y **el catalán no está
entre ellas**. Confirma desde la fuente lo que explica el panel `CA` de la portada del
test. Ver `IDIOMAS` en `tools/render-test.mjs`.
