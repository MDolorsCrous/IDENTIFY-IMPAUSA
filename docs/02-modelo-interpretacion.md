# 02 — Modelo de interpretación

Cómo se pasa de cinco medias y quince facetas a algo que signifique algo, sin inventar
nada por el camino.

Fuente del contenido: [`base-conocimiento-bfi2.md`](base-conocimiento-bfi2.md), extraída
del material de la autora. Este documento no repite ese contenido: define **cómo se usa**.

---

## El problema de fondo: no hay baremos

El motor devuelve medias de 1,00 a 5,00. Decir «tu Organización es **alta**» exige un
punto de corte, y un punto de corte honesto sale de una muestra de referencia: sin ella
no se sabe si un 3,8 está por encima o por debajo de lo habitual.

Hoy no tenemos esa muestra. Hay tres salidas, y hay que elegir una **antes** de escribir
ni una línea del informe:

| Salida | Qué implica | Rigor |
| --- | --- | --- |
| **A. Baremos publicados** | Usar medias y desviaciones típicas de la validación española del BFI-2 y convertir cada puntuación a percentil o puntuación T | El bueno. Permite decir «alta» con sentido |
| **B. Criterio explícito** | Fijar cortes sobre la escala 1–5 por criterio, y **decirlo en el informe**: «alto respecto a la escala, no respecto a una población» | Aceptable si se declara |
| **C. Muestra propia** | Recoger respuestas hasta tener una N suficiente y baremar con datos de IMPAUSA | El ideal a medio plazo |

**Recomendación: A ahora, C como objetivo.** Los datos normativos de la adaptación
española están publicados; si se consiguen medias y desviaciones típicas por dominio y
faceta, el motor los aplica sin tocar nada más — sería un fichero `baremos.json`.

Mientras tanto, **B** como puente, con estos cortes provisionales sobre la escala:

| Banda | Rango | Cómo se nombra en el informe |
| --- | --- | --- |
| Baja | 1,00 – 2,49 | «marcadamente por debajo del punto medio de la escala» |
| Media-baja | 2,50 – 2,99 | «algo por debajo» |
| Media-alta | 3,00 – 3,49 | «algo por encima» |
| Alta | 3,50 – 5,00 | «marcadamente por encima» |

> ⚠️ Estos cortes son **una decisión, no un dato**. Mientras estén vigentes, el informe
> tiene que decir literalmente que las bandas se refieren a la escala y no a una
> población de referencia. Presentarlas como percentiles sería mentir.

---

## Las tres capas de lectura

El material de la autora da exactamente estas tres, y conviene no mezclarlas:

**1. Faceta suelta.** Qué significa puntuar bajo o alto en cada una de las 15.
Es la capa más segura: viene descrita en el propio material, con referencias.

**2. Combinaciones.** Lo verdaderamente valioso. El material trae unas cuatro
combinaciones por faceta —unas 60 en total— del tipo:

> *Baja Sociabilidad + Baja Energía + Baja Confianza + Alta Depresión* → alto riesgo de
> burnout (Danner & Lechner, 2024)

Esto es una regla ejecutable: condiciones sobre facetas → efecto → cita. Es lo que hace
que el informe diga algo que la persona no podría haber deducido mirando cinco números.

**3. Resultados profesionales.** Qué predice cada faceta en el trabajo: compromiso,
comportamiento de ciudadanía organizacional, satisfacción, riesgo de agotamiento.
Alimenta la sección de aplicación al puesto.

---

## Cómo se ejecuta

Las combinaciones se guardan como **datos, no como prosa**, en
`src/config/interpretation/combinations.json`:

```json
{
  "id": "riesgo-burnout-aislamiento",
  "conditions": [
    { "facet": "sociability", "level": "low" },
    { "facet": "energy_level", "level": "low" },
    { "facet": "trust", "level": "low" },
    { "facet": "depression", "level": "high" }
  ],
  "effect": "Riesgo elevado de agotamiento profesional",
  "scope": "laboral",
  "evidence": "E2",
  "references": ["Danner & Lechner, 2024"],
  "safety": "clinico"
}
```

El motor evalúa las 60 reglas contra las bandas de la persona y devuelve las que
disparan. Determinista y auditable: siempre se puede responder «esta frase está en el
informe porque se cumplieron estas cuatro condiciones, y viene de esta referencia».

**Reglas parcialmente cumplidas.** Una regla de cuatro condiciones que cumple tres es
información, no ruido — pero no es lo mismo. Propuesta: disparar solo con **todas** las
condiciones, y guardar las que se quedan a una como *señales de atención* que Claude
puede mencionar en condicional («si además…»), nunca como afirmación.

---

## Niveles de evidencia

Cada afirmación del informe se etiqueta internamente por lo que la sostiene:

| Nivel | Qué es | Cómo se redacta |
| --- | --- | --- |
| **E1** | Se lee directamente de la puntuación | Afirmación |
| **E2** | Regla de combinación del material, con cita | Afirmación, con la referencia disponible |
| **E3** | Hipótesis razonable no respaldada por el material | Pregunta o condicional |
| **E4** | Marco teórico general, no personalizado | Contexto, marcado como tal |

Nada por debajo de E2 se afirma. Un E3 se escribe «¿te reconoces en…?», no «eres…».

---

## Protocolo de seguridad

El material incluye contenido de fondo clínico: depresión, ansiedad, burnout,
vulnerabilidad emocional, y llega a mencionar TDAH y correlatos con trastornos.
**Nada de eso puede entrar en el informe como está.**

Reglas duras:

1. **Esto no diagnostica.** Ni ansiedad, ni depresión, ni burnout. Una faceta alta de
   Depresión en el BFI-2 es una tendencia autoinformada a experimentar tristeza, no un
   trastorno del ánimo. El informe lo dice explícitamente.
2. **Vocabulario.** «Ansiedad» y «Depresión» son nombres técnicos de faceta; en el
   informe se nombran de otra forma —«Sensibilidad a la preocupación», «Tono anímico»—
   y el nombre técnico queda en la leyenda. Leer «Depresión: alta» en un informe propio
   asusta, y no es lo que el dato dice.
3. **Reglas marcadas `safety: "clinico"`** llevan siempre una salida: qué hacer, y la
   mención de que si eso encaja con lo que la persona vive, hablarlo con un profesional
   es lo razonable. Nunca se dejan como un veredicto y punto.
4. **Nada laboral punitivo.** El material trae aplicaciones de selección de personal.
   Este informe es de coaching y autoconocimiento: no dice si alguien sirve para un
   puesto. Ver las inferencias prohibidas de [`01`](01-especificacion-test.md).

---

## Qué queda por decidir

Por orden de urgencia, porque cada uno bloquea al siguiente:

1. **Los baremos.** Salida A, B o C de la tabla de arriba. Sin esto no hay bandas, y sin
   bandas no dispara ninguna regla.
2. **Los nombres visibles de las facetas**, sobre todo las tres de Emocionalidad
   negativa. Propuesta arriba, a validar.
3. **Las 60 reglas.** Están en el material en prosa; hay que pasarlas a
   `combinations.json` una a una, decidiendo para cada una sus condiciones exactas.
   Es transcripción cuidadosa, no invención.
4. **Longitud y tono del informe.** Ver [`03`](03-estructura-informe.md).
