# Bandas, baremos y niveles de evidencia

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

---

Cada afirmación del informe se etiqueta internamente por lo que la sostiene:

| Nivel | Qué es | Cómo se redacta |
| --- | --- | --- |
| **E1** | Se lee directamente de la puntuación | Afirmación |
| **E2** | Regla de combinación del material, con cita | Afirmación, con la referencia disponible |
| **E3** | Hipótesis razonable no respaldada por el material | Pregunta o condicional |
| **E4** | Marco teórico general, no personalizado | Contexto, marcado como tal |

Nada por debajo de E2 se afirma. Un E3 se escribe «¿te reconoces en…?», no «eres…».

---
