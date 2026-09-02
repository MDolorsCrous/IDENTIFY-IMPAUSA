# La licencia del BFI-2

**Estado: pendiente de resolver.** Encontrado el 1 de septiembre de 2026, mientras se
buscaban los ítems oficiales en inglés.

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

## Por qué esto para el inglés

Reproducir los 60 ítems de un instrumento con copyright dentro de un producto de pago,
antes de tener el permiso, sería crear un problema en vez de resolverlo. El orden es:
permiso → ítems oficiales → validación ítem a ítem → test e informe en inglés.

## Lo que sí se ha hecho mientras tanto

El informe **atribuye el instrumento** a sus autores y lista las cinco fuentes con su DOI,
en `src/config/fuentes.json`. Atribuir es lo primero que pide cualquier licencia, y hacía
falta igualmente.

## Dato relacionado: el catalán

La misma página lista las traducciones oficiales que existen —chino, neerlandés, alemán,
inglés, hebreo, italiano, lituano, portugués, español y sueco— y **el catalán no está
entre ellas**. Confirma desde la fuente lo que explica el panel `CA` de la portada del
test. Ver `IDIOMAS` en `tools/render-test.mjs`.
