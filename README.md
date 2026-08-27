# Think by Impausa

Test autoadministrable + informe interpretativo del ecosistema **IMPAUSA / LivePausa**.

## Estado

| Pieza | Dónde vive | Estado |
| --- | --- | --- |
| Test (ítems, escala, recogida de respuestas) | Lovable | ✅ Hecho |
| Cálculo de puntuaciones en bruto | Lovable | ✅ Hecho |
| Modelo de interpretación (bandas, perfiles, reglas) | este repo → `docs/02` | ⬜ Pendiente |
| Informe en pantalla (estructura + gráficos) | app | ⬜ Pendiente |
| Párrafos de coaching redactados por Claude | API de Claude | ⬜ Pendiente |
| Exportación PDF / Word con marca LivePausa | app | ⬜ Pendiente |
| Skill de Claude Code (`think-impausa`) | `.claude/skills/` | ⬜ Pendiente |

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
Cormorant Garamond. El titular es siempre **Think**; debajo, pequeño, *by Impausa*.
