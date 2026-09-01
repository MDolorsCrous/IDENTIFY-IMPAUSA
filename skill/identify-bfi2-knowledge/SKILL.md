---
name: identify-bfi2-knowledge
description: >
  Capa de conocimiento aplicado del BFI-2 (Big Five) de Identify by Impausa: convierte unas
  puntuaciones de los 5 dominios y las 15 facetas en el contenido del informe — qué significa
  cada faceta en su nivel, las 26 combinaciones documentadas con sus citas, las señales a las que
  falta una condición, las metáforas que anclan el patrón, el tono de la casa y el protocolo de
  seguridad. Úsala siempre que haya un perfil o unas puntuaciones BFI-2 y haga falta la capa
  práctica: interpretar un perfil, redactar o enriquecer el informe de Identify, saber qué dice
  una faceta alta o baja, qué combinaciones dispara un perfil, o cómo se lee sin baremos. Activa
  también con: Identify by Impausa, BFI-2, Big Five, OCEAN, informe de personalidad, Extraversión
  Cordialidad Responsabilidad "Emocionalidad negativa" "Apertura de mente", nombres de facetas
  (Sociabilidad, Asertividad, Organización, Ansiedad…), bandas sin baremo, niveles de evidencia
  E1-E4.
---

# Identify by Impausa — capa de conocimiento del BFI-2

> Generada desde el repositorio de Identify. **No la edites a mano**: lo que cambies aquí
> se pierde en la siguiente generación, y además la separa del motor que calcula los
> informes. El sitio donde se cambia es `src/config/interpretation/`.

## Qué es esta skill y qué no es

**Es** la capa que convierte unas puntuaciones ya calculadas en contenido de informe:
qué significa cada faceta al nivel que ha salido, qué combinaciones dispara el perfil, qué
señales quedan cerca, y con qué tono se escribe todo eso.

**No es** un motor de cálculo. No puntúa el test, no recodifica ítems inversos y no
calcula medias: eso lo hace el código de Identify y tiene que ser reproducible. Si te
llegan las 60 respuestas en bruto en vez de las puntuaciones, dilo y pide las puntuaciones.

**Tampoco es** el instrumento. Los 60 ítems y las fórmulas están en
`assets/instrumento.md` para consulta, no para administrar el test por chat.

## La regla que lo gobierna todo

**Nada por debajo de E2 se afirma.** Lo que se lee de una puntuación y lo que dice una
combinación cumplida son afirmaciones; todo lo demás es pregunta o condicional. Los
niveles están en `references/bandas-y-evidencia.md`.

Y una segunda, que viene del material: **no hay puntuaciones buenas ni malas**. Son
tendencias que ayudan o estorban según el contexto, y una puntuación media suele indicar
flexibilidad, no ausencia.

## Paso 1 — Comprueba qué tienes antes de interpretar

| Si tienes | Qué hacer |
| --- | --- |
| Los 5 dominios y las 15 facetas | Adelante |
| Solo los 5 dominios | Trabaja a nivel de dominio **y dilo**. Sin facetas se pierde justo lo que el BFI-2 aporta sobre un Big Five corto |
| Las 60 respuestas en bruto | Pide las puntuaciones: puntuar no es trabajo de esta skill |
| Puntuaciones sin saber de dónde salen las bandas | Pregunta si vienen de un baremo o de la escala. Cambia lo que se puede afirmar |

**Sin baremo, «alta» significa alta respecto a la escala, no respecto a la gente.** El
informe tiene que decirlo con esas palabras. Ver `references/bandas-y-evidencia.md`.

## Paso 2 — Interpreta, en este orden

1. **Faceta a faceta** — `references/facetas.md`. Cada una en su nivel.
2. **La que se separa** — en cada dominio, si una faceta se aparta de las otras dos, esa
   es la noticia del bloque.
3. **Combinaciones** — `references/combinaciones.md`. Solo las que cumplen **todas** sus
   condiciones. Esas se pueden afirmar y citar.
4. **Señales** — las que se quedan a una condición. En condicional y sin cita.
5. **Metáforas** — `references/metaforas.md`. Tres en todo el informe y una de ancla.

## Paso 3 — Redacta

El tono, las longitudes por sección y el esquema de salida están en
`references/informe.md`, copiados del encargo que usa el comando, para que la skill y el
código pidan exactamente lo mismo.

Tres reglas de las que no se sale:

1. **Atribuye a los resultados**, no a la persona: «los resultados muestran», «tu perfil
   tiende a», «esto sugiere».
2. **Matiza**: «puede», «tiende a», «suele». Nunca un absoluto sobre alguien.
3. **Termina en algo accionable.** Si nombras un coste, di qué hacer con él.

## Paso 4 — Filtro de salida

Antes de entregar, repasa:

- ¿Están todas las secciones del esquema, con sus longitudes?
- ¿Hay algo afirmado que no salga de una puntuación o de una regla cumplida?
- ¿Alguna señal escrita como si se cumpliera?
- ¿Alguna regla clínica sin salida, o alguna delicada describiendo a la persona en vez de
  al patrón? Ver `references/seguridad.md`.
- ¿Más de tres metáforas, o alguna de una categoría excluida?
- ¿Aparece «Ansiedad» o «Depresión» leído como diagnóstico?

## Uso con las otras skills de la casa

- **`laia-coach`** — cuando Identify se cruza con otros instrumentos. Esta skill aporta la
  lectura del BFI-2; el informe integrativo de 14 secciones lo monta esa.
- **`metaforas-coaching`** — el catálogo completo. Aquí van solo las categorías que tocan
  al BFI-2, con sus reglas de uso.
- **`executive-coach-senior`** — los marcos de asertividad, conflicto y regulación
  emocional de los que salen las preguntas y el plan de acción.

## Tono

Próximo, profesional, humano, claro, motivador, profundo, respetuoso, fácil de entender,
práctico, accionable, prudente y no repetitivo. Nada grandilocuente:

| No | Sí |
| --- | --- |
| «Eres una fuerza imparable» | «Los resultados muestran una alta orientación a la acción» |
| «Eres una líder nata» | «Tu perfil puede aportar foco, dirección y capacidad de avance» |
| «Tu mente está programada para…» | «Puedes tender a tomar decisiones con rapidez» |

Segunda persona. Nunca etiquetes: «tu patrón tiende a…», no «eres un X». Toda debilidad,
con su palanca al lado. Ningún halago vacío.
