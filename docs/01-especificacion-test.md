# 01 — Especificación del test Identify (BFI-2)

> **Fuente de verdad:** `BFI-2_formules_correctes_inversos.xlsx`
> (`Documents\00 FITXERS PC ANTIC 2026 AGOST - RAMO\10_IMPAUSA\coaching_eines\`).
> Los textos de los ítems de esta tabla están copiados del fichero, no transcritos a mano.

## Constructo

**BFI-2** (Big Five Inventory–2, Soto & John 2017), versión en español. Mide los cinco
grandes dominios de personalidad y sus 15 facetas, 3 por dominio.

- **Qué mide:** tendencias de comportamiento autoinformadas, estables en el tiempo.
- **Qué NO mide:** capacidad intelectual, salud mental, idoneidad para un puesto,
  ni predice rendimiento. No es una prueba clínica ni de selección.
- **Uso previsto:** coaching y autoconocimiento.
- Más información y material oficial: https://osf.io/kp572/files/osfstorage

## Escala de respuesta

Cinco puntos, sin modificar:

| Valor | Etiqueta |
| --- | --- |
| 1 | Muy en desacuerdo |
| 2 | Algo en desacuerdo |
| 3 | Neutral, sin opinión |
| 4 | Algo de acuerdo |
| 5 | Muy de acuerdo |

Enunciado común a todos los ítems: **«Soy alguien que…»**

## Puntuación

1. **Ítems inversos:** `puntuación = 6 − respuesta`. No se usa ninguna otra fórmula.
2. **Faceta:** media aritmética de sus 4 ítems ya recodificados.
3. **Dominio:** media aritmética de sus 12 ítems ya recodificados
   (equivale a la media de sus 3 facetas, porque todas pesan igual).

Rango de cualquier faceta o dominio: **1,00 – 5,00**.

> Verificado: aplicando estas reglas al juego de respuestas de ejemplo del Excel se
> reproducen exactamente los 15 valores de faceta y los 5 de dominio que el propio
> fichero ya tenía calculados. La asignación ítem → faceta → dominio no es una
> suposición: la confirma el fichero.

## Estructura

| Dominio | Faceta | Ítems |
| --- | --- | --- |
| **Extraversión** | Sociabilidad | 1, 16, 31, 46 |
|  | Asertividad | 6, 21, 36, 51 |
|  | Nivel de Energía | 11, 26, 41, 56 |
| **Cordialidad** | Compasión | 2, 17, 32, 47 |
|  | Respeto | 7, 22, 37, 52 |
|  | Confianza | 12, 27, 42, 57 |
| **Responsabilidad** | Organización | 3, 18, 33, 48 |
|  | Productividad | 8, 23, 38, 53 |
|  | Responsabilidad | 13, 28, 43, 58 |
| **Emocionalidad negativa** | Ansiedad | 4, 19, 34, 49 |
|  | Depresión | 9, 24, 39, 54 |
|  | Volatilidad Emocional | 14, 29, 44, 59 |
| **Apertura de mente** | Curiosidad Intelectual | 10, 25, 40, 55 |
|  | Sensibilidad Estética | 5, 20, 35, 50 |
|  | Imaginación Creativa | 15, 30, 45, 60 |

## Ítems inversos (30 de 60)

3, 4, 5, 8, 9, 11, 12, 16, 17, 22, 23, 24, 25, 26, 28, 29, 30, 31, 36, 37, 42, 44, 45, 47, 48, 49, 50, 51, 55, 58

De estos, **29 se deducen del propio Excel** comparando cada respuesta de ejemplo con
su valor recodificado. Los ítems **34, 43 y 55** tienen respuesta 3 en el ejemplo, y
como `6 − 3 = 3` su polaridad no se puede deducir del fichero. Se han asignado según
la clave estándar del BFI-2 (34 directo, 43 directo, **55 inverso**), lo que da los 30
ítems inversos que tiene el instrumento oficial.

> ⚠️ **Pendiente de confirmar.** El Excel remite al PDF (`Els ítems marcats amb R al PDF
> es recodifiquen com 6 - resposta`), pero `Spanish BFI-2 Form (1).pdf` es un escaneado
> sin capa de texto. Hay que abrirlo y comprobar a ojo si 34, 43 y 55 llevan la marca R.
> Es la única pieza de la especificación que no está verificada contra fuente.

## Los 60 ítems

| # | Texto | Dominio | Faceta | Polaridad |
| --- | --- | --- | --- | --- |
| 1 | Abierto/a, sociable. | Extraversión | Sociabilidad | directo |
| 2 | Compasivo/a, con un gran corazón. | Cordialidad | Compasión | directo |
| 3 | Que tiende a ser desorganizado/a. | Responsabilidad | Organización | **inverso** |
| 4 | Relajado/a, que gestiona bien el estrés. | Emocionalidad negativa | Ansiedad | **inverso** |
| 5 | Con pocos intereses artísticos. | Apertura de mente | Sensibilidad Estética | **inverso** |
| 6 | Con una personalidad asertiva. | Extraversión | Asertividad | directo |
| 7 | Respetuoso/a, que trata a los demás con respeto. | Cordialidad | Respeto | directo |
| 8 | Que tiende a ser perezoso/a. | Responsabilidad | Productividad | **inverso** |
| 9 | Que se mantiene optimista después de sufrir un contratiempo. | Emocionalidad negativa | Depresión | **inverso** |
| 10 | Que siente curiosidad por gran variedad de cosas. | Apertura de mente | Curiosidad Intelectual | directo |
| 11 | Que raramente se siente emocionado/a o entusiamado/a. | Extraversión | Nivel de Energía | **inverso** |
| 12 | Que tiende a buscar los defectos de los demás. | Cordialidad | Confianza | **inverso** |
| 13 | Formal, constante. | Responsabilidad | Responsabilidad | directo |
| 14 | Variable, con notables cambios de humor. | Emocionalidad negativa | Volatilidad Emocional | directo |
| 15 | Ingenioso/a, que busca formas inteligentes de hacer las cosas. | Apertura de mente | Imaginación Creativa | directo |
| 16 | Que tiende a estar callado/a. | Extraversión | Sociabilidad | **inverso** |
| 17 | Que siente poca compasión hacia los demás. | Cordialidad | Compasión | **inverso** |
| 18 | Metóidico/a, a quien le gusta mantenerlo todo en orden. | Responsabilidad | Organización | directo |
| 19 | Que puede ponerse tenso/a. | Emocionalidad negativa | Ansiedad | directo |
| 20 | Fascinado/a por el arte, la música o la literatura. | Apertura de mente | Sensibilidad Estética | directo |
| 21 | Dominante, que actúa como líder. | Extraversión | Asertividad | directo |
| 22 | Que empieza discusiones con los demás. | Cordialidad | Respeto | **inverso** |
| 23 | A quién le cuesta empezar las tareas. | Responsabilidad | Productividad | **inverso** |
| 24 | Que se siente seguro/a, cómodo/a consigo mismo/a. | Emocionalidad negativa | Depresión | **inverso** |
| 25 | Que evita conversaciones intelectuales y filosóficas. | Apertura de mente | Curiosidad Intelectual | **inverso** |
| 26 | Menos activo/a que otras personas. | Extraversión | Nivel de Energía | **inverso** |
| 27 | Comprensivo/a con los demás. | Cordialidad | Confianza | directo |
| 28 | Que puede ser algo descuidado/a. | Responsabilidad | Responsabilidad | **inverso** |
| 29 | Emocionalmente estable, que no se altera con facilidad. | Emocionalidad negativa | Volatilidad Emocional | **inverso** |
| 30 | Con poca creatividad. | Apertura de mente | Imaginación Creativa | **inverso** |
| 31 | A veces tímido, introvertido/a. | Extraversión | Sociabilidad | **inverso** |
| 32 | IServicial y generoso/a con los demás. | Cordialidad | Compasión | directo |
| 33 | Que mantiene todo limpio y ordenado. | Responsabilidad | Organización | directo |
| 34 | Que se preocupa mucho. | Emocionalidad negativa | Ansiedad | directo ⚠️ |
| 35 | Que valora el arte y la belleza. | Apertura de mente | Sensibilidad Estética | directo |
| 36 | A quién le es difícil influir en los demás. | Extraversión | Asertividad | **inverso** |
| 37 | Que a veces es grosero/a con los demás. | Cordialidad | Respeto | **inverso** |
| 38 | Eficiente, que consigue que las cosas se hagan. | Responsabilidad | Productividad | directo |
| 39 | Que a menudo se siente triste. | Emocionalidad negativa | Depresión | directo |
| 40 | Complejo/a, de pensamientos profundos. | Apertura de mente | Curiosidad Intelectual | directo |
| 41 | Lleno de energía. | Extraversión | Nivel de Energía | directo |
| 42 | Que desconfia de las intenciones de los demás. | Cordialidad | Confianza | **inverso** |
| 43 | Fiable, con el/la que siempre se puede contar. | Responsabilidad | Responsabilidad | directo ⚠️ |
| 44 | Que controla sus emociones. | Emocionalidad negativa | Volatilidad Emocional | **inverso** |
| 45 | Que tiene dificultad para imaginarse las cosas. | Apertura de mente | Imaginación Creativa | **inverso** |
| 46 | Hablador/a. | Extraversión | Sociabilidad | directo |
| 47 | Que puede ser frío/a e insensible. | Cordialidad | Compasión | **inverso** |
| 48 | Que lo deja todo hecho un lío, que no limpia. | Responsabilidad | Organización | **inverso** |
| 49 | Que raramente se siente ansioso/a o miedoso/a. | Emocionalidad negativa | Ansiedad | **inverso** |
| 50 | Que considera que la poesía y el teatro son aburridos. | Apertura de mente | Sensibilidad Estética | **inverso** |
| 51 | Que prefiere que otros/as asuman la responsabilidad. | Extraversión | Asertividad | **inverso** |
| 52 | Educado/a, cortés con los demás. | Cordialidad | Respeto | directo |
| 53 | Tenaz, que trabaja hasta terminar la tarea. | Responsabilidad | Productividad | directo |
| 54 | Que tiende a sentirse deprimido/a, melancólico/a. | Emocionalidad negativa | Depresión | directo |
| 55 | Con poco interés por ideas abstractas. | Apertura de mente | Curiosidad Intelectual | inverso ⚠️ |
| 56 | Que muestra mucho entusiasmo. | Extraversión | Nivel de Energía | directo |
| 57 | Que piensa bien de la gente. | Cordialidad | Confianza | directo |
| 58 | Que a veces se comporta de manera irresponsable. | Responsabilidad | Responsabilidad | **inverso** |
| 59 | Temperamental, que se exalta fácilmente. | Emocionalidad negativa | Volatilidad Emocional | directo |
| 60 | Original, que aporta ideas nuevas. | Apertura de mente | Imaginación Creativa | directo |

> Los textos conservan las erratas del Excel (`afirnaciones`, `Metóidico/a`,
> `IServicial`, tildes sueltas). Antes de publicar el test hay que corregirlos contra
> el PDF oficial: son los textos que va a leer la persona.

## Baremos

**No hay.** El instrumento devuelve medias de 1 a 5, no percentiles. Convertir esas
medias en bandas («alto», «bajo») exige una muestra de referencia que hoy no existe.

Ver [`02-modelo-interpretacion.md`](02-modelo-interpretacion.md), donde se decide qué
hacer al respecto. Lo que no se puede hacer es presentar percentiles inventados como
si vinieran de una muestra.
