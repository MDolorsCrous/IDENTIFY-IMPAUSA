# Motor de puntuación

Configuración y cálculo del BFI-2, sin framework y sin dependencias. Pensado para
copiarse dentro de la app de Lovable tal cual.

```
src/
├─ config/
│  ├─ questions.json      60 ítems: id, dominio, faceta, si es inverso
│  ├─ domains.json        5 dominios, con sus facetas y sus 12 ítems
│  ├─ facets.json         15 facetas, con su dominio y sus 4 ítems
│  ├─ reverseItems.json   los 30 ítems inversos, como lista suelta
│  └─ formulas.json       escala, constante de inversión y método de cálculo
├─ i18n/
│  └─ es.json             textos visibles: enunciados, escala, nombres
└─ services/
   ├─ reverseScoring.ts   recode(): 6 − respuesta
   └─ scoring.ts          score(): validación, facetas y dominios
```

**Ningún texto visible vive en el código.** `questions.json` solo tiene estructura;
los enunciados están en `i18n/es.json` indexados por número de ítem.

## Uso

```ts
import { score, round2 } from "./services/scoring.ts";
import questions from "./config/questions.json" with { type: "json" };
import facets from "./config/facets.json" with { type: "json" };
import domains from "./config/domains.json" with { type: "json" };

const { facets: f, domains: d } = score(respuestas, { questions, facets, domains });

console.log(round2(d.extraversion)); // 3.17
```

`respuestas` es un objeto `{ 1: 4, 2: 1, … 60: 3 }` con los 60 ítems y valores de 1 a 5.

Si falta algún ítem, hay un valor fuera de escala o llega un ítem inexistente, `score`
lanza un `ScoringError` con un `code` (`missing_responses`, `invalid_response`,
`unknown_item`) y la lista de ítems afectados en `items`, para poder señalarlos en la
interfaz. **No puntúa a medias**: un informe hecho sobre un test incompleto es peor que
no tener informe.

## Qué devuelve

| Campo | Qué es |
| --- | --- |
| `recoded` | Las 60 respuestas ya recodificadas |
| `facets` | 15 medias, de 1,00 a 5,00 |
| `domains` | 5 medias, de 1,00 a 5,00 |

Números y nada más: ni bandas, ni etiquetas, ni perfil. Eso es trabajo de la capa de
interpretación, que todavía no existe — ver [`../docs/02-modelo-interpretacion.md`](../docs/02-modelo-interpretacion.md).

`round2` es solo para mostrar. Nunca redondees y sigas calculando con el resultado.

## Pruebas

```bash
npm test
```

86 pruebas, sin instalar nada: Node 22.6+ ejecuta TypeScript directamente.

La que importa es la que compara contra el Excel oficial. El fichero
`BFI-2_formules_correctes_inversos.xlsx` trae un juego de respuestas de ejemplo con
sus resultados ya calculados; `tests/fixtures/ejemplo-excel.json` los recoge y el
motor tiene que reproducir los 60 valores recodificados, las 15 facetas y los 5
dominios **exactamente**. Si alguien toca la configuración y rompe la psicometría,
esa prueba se pone roja.

## Adaptarlo a otro instrumento

Era el objetivo del PRD: que DISC, VIA o Motivaciones se monten cambiando solo
configuración. `scoring.ts` no sabe nada del BFI-2 — recibe la config como parámetro.
Para otro test:

1. Nuevos `questions.json`, `facets.json`, `domains.json` con su estructura.
2. Nuevo fichero de idioma.
3. Nada más, **si el instrumento puntúa por medias con ítems inversos a `k − respuesta`.**

Si puntúa de otra forma —pesos por ítem, escalas ipsativas, baremos por edad— hace
falta tocar `scoring.ts`. No todos los instrumentos caben aquí, y forzarlos sería peor
que escribir un motor nuevo.

## Pendiente

- **`i18n/ca.json`.** No existe el fichero oficial del BFI-2 en catalán. Traducir un
  instrumento estandarizado por nuestra cuenta invalidaría la comparación con los
  datos publicados, así que hace falta la versión oficial.

La polaridad de los 60 ítems **ya está verificada** contra la clave de corrección
oficial del PDF, y esa clave vive en `tests/clave-oficial.test.ts`.

Los enunciados **ya no vienen del Excel**: salen de `config/enunciados-oficiales.json`,
transcritos del apéndice del postprint de Gallardo-Pujol et al. (2022). Eran once los que
tenían erratas —`entusiamado`, `Metóidico/a`, `IServicial`, `desconfia`, cuatro tildes de
más en `quién` y dos `/a` que faltaban—, y son textos que lee la persona.
`tools/gen-config.js` los toma de ahí, y hay pruebas que se ponen rojas si alguien vuelve
a generarlos desde el Excel.

El fichero guarda las dos listas: `oficiales`, literal del PDF, y `enunciados`, que es
lo que se muestra. Hoy difieren en dos ítems, el 20 y el 51, donde se mantiene la forma
inclusiva —`Fascinado/a`, `otros/as`— por criterio editorial de IMPAUSA. Las desviaciones
van declaradas con su motivo en el propio fichero, y **una prueba comprueba que no haya
ninguna sin declarar**: apartarse del texto oficial se puede, pero solo a propósito.
