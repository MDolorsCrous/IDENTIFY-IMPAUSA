# 03 — Estructura del informe

Once secciones más portada e índice. Cada una declara **qué la alimenta**: `código` cuando es determinista y
sale de las puntuaciones, `Claude` cuando hay que redactarla.

La regla que ordena todo: **el código decide qué se dice, Claude decide cómo se dice.**
Ninguna sección deja que el modelo elija el contenido.

| # | Sección | Fuente | Qué contiene |
| --- | --- | --- | --- |
| 0 | Portada | código | Rótulo *Identify by Impausa*, nombre, fecha |
| 0b | Índice de navegación | código | Elemento de la casa: las once secciones, enlazadas |
| 1 | Cómo leer esto | código | Texto fijo: qué es, qué no es, contra qué se compara |
| 2 | Tu perfil en una frase | código + Claude | Titular determinista + un párrafo personalizado |
| 3 | Los cinco dominios | código | Gráfico con las cinco puntuaciones y sus bandas |
| 4 | Dominio a dominio | código + Claude | Cada dominio con sus tres facetas: dato, lectura, matiz |
| 5 | Lo que aparece al cruzarlas | código + Claude | Las reglas que han disparado, con su efecto |
| 6 | Señales de atención | código + Claude | Reglas a las que les falta una condición, en condicional |
| 7 | En el trabajo | código + Claude | Resultados profesionales de las facetas destacadas |
| 8 | Preguntas poderosas | Claude | 5–7 preguntas ancladas a lo que ha disparado |
| 9 | Plan de acción | Claude | 3 acciones concretas, cada una con su indicador |
| 10 | Conclusiones | Claude | Cierre: la fortaleza y el trabajo más rentable a corto plazo |
| 11 | Fuentes y metodología | código | Instrumento, adaptación, referencias citadas |
| 12 | Aviso importante | código | Alcance, prudencia con las facetas, confidencialidad |

---

## Los nombres que ve la persona

**Se mantiene la nomenclatura original del BFI-2.** Decisión de la autora, 27-08-2026.

Se valoró renombrar las tres facetas de Emocionalidad negativa, porque leer «Depresión:
alta» en un informe propio puede asustar. Se descartó: los nombres del instrumento
permiten contrastar el informe con cualquier otra fuente, y cambiarlos rompe esa
trazabilidad.

Lo que sí cambia es **dónde vive la aclaración**. Al conservar los nombres, la
explicación no puede esconderse en una leyenda al final: acompaña al dominio, justo
donde aparecen las puntuaciones.

> Los nombres de estas tres facetas —Ansiedad, Depresión, Volatilidad emocional— son los
> términos técnicos del cuestionario, y describen tendencias normales de la personalidad.
> No son condiciones clínicas ni tienen nada que ver con un diagnóstico.

Está en `src/i18n/es-informe.json`, en `notas`. Si algún día se decide renombrar algo,
basta con rellenar `renombradas`: la leyenda de equivalencias reaparece sola.

---

## Tono

**Está documentado, y no hay que inventarlo.** La skill `disc-insight-coach` fija el tono
de los informes de LivePausa / IMPAUSA:

> próximo · profesional · humano · claro · motivador · profundo · respetuoso · fácil de
> entender · práctico · accionable · prudente · no clínico · no repetitivo

Y prohíbe expresamente lo grandilocuente, con estos tres ejemplos:

| No | Sí |
| --- | --- |
| «Eres una fuerza imparable» | «Los resultados muestran una alta orientación a la acción» |
| «Eres una líder nata» | «Tu perfil puede aportar foco, dirección y capacidad de avance» |
| «Tu mente está programada para…» | «Puedes tender a tomar decisiones con rapidez» |

De ahí salen tres reglas prácticas para redactar cada sección:

1. **Atribuir a los resultados**, no a la persona: «los resultados muestran», «tu perfil
   tiende a», «esto sugiere».
2. **Matizar**: «puede», «tiende a», «suele». Nunca un absoluto sobre alguien.
3. **Terminar en algo accionable.** Si se nombra un coste, se dice qué hacer con él.

Además: segunda persona, sin jerga sin explicar, y nunca etiquetar («tu patrón tiende
a…», no «eres un X»).

---

## Identidad visual

También documentada, y **no es la del rótulo**. Son dos cosas distintas:

| Elemento | Fuente | Qué fija |
| --- | --- | --- |
| El rótulo *Identify by Impausa* de portada | skill `retol-test-impausa` | Serif editorial, degradado naranja→verde en «by Impausa», ancho idéntico al titular |
| Todo lo demás del informe | skill `disc-insight-coach` | Verde `#1A4A3A`, verde medio `#2D6B57`, beige `#F7F2EB`, naranja `#E8842A`, borde `#E0D9D0` |

**Tipografía: Playfair Display + Source Sans 3.** Resuelve la aparente contradicción entre
las dos skills: el rótulo pide Cormorant Garamond, pero admite Playfair Display como
alternativa, y es justo la que pide el informe. Con una sola serif se cumplen las dos.

**El naranja se reserva para señalar**, no para decorar: marca la faceta que se separa de
las otras dos de su dominio. Las barras van todas en verde medio. Un solo acento, y que
signifique algo.

Formato A4 vertical, márgenes amplios, interlineado cómodo y párrafos cortos, con estilos
de impresión para exportar a PDF.

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

## Longitud

| Sección | Objetivo |
| --- | --- |
| 2 — Perfil en una frase | 1 titular + 120–150 palabras |
| 4 — Dominio a dominio | 150–200 palabras por dominio |
| 5 — Reglas disparadas | 80–120 palabras por regla |
| 6 — Señales | 40–60 palabras por señal |
| 7 — En el trabajo | 200–250 palabras |
| 8 — Preguntas | 5–7, una línea cada una |
| 9 — Plan de acción | 3 pasos, unas 60 palabras cada uno |
| 10 — Conclusiones | 80–120 palabras |

En total, entre 1.800 y 2.500 palabras: unas 8–10 páginas con los gráficos. Suficiente
para decir algo, corto para que se lea entero.

Confirmado por la autora el 27-08-2026: **ocho páginas**.

---

## Lo que Claude recibe y devuelve

Nunca ve respuestas crudas ni puntúa nada. Recibe el modelo del informe ya resuelto
—bandas, reglas disparadas, señales— y devuelve **solo texto**, con esquema cerrado: una
clave por sección y longitud máxima por campo.

Si la llamada falla, el informe sale igualmente con las secciones deterministas y un
aviso. Ver [`04`](04-arquitectura-hibrida.md).
