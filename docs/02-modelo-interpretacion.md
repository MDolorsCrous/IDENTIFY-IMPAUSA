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

**Decidido: A**, con C como objetivo a medio plazo.

El motor ya está preparado. `band(score, norm)` calcula z, percentil y puntuación T en
cuanto reciba medias y desviaciones típicas, y la banda pasa a salir de los cuartiles de
la distribución: «alta» significa entonces alta **respecto a una población**. Falta solo
el dato. Formato esperado, `src/config/baremos.json`:

```json
{
  "fuente": "Gallardo-Pujol et al. — validación española del BFI-2",
  "muestra": { "n": 0, "descripcion": "", "anyo": 0 },
  "normas": {
    "extraversion":  { "mean": 0.00, "sd": 0.00 },
    "sociability":   { "mean": 0.00, "sd": 0.00 }
  }
}
```

Hacen falta media y desviación típica de los **5 dominios y las 15 facetas**. Si el
baremo viene segmentado por sexo o edad, mejor: el motor puede escoger el que toque.

> **Lo que no voy a hacer es rellenar ese fichero con números de memoria.** Un baremo
> inventado es peor que no tener baremo, porque parece riguroso. Necesito el dato de la
> publicación.

Mientras no llegue, el motor cae automáticamente a **B** y marca cada banda con
`method: "escala"`, para que el informe pueda decirlo. Cortes provisionales:

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

**2. Combinaciones.** Lo verdaderamente valioso. El material trae entre dos y cuatro
combinaciones por faceta, **43 entradas de tabla que deduplican a 26 reglas únicas** —la
del riesgo de burnout, por ejemplo, aparece en las tablas de Sociabilidad, Nivel de
Energía y Confianza—. Son del tipo:

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

El motor evalúa las 26 reglas contra las bandas de la persona y devuelve las que
disparan. Determinista y auditable: siempre se puede responder «esta frase está en el
informe porque se cumplieron estas cuatro condiciones, y viene de esta referencia».

**Reglas parcialmente cumplidas.** Una regla de cuatro condiciones que cumple tres es
información, no ruido — pero no es lo mismo. Propuesta: disparar solo con **todas** las
condiciones, y guardar las que se quedan a una como *señales de atención* que Claude
puede mencionar en condicional («si además…»), nunca como afirmación.

### La calibración, que no tiene respuesta obvia

Al probar el motor con el caso de ejemplo apareció un problema que conviene decidir a
conciencia. Cuando una regla dice «Alta Sociabilidad», ¿qué banda la cumple?

| Criterio | Qué cumple | Resultado con el caso de ejemplo |
| --- | --- | --- |
| Amplio | «alta» y «media-alta» | 2 reglas disparadas y **14 señales** de 26 |
| Estricto | solo «alta» | **0 disparadas** y 6 señales |

Ninguno de los dos sirve tal cual. Con el amplio, la sección de señales es un muro de
«si además…» y el informe pierde credibilidad: media España roza media literatura. Con
el estricto, una regla de tres condiciones exige tres extremos simultáneos y casi nadie
los tiene, así que la sección principal se queda vacía.

**Está implementado como parámetro** (`ESTRICTO` por defecto, `AMPLIO` disponible) en
lugar de escondido en una constante, porque la respuesta correcta depende de dos cosas
que aún no tenemos:

1. **Los baremos.** Con percentiles, «alta» pasa a ser el cuartil superior, y eso cambia
   la frecuencia con la que dispara cada regla.
2. **Casos reales.** Con veinte o treinta perfiles de verdad se puede medir cuántas
   reglas dispara cada criterio y elegir con datos, en vez de a ojo.

Mientras tanto, el informe tiene que funcionar también cuando **no dispara nada**: la
sección lo dice con naturalidad y el peso recae en el recorrido dominio a dominio. Un
informe honesto que dice poco es mejor que uno que fuerza las reglas para tener relleno.

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

1. **Los datos del baremo.** Decidida la salida A, falta el dato: medias y desviaciones
   típicas de los 5 dominios y las 15 facetas, de la validación española. Es lo único
   que separa un «alto respecto a la escala» de un «alto respecto a la población».
2. **Los nombres visibles de las facetas**, sobre todo las tres de Emocionalidad
   negativa. Propuesta en el protocolo de seguridad, a validar.
3. **Las tres reglas marcadas `revision`.** En el material original, «responsabilidad»
   unas veces nombra la faceta y otras el dominio entero. En esas tres se ha interpretado
   como faceta; conviene que lo confirmes.
4. **Longitud y tono del informe.** Ver [`03`](03-estructura-informe.md).

Ya no queda por decidir la transcripción de las reglas: están las 26 en
`src/config/interpretation/combinations.json`, cada una con sus condiciones, su cita y la
diapositiva de la que sale.

---

## Si el cuestionario se ha contestado sin leerlo

Los 60 ítems llevan la mitad invertidos para cancelar la aquiescencia, y funciona
tan bien que **contestar 5 a todo da exactamente el mismo perfil que contestar 1 a
todo y que contestar 3 a todo**: 3,00 en los cinco dominios, banda media-alta.
Correcto psicométricamente, y desastroso como producto: sin nada que lo mire,
quien pulsa sesenta veces el mismo botón recibe un informe de novecientas
palabras sobre un perfil que no existe.

`src/services/atencion.ts` mira **la forma de las respuestas en bruto** —antes de
recodificar los inversos, que es lo único que distingue un «todo 5» de un perfil
moderado de verdad— y no toca ni una puntuación.

### Dos indicadores, porque ninguno solo llega

| Patrón | desviación | racha | valores |
| --- | --- | --- | --- |
| Una persona de verdad | 1,42 | 2 | 5 |
| Todo igual | 0 | 60 | 1 |
| 5, 4, 5, 4… | 0,50 | **1** | 2 |
| 30 iguales y luego varía | 1,12 | **30** | 5 |

La racha no ve el alternado; la variedad no ve la racha.

### Los umbrales

**Son decisiones nuestras, no cortes validados.** Están puestos con holgura sobre
lo que hace una persona de verdad —racha de 2 y cinco valores— para avisar del
descuido evidente sin acusar a quien contesta de forma moderada:

- **`nula`**: un solo valor en los 60 ítems. No hay lectura posible, y el informe
  escrito no se ofrece ni se pide al servidor.
- **`dudosa`**: racha ≥ 12, o dos valores o menos, o desviación < 0,5. Se avisa y
  se sigue.

Igual que las bandas, esto se recalibra el día que haya datos de más gente.

### Lo que NO detecta

Un ciclo 1, 2, 3, 4, 5 repetido da desviación 1,41, racha 1 y los cinco valores:
**indistinguible de una persona real** con estas medidas. No hay índice sencillo
que lo pille, y decir lo contrario sería vender humo.
