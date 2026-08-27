# Identify by Impausa

Test autoadministrable + informe interpretativo del ecosistema **IMPAUSA / LivePausa**.


## Dónde está cada cosa

| Ruta | Qué es |
| --- | --- |
| `Projects\IDENTIFY_TEST` | **Esta carpeta.** Documentación y capa de interpretación del test |
| `github.com/MDolorsCrous/Identify_Impausa` | Repo que Lovable sincroniza con el código del test |
| `Projects\IDENTIFY_IMPAUSA` | Reservada para clonar ese repo cuando Lovable haya subido el código |
| `Projects\LAIA_IMPAUSA` (repo `THINK_IMPAUSA`) | Otra cosa: la app de conversación LAIA del curso. Sin relación |

Cuando el repo de Lovable tenga contenido, esta documentación se mueve dentro de él y
todo pasa a vivir en un solo sitio. No se sube nada a `Identify_Impausa` hasta
entonces, para no chocar con el primer push de Lovable.

## Estado

| Pieza | Dónde vive | Estado |
| --- | --- | --- |
| Test (ítems, escala, recogida de respuestas) | Lovable → repo `Identify_Impausa` | ✅ Hecho |
| Cálculo de puntuaciones en bruto | Lovable → repo `Identify_Impausa` | ✅ Hecho |
| Modelo de interpretación (bandas, perfiles, reglas) | esta carpeta → `docs/02` | ⬜ **La pieza que falta** |
| Informe en pantalla (estructura + gráficos) | app | ⬜ Pendiente |
| Párrafos de coaching redactados por Claude | API de Claude | ⬜ Pendiente |
| Exportación PDF / Word con marca LivePausa | app | ⬜ Pendiente |
| Skill de Claude Code (`identify-impausa`) | `.claude/skills/` | ⬜ Pendiente |

## Arquitectura: híbrida

1. **La app calcula.** Puntuaciones, bandas y perfil salen de reglas deterministas en código.
   Mismo input → mismo output, siempre. Sin coste ni latencia.
2. **La app dibuja.** Estructura del informe, secciones y gráficos son fijos y versionados.
3. **Claude redacta.** Solo los pasajes de coaching (lectura personalizada, tensiones,
   experimentos) se piden a la API de Claude, con las puntuaciones ya interpretadas
   como input y un esquema de salida cerrado.

Ventaja: rigor psicométrico reproducible + calidez de un informe escrito a medida,
sin dejar que el modelo invente puntuaciones.

## Documentación

- [`docs/01-especificacion-test.md`](docs/01-especificacion-test.md) — constructo, dimensiones, ítems, escala y fórmulas
- [`docs/02-modelo-interpretacion.md`](docs/02-modelo-interpretacion.md) — bandas, perfiles y reglas SI…ENTONCES
- [`docs/03-estructura-informe.md`](docs/03-estructura-informe.md) — secciones del informe y qué las alimenta
- [`docs/04-arquitectura-hibrida.md`](docs/04-arquitectura-hibrida.md) — qué calcula el código y qué redacta Claude

## Marca

Rótulo inicial, paleta y tipografía: skill `retol-test-impausa`.
Fondo crema `#FBF5E9`, tinta `#241910`, gradiente naranja→verde `#EF8A4D → #7FAE79`,
Cormorant Garamond. El titular es siempre **Identify**; debajo, pequeño, *by Impausa*.
