# 04 — Arquitectura híbrida

## Reparto de responsabilidades

```
Respuestas (Lovable)
   │
   ▼
[ CÓDIGO ] puntuar → banda por dimensión → perfil → tensiones activas
   │                                    │
   │                                    └──► gráficos y secciones fijas
   ▼
{ perfil interpretado }  ── JSON cerrado ──►  [ API de Claude ]
                                                   │
                                                   ▼
                                        párrafos de coaching (§2,5,6,7,8,9)
   │
   ▼
[ CÓDIGO ] ensambla informe → pantalla → PDF / Word
```

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
