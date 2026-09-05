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

## La redacción

El ciclo completo, con el mismo paso manual:

```bash
node generar.js datos/marta-2026-08-27.json --prompt
# pegar el encargo en una conversación con Claude, guardar el JSON que devuelva
node generar.js datos/marta-2026-08-27.json --prosa datos/marta.prosa.json
```

`--prompt` deja el encargo en el portapapeles y en `datos/<nombre>.prompt.md`. Lo
construye `src/services/prompt.ts`, en tres piezas:

1. **Las instrucciones** — tono documentado, qué se puede afirmar y qué no, las señales
   en condicional, el trato del material clínico y las longitudes por sección.
2. **El material** — el perfil ya interpretado: puntuaciones, bandas, la faceta que se
   separa en cada dominio, las reglas disparadas con su cita, las señales con lo que les
   falta, y **lo que la base de conocimiento dice de cada faceta al nivel que ha salido**.
3. **El esquema** — una clave por sección, con longitud máxima. Nada de prosa libre.

**Claude nunca ve las respuestas al cuestionario.** Recibe el perfil resuelto, nunca los
datos crudos: puntuar es trabajo del código y tiene que ser reproducible. Hay una prueba
que lo comprueba, y otra que verifica que no se cuele la secuencia de respuestas.

Al volver, `--prosa` **valida antes de escribir**. Si falta una sección, si las preguntas
no son entre cinco y siete o si el plan no trae tres pasos, el comando lo dice y no genera
nada. Vale más un informe con los huecos marcados que uno con una redacción a medias.

El encargo se guarda siempre junto al informe, esté la redacción hecha o no: es el
registro de qué se le pidió al modelo, que pide la regla 4 de aquí abajo.

## Lo que falta para automatizarlo

Hoy el paso de la redacción es manual, como en THINK_IMPAUSA. Para que lo haga el código
hace falta:

- **Una credencial.** Ni `ANTHROPIC_API_KEY` ni el CLI `ant` están disponibles en este
  equipo, así que la vía automática no se puede ni ejecutar ni probar.
- **Dos dependencias**, `@anthropic-ai/sdk` y `zod`, en un proyecto que hoy no tiene
  ninguna. La llamada usaría `client.messages.parse()` con `output_config.format`, que
  valida la respuesta contra el esquema en el propio SDK.

Cuando estén las dos cosas, lo único que cambia es de dónde sale el objeto de prosa:
`renderInforme` y la validación ya funcionan igual.

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

## Qué se guarda, dónde, y quién puede leerlo

| Qué | Dónde | Cuándo sale del aparato |
| --- | --- | --- |
| Las 60 respuestas y por dónde iba | `localStorage` del navegador | Nunca. Se borra al terminar y al reiniciar |
| El idioma elegido | `localStorage` | Nunca |
| El código de acceso | `sessionStorage` | Solo hacia `/api/entrar` y `/api/redactar`, para comprobarlo |
| Respuestas, nombre, idioma y prosa | Netlify Blobs, almacén `identify-informes` | **Al pedir el informe escrito**, y se quedan |
| El recuento de informes del día | Netlify Blobs, almacén `identify-cuota` | Un número por fecha, sin nada de nadie |

Las respuestas se guardan junto a la prosa **a propósito**: el informe se dibuja desde el
modelo, y el modelo se monta desde las respuestas. Guardar solo el texto haría que el
informe fuese irrecuperable en cuanto se cerrara la pestaña — que es exactamente lo que
pasaba antes.

Se llega a un informe guardado por su dirección, `#informe=<id>`, y hace falta **además**
el código de acceso: el identificador es un UUID que nadie va a acertar, pero un informe
es material personal y no se sirve solo por conocer su nombre (`resultado.mjs` vuelve a
comprobar el código en cada lectura).

Desde el ordenador de quien administra, `node tools/informes.mjs` lista lo que hay y
`node tools/informes.mjs <id>` lo saca a `salidas/` como JSON y como HTML. Lee el almacén
con credenciales de Netlify, no con el código del test: no abre ninguna dirección pública
nueva.

**Lo que todavía no está decidido: cuánto tiempo se guarda.** Hoy no se borra nada nunca.
Hace falta un plazo —y algo que lo aplique— antes de que esto pase de las pruebas a
personas que no sean del equipo.

## Modelo

Claude Sonnet 5 (`claude-sonnet-5`) para la redacción por defecto; Opus 5
(`claude-opus-5`) si en pruebas la calidad de los pasajes E3 no da la talla.

## Coste por informe

_Estimar cuando esté el prompt: tokens de entrada × tokens de salida × precio._
