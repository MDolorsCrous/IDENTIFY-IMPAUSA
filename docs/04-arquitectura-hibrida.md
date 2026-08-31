# 04 — Arquitectura híbrida

## El ciclo, hoy

Funciona de punta a punta, con un paso manual y sin la capa de redacción:

1. **La persona responde el test.** `tools/render-test.mjs` genera la página; las
   respuestas viven solo en memoria.
2. **Al terminar, copia el resultado.** El botón «Copiar para el informe» pone en el
   portapapeles un JSON con las **respuestas**, no con las puntuaciones — quien genere el
   informe vuelve a puntuar con el motor, para que no haya dos cálculos que discrepen.
3. **Se genera el informe:**

   ```bash
   node generar.js --clipboard
   node generar.js datos/marta-2026-08-27.json
   node generar.js datos/marta-2026-08-27.json --prosa textos.json
   ```

   Valida, construye el modelo, escribe `informe-<persona>-<fecha>.html` y guarda copia
   del JSON en `datos/`.

**Sin `--prosa`, el informe sale igualmente**: con todas las secciones que calcula el
código y los pasajes redactados marcados como pendientes. Cada dominio lleva además una
línea de datos escrita por el código —«Extraversión: 3,17 sobre 5, en la banda media-alta.
De sus tres facetas, la que más se separa es Nivel de energía, con 3,75»—, que no es
interpretación sino descripción, y hace que un informe sin redacción siga diciendo algo.

> `datos/` guarda las respuestas de personas reales. Se versiona, siguiendo la convención
> de THINK_IMPAUSA, pero conviene tenerlo presente antes de hacer público el repositorio.

## A dónde va

Lo que falta es sustituir el paso manual de la redacción por la llamada a la API. El
hueco ya está abierto: `renderInforme(modelo, prosa, labels)` recibe la prosa como
argumento, y `--prosa` demuestra que encaja.

```
Respuestas (test)
   │
   ▼
[ CÓDIGO ] puntuar → banda por faceta y dominio → reglas disparadas y señales
   │                                    │
   │                                    └──► gráficos y secciones fijas
   ▼
{ modelo del informe }  ── JSON cerrado ──►  [ API de Claude ]
                                                   │
                                                   ▼
                                        párrafos de coaching (§2,5,6,7,8,9,10)
   │
   ▼
[ CÓDIGO ] ensambla informe → pantalla → PDF
```

La tubería `respuestas → modelo` está en `src/services/pipeline.ts`, en una sola función
(`construirModelo`), para que el test, el comando y las pruebas no puedan divergir.

## Reglas duras

1. **Claude nunca calcula.** Recibe puntuaciones y bandas ya resueltas. No se le pasan
   respuestas crudas ni se le pide que puntúe: eso lo hace el código, y es reproducible.
2. **Salida con esquema cerrado.** La llamada a la API usa una herramienta con JSON
   Schema: una clave por sección, longitud máxima por campo. Nada de prosa libre que
   luego haya que parsear.
3. **Degradación elegante.** Si la API falla, el informe se entrega igualmente con las
   secciones deterministas y un aviso; no se rompe la entrega.
4. **Trazabilidad.** Se guarda el JSON de entrada y la salida del modelo junto al
   informe, para poder auditar por qué dijo lo que dijo.
5. **Coherencia.** El prompt lleva las reglas de tono, los niveles de evidencia y las
   inferencias prohibidas de [`02`](02-modelo-interpretacion.md).

## Modelo

Claude Sonnet 5 (`claude-sonnet-5`) para la redacción por defecto; Opus 5
(`claude-opus-5`) si en pruebas la calidad de los pasajes E3 no da la talla.

## Coste por informe

_Estimar cuando esté el prompt: tokens de entrada × tokens de salida × precio._
