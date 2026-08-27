# Identify by Impausa

Test autoadministrable + informe interpretativo del ecosistema **IMPAUSA / LivePausa**.


## Dónde está cada cosa

| Ruta | Qué es |
| --- | --- |
| `Projects\IDENTIFY_TEST` | **Esta carpeta.** Documentación y capa de interpretación del test |
| `github.com/MDolorsCrous/impausa-identify-bigfive` | Repo que Lovable sincroniza. Contiene el PRD en el README, no la app |
| `Projects\IDENTIFY_BIGFIVE` | Clon de ese repo. Hoy contiene solo la plantilla en blanco de Lovable |
| `Projects\IDENTIFY_IMPAUSA` | Repo vacío creado por error. No se usa |
| `Projects\LAIA_IMPAUSA` (repo `THINK_IMPAUSA`) | Otra cosa: la app de conversación LAIA del curso. Sin relación |

Cuando la app de Lovable exista de verdad, `src/` y `docs/` se mueven dentro de ella y
todo pasa a vivir en un solo sitio. Hasta entonces no se sube nada a ese repo, para no
chocar con lo que Lovable escriba por su cuenta.

## Estado

| Pieza | Dónde vive | Estado |
| --- | --- | --- |
| Especificación del BFI-2 (60 ítems, escala, fórmulas) | `docs/01` | ✅ Extraída del Excel oficial |
| Configuración y motor de puntuación | `src/` | ✅ Hecho, 13 pruebas en verde |
| Interfaz del test (responder las 60 preguntas) | Lovable | ⬜ **Sin empezar** — la app está en blanco |
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

- [`docs/01-especificacion-test.md`](docs/01-especificacion-test.md) — los 60 ítems, la escala, las fórmulas y los inversos
- [`src/README.md`](src/README.md) — cómo usar el motor de puntuación y cómo adaptarlo a otro test
- [`docs/02-modelo-interpretacion.md`](docs/02-modelo-interpretacion.md) — bandas, perfiles y reglas SI…ENTONCES
- [`docs/03-estructura-informe.md`](docs/03-estructura-informe.md) — secciones del informe y qué las alimenta
- [`docs/04-arquitectura-hibrida.md`](docs/04-arquitectura-hibrida.md) — qué calcula el código y qué redacta Claude

## Marca

Rótulo inicial, paleta y tipografía: skill `retol-test-impausa`.
Fondo crema `#FBF5E9`, tinta `#241910`, gradiente naranja→verde `#EF8A4D → #7FAE79`,
Cormorant Garamond. El titular es siempre **Identify**; debajo, pequeño, *by Impausa*.
