# Generadores

La configuración de `src/config/` y el documento `docs/01-especificacion-test.md` **no
se escriben a mano**: se generan desde el Excel oficial. Así los 60 enunciados no pasan
por una transcripción, que es donde se cuelan los errores.

```bash
XLSX="C:\Users\maria\Downloads\BFI-2_formules_correctes_inversos.xlsx"

node tools/gen-config.js "$XLSX" .                       # src/config/, src/i18n/, fixture
node tools/gendoc.js    "$XLSX" docs/01-especificacion-test.md
npm test                                                  # 17 pruebas
```

| Fichero | Qué hace |
| --- | --- |
| `xlsx.js` | Lee un `.xlsx` sin dependencias: descomprime el ZIP y parsea el XML |
| `gen-config.js` | Escribe los ficheros de configuración, el de idioma y el fixture de pruebas |
| `gendoc.js` | Escribe la especificación en Markdown |

## Las dos fuentes tienen que estar de acuerdo

La polaridad de cada ítem sale de la **clave de corrección oficial** (página 3 del PDF,
donde los inversos llevan una R). El Excel permite deducirla por otro camino: comparando
cada respuesta de ejemplo con su valor recodificado.

`gen-config.js` compara las dos fuentes y **aborta** si discrepan en algún ítem. Hoy
coinciden en los 57 comprobables; los otros 3 tienen respuesta 3 en el ejemplo y como
`6 − 3 = 3` no son deducibles, así que ahí manda el PDF.

Los generadores no leen el PDF: está cifrado con AES-256 y ningún extractor saca texto
de él. La clave se transcribió a mano desde la página 3 y vive en dos sitios, el
`INVERSOS_PDF` de `gen-config.js` y el `CLAVE_OFICIAL` de `tests/clave-oficial.test.ts`,
que se comprueban entre ellos.
