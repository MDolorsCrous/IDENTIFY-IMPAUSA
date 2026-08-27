# 03 — Estructura del informe

Doce secciones. Cada una declara **qué la alimenta**: `código` cuando es determinista y
sale de las puntuaciones, `Claude` cuando hay que redactarla.

La regla que ordena todo: **el código decide qué se dice, Claude decide cómo se dice.**
Ninguna sección deja que el modelo elija el contenido.

| # | Sección | Fuente | Qué contiene |
| --- | --- | --- | --- |
| 0 | Portada | código | Rótulo *Identify by Impausa*, nombre, fecha |
| 1 | Cómo leer esto | código | Texto fijo: qué es, qué no es, contra qué se compara |
| 2 | Tu perfil en una frase | código + Claude | Titular determinista + un párrafo personalizado |
| 3 | Los cinco dominios | código | Gráfico con las cinco puntuaciones y sus bandas |
| 4 | Dominio a dominio | código + Claude | Cada dominio con sus tres facetas: dato, lectura, matiz |
| 5 | Lo que aparece al cruzarlas | código + Claude | Las reglas que han disparado, con su efecto |
| 6 | Señales de atención | código + Claude | Reglas a las que les falta una condición, en condicional |
| 7 | En el trabajo | código + Claude | Resultados profesionales de las facetas destacadas |
| 8 | Preguntas para llevarte | Claude | 5–7 preguntas ancladas a lo que ha disparado |
| 9 | Tres experimentos | Claude | Acciones concretas, cada una con su indicador |
| 10 | Una imagen | skill `metaforas-coaching` | 1–2 metáforas que reencuadren el patrón |
| 11 | Límites y buen uso | código | Texto fijo: alcance, caducidad, confidencialidad |
| — | Leyenda y referencias | código | Bandas, nombres técnicos, bibliografía citada |

---

## Los nombres que ve la persona

Los nombres técnicos de las facetas de Emocionalidad negativa no pueden aparecer tal
cual: leer «Depresión: alta» en un informe propio asusta, y **no es lo que el dato dice**.

| Nombre técnico | Nombre en el informe |
| --- | --- |
| Emocionalidad negativa (dominio) | Sensibilidad emocional |
| Ansiedad | Sensibilidad a la preocupación |
| Depresión | Tono anímico |
| Volatilidad emocional | Reactividad emocional |

Los doce restantes se quedan como están: no hay problema con «Organización» ni con
«Curiosidad intelectual».

El nombre técnico aparece **una vez**, en la leyenda, junto al visible. Ni se oculta ni
se pone donde duele. Ver el protocolo de seguridad de [`02`](02-modelo-interpretacion.md).

> Pendiente de validar con Elisenda: renombrar un dominio no es inocuo si luego alguien
> compara el informe con la literatura. Por eso la leyenda.

---

## Sección 1 — Cómo leer esto

Va la primera y es texto fijo. Tiene que decir cuatro cosas, sin rodeos:

1. **Qué mide.** Tendencias de comportamiento autoinformadas, estables pero no fijas.
2. **Qué no es.** No es un diagnóstico, no mide inteligencia, no dice si alguien sirve
   para un puesto, y no predice lo que va a hacer.
3. **Contra qué se compara.** Mientras no haya baremo validado: «las bandas indican
   posición respecto a la escala del cuestionario, no respecto a una población». Con
   baremo: la muestra concreta, con su cita.
4. **Que no hay puntuaciones buenas ni malas.** Es literal del material de origen: son
   tendencias adaptativas según el contexto, y una puntuación media suele indicar
   flexibilidad.

---

## Sección 4 — Dominio a dominio

Cinco bloques iguales. Cada uno:

- La puntuación del dominio y su banda.
- Sus **tres facetas**, porque es lo que aporta el BFI-2 frente a un Big Five corto: dos
  personas con la misma Cordialidad pueden tener una alta Compasión y baja Confianza, o
  al revés, y eso se lee distinto.
- Si las tres facetas van juntas, se dice. Si una se separa del resto, **eso es la
  noticia** del bloque y va destacado.

**Prudencia por fiabilidad.** Las facetas del BFI-2 son escalas de cuatro ítems y diez de
las quince quedan por debajo de .70 en la adaptación española. Las afirmaciones de
dominio van con normalidad; las de faceta suelta, con matiz. Ver
[`baremos-propuesta.md`](baremos-propuesta.md).

---

## Secciones 5 y 6 — Las reglas

Es la parte que justifica el informe entero. La sección 5 lleva las reglas que han
disparado; la 6, las que se quedan a una condición.

**Y se redactan distinto, siempre:**

| | Sección 5 | Sección 6 |
| --- | --- | --- |
| Cuándo | Todas las condiciones cumplidas | Falta exactamente una |
| Cómo se escribe | Afirmación | Condicional: «si además…» |
| Cita | Disponible | No se cita: no se ha cumplido |

Orden: primero las de más condiciones, que son las más específicas y dicen más. Si no
dispara ninguna regla, la sección lo dice con naturalidad —«tu perfil no activa ninguna
de las combinaciones descritas en la literatura»— y no se rellena con paja.

**Las reglas marcadas `safety: "clinico"`** no aparecen nunca solas: llevan qué hacer, y
la mención de que si eso encaja con lo que la persona vive, hablarlo con un profesional
es lo razonable.

**Las marcadas `safety: "delicado"`** —orientación al poder, hostilidad, hedonismo—
describen un patrón, nunca a la persona. «Esta combinación se asocia con…», no «eres
manipulador». Y siempre con la palanca al lado.

---

## Tono

Segunda persona, adulto, cálido y directo. Sin jerga sin explicar.

- **Nunca etiquetar.** «Tu patrón tiende a…», no «eres un X».
- **Toda debilidad con su palanca.** Si algo se nombra como coste, se dice qué hacer.
- **Nada de halago vacío.** Un informe que solo dice cosas bonitas no sirve para nada.
- **El dato antes que la interpretación.** Primero el número, después qué sugiere.

---

## Longitud

| Sección | Objetivo |
| --- | --- |
| 2 — Perfil en una frase | 1 titular + 120–150 palabras |
| 4 — Dominio a dominio | 150–200 palabras por dominio |
| 5 — Reglas disparadas | 80–120 palabras por regla |
| 6 — Señales | 40–60 palabras por señal |
| 7 — En el trabajo | 200–250 palabras |
| 8 — Preguntas | 5–7, una línea cada una |
| 9 — Experimentos | 3, unas 60 palabras cada uno |

En total, entre 1.800 y 2.500 palabras: unas 8–10 páginas con los gráficos. Suficiente
para decir algo, corto para que se lea entero.

> Pendiente de decidir: si esto encaja con lo que tenías en mente o lo quieres más breve.

---

## Lo que Claude recibe y devuelve

Nunca ve respuestas crudas ni puntúa nada. Recibe el modelo del informe ya resuelto
—bandas, reglas disparadas, señales— y devuelve **solo texto**, con esquema cerrado: una
clave por sección y longitud máxima por campo.

Si la llamada falla, el informe sale igualmente con las secciones deterministas y un
aviso. Ver [`04`](04-arquitectura-hibrida.md).
