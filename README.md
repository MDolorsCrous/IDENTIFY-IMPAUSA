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
| Especificación del BFI-2 (60 ítems, escala, fórmulas) | `docs/01` | ✅ Verificada contra Excel y PDF |
| Configuración y motor de puntuación | `src/` | ✅ Hecho |
| Interfaz del test (responder las 60 preguntas) | `tools/render-test.mjs` | ✅ Prototipo funcionando |
| Conexión test → informe | `generar.js` y el botón del test | ✅ El test genera el informe |
| Metáforas del informe | `src/config/interpretation/metaforas.json` | ✅ Del catálogo de la skill |
| Base de conocimiento (15 facetas, ~60 combinaciones) | `docs/base-conocimiento-bfi2.md` | ✅ Extraída del material |
| Modelo de interpretación (bandas, reglas, seguridad) | `docs/02` | ✅ Diseñado |
| Reglas de combinación (26, con cita) | `src/config/interpretation/` | ✅ Transcritas |
| Motor de bandas e interpretación | `src/services/interpretation.ts` | ✅ Hecho |
| Estructura del informe | `docs/03` | ✅ Diseñada |
| Ensamblador del informe | `src/services/report.ts` | ✅ Hecho |
| Lecturas de las 15 facetas (alto y bajo) | `src/config/interpretation/facetas.json` | ✅ Conectadas al informe |
| Encargo de redacción para Claude | `src/services/prompt.ts` + `--prompt` | ✅ Hecho, con paso manual |
| Llamada automática a la API | — | ⬜ Falta clave y dependencias |
| Calibración de las reglas | `docs/02` | 🟡 Parametrizada, **a decidir con datos** |
| Baremos españoles (medias y DT) | `docs/baremos-propuesta.md` | 🟡 Encontrados, **en espera de validación** |
| Informe en pantalla (estructura + gráficos) | app | ⬜ Pendiente |
| Párrafos de coaching redactados por Claude | API de Claude | ⬜ Pendiente |
| Exportación PDF / Word con marca LivePausa | app | ⬜ Pendiente |
| Skill del BFI-2 (`identify-bfi2-knowledge`) | `skill/`, generada con `tools/gen-skill.mjs` | ✅ Hecha |

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
- [`docs/02-modelo-interpretacion.md`](docs/02-modelo-interpretacion.md) — bandas, reglas de combinación, evidencia y seguridad
- [`docs/baremos-propuesta.md`](docs/baremos-propuesta.md) — los baremos publicados y sus problemas, a validar con Elisenda
- [`docs/base-conocimiento-bfi2.md`](docs/base-conocimiento-bfi2.md) — el material de interpretación, por faceta
- [`docs/03-estructura-informe.md`](docs/03-estructura-informe.md) — secciones del informe y qué las alimenta
- [`docs/04-arquitectura-hibrida.md`](docs/04-arquitectura-hibrida.md) — qué calcula el código y qué redacta Claude

## La skill

`skill/identify-bfi2-knowledge/` lleva el conocimiento del BFI-2 a cualquier conversación:
las lecturas de las 15 facetas, las 26 combinaciones con sus citas, las metáforas, el tono
y el protocolo de seguridad. Con ella cargada, redactar un informe es pegarle el perfil.

**No se edita a mano: se genera.**

```
node tools/gen-skill.mjs
```

Lee los mismos JSON que usa el motor, así que la skill no puede decir una cosa y el informe
otra. Si alguien la edita a mano, `tests/skill.test.ts` se pone roja. Salen tres formatos:
la carpeta (Claude Code), `identify-bfi2-knowledge.skill` (para subir a la web) y
`todo-en-uno/SKILL.md` (un solo fichero, con las referencias como anexos).

Está instalada en `C:\Users\maria\.claude\skills\identify-bfi2-knowledge\`, así que vale para
todas las conversaciones y no solo para este proyecto. **Es una copia**: cada vez que
regeneres la skill hay que volver a ponerla ahí, o la instalada se queda vieja.

```
cp -r skill/identify-bfi2-knowledge "$HOME/.claude/skills/"
```

### Empaquetar cualquier skill

`tools/empaquetar-skill.mjs` convierte una carpeta de `~/.claude/skills/` en el `.skill`
que pide claude.ai. Hace falta porque `Compress-Archive` guarda las rutas con barra
invertida y un paquete así no sube.

```
node tools/empaquetar-skill.mjs --todas
```

Los deja en `~/.claude/skills/paquetes-para-subir/`, cada uno con las dos extensiones:
`.zip` para «Customize > Skills» de claude.ai, `.skill` para arrastrarlo al chat.

Comprueba antes de empaquetar que el `name` del frontmatter coincide con la carpeta y que
la descripción no pasa de **1024 caracteres**, que es lo que admite claude.ai. Ese límite
solo se ve al subir, cuando ya has perdido el viaje. Es el segundo paso obligatorio cada
vez que se toca una skill: **la copia de disco y la de la cuenta de claude.ai son
independientes**, y en Claude Code manda la de disco. Si solo se actualiza una, las dos
dicen cosas distintas sin avisar.

Cuando la conversación ya la tiene cargada, el encargo de redacción no necesita repetir el
tono ni el método:

```
node generar.js datos/fichero.json --prompt --corto
```

## Marca

Rótulo inicial, paleta y tipografía: skill `retol-test-impausa`.
Fondo crema `#FBF5E9`, tinta `#241910`, gradiente naranja→verde `#EF8A4D → #7FAE79`,
Cormorant Garamond. El titular es siempre **Identify**; debajo, pequeño, *by Impausa*.
