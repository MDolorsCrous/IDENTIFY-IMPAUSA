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


---

# Anexo A — Las quince facetas

Qué significa puntuar bajo o alto en cada una. Es la capa más segura de la
interpretación: viene descrita en el material de origen, con sus referencias.

**Cómo usarla.** Las bandas centrales llevan el texto de su polo, pero avisando de que la
puntuación está cerca del punto medio: orienta, no describe un extremo que no se ha dado.
Y una faceta suelta sostiene menos que un dominio — son escalas de cuatro ítems y diez de
las quince quedan por debajo de .70 en la adaptación española.

## Extraversión

### Sociabilidad

*Disfrute de la compañía de los demás y tendencia a buscar interacción social.*

**Nivel bajo.** Sugiere preferencia por la soledad, el trabajo autónomo y una menor necesidad de estimulación social. Puedes interactuar con eficacia cuando hace falta, pero no sueles buscar activamente rodearte de gente ni socializar por puro placer. Conviene tenerlo en cuenta en entornos que exigen interacción constante: ahí este perfil se asocia con un mayor riesgo de agotamiento.
<sub>Soto & John, 2017 · Danner & Lechner, 2024</sub>

**Nivel alto.** Sugiere un deseo marcado de acercarse y conectar con los demás. Suele venir acompañado de facilidad para tejer redes de contactos y de preferencia por entornos donde la interacción es constante, además de facilidad para la aceptación entre iguales y para hacer amistades. En el trabajo se asocia con niveles altos de satisfacción y compromiso.
<sub>Soto & John, 2017 · Ozer & Benet-Martínez, 2006 · Danner & Lechner, 2024</sub>

<sub>Ítems 1, 16, 31, 46 · diapositivas 26–27 del material</sub>

### Asertividad

*Inclinación a expresarse con confianza, ejercer liderazgo y tomar la iniciativa social.*

**Nivel bajo.** Sugiere preferencia por dejar que otros tomen el control y la iniciativa. Puede costarte influir en las decisiones del grupo, y es probable que te sientas más cómodo en papeles de acompañamiento que imponiendo tu visión.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una tendencia clara a tomar la iniciativa y actuar como referente. Suele traducirse en expresar las propias opiniones con seguridad, sentirse cómodo llevando la voz cantante y tener facilidad para influir y persuadir.
<sub>Soto & John, 2017</sub>

<sub>Ítems 6, 21, 36, 51 · diapositivas 31–32 del material</sub>

### Nivel de energía

*Tendencia a sentirse animado, entusiasta y activo.*

**Nivel bajo.** Sugiere preferencia por un ritmo más calmado y reflexivo. Es raro que te sientas impaciente por actuar, y tu nivel de actividad general suele ser menor que el de la mayoría. En su extremo puede acercarse a la desmotivación, y ahí conviene mirar si va acompañado de desánimo.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una tendencia marcada a la actividad y el entusiasmo. Suele manifestarse en vivir y trabajar a un ritmo rápido, implicarse pronto en lo que surge y rara vez quedarse en posición pasiva, con una capacidad notable de despliegue de energía física y mental.
<sub>Soto & John, 2017</sub>

<sub>Ítems 11, 26, 41, 56 · diapositivas 36–37 del material</sub>

## Cordialidad

### Compasión

*Tendencia a mostrar empatía, preocuparse por los demás y actuar con bondad.*

**Nivel bajo.** Sugiere una lectura más pragmática y menos afectiva de las situaciones. Puede que sientas poca resonancia emocional ante el malestar ajeno y que tu forma de acercarte a los problemas de otros sea más objetiva que cálida.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una inclinación clara a la empatía, la ternura y el altruismo. Suele acompañarse de disposición a ayudar sin esperar nada a cambio y de una preocupación genuina por lo que les ocurre a quienes tienes cerca.
<sub>Soto & John, 2017</sub>

<sub>Ítems 2, 17, 32, 47 · diapositivas 41–42 del material</sub>

### Respeto

*Consideración por las normas sociales, las buenas maneras y la cortesía.*

**Nivel bajo.** Sugiere menos reparo en la confrontación y en saltarse las formas. Puede traducirse en entrar en discusiones con facilidad y en que cueste frenar una reacción antagónica cuando algo no encaja.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una inclinación marcada a ser cortés y considerado. Suele manifestarse en evitar el enfrentamiento, sostener las formas incluso a disgusto y tener facilidad para contener el impulso de confrontar.
<sub>Soto & John, 2017</sub>

<sub>Ítems 7, 22, 37, 52 · diapositivas 46–47 del material</sub>

### Confianza

*Tendencia a confiar en las intenciones de los demás y verlos como benevolentes.*

**Nivel bajo.** Sugiere una actitud vigilante y escéptica. Puede que tiendas a buscar segundas intenciones, que te cueste dar por supuesta la buena fe ajena y que perdonar te lleve más tiempo.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una creencia de fondo en que las personas son buenas por naturaleza. Suele traducirse en asumir lo mejor de los demás, confiar con facilidad en sus intenciones y tener un carácter que perdona pronto.
<sub>Soto & John, 2017</sub>

<sub>Ítems 12, 27, 42, 57 · diapositivas 51–52 del material</sub>

## Responsabilidad

### Organización

*Tendencia a ser metódico, ordenado y estructurado.*

**Nivel bajo.** Sugiere tolerancia al desorden y poca inclinación a planificar. Puede manifestarse en descuidar el entorno físico o el orden de las tareas, y en que cueste sostener sistemas y rutinas estables.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una tendencia clara a lo metódico y sistemático. Suele acompañarse de preferencia por mantener el entorno ordenado, disfrutar planificando y seguir procedimientos claros, con bastante atención al detalle.
<sub>Soto & John, 2017</sub>

<sub>Ítems 3, 18, 33, 48 · diapositivas 56–57 del material</sub>

### Productividad

*Capacidad de mantenerse concentrado y eficiente en las tareas y las metas.*

**Nivel bajo.** Sugiere dificultad para arrancar y sostener el esfuerzo. Puede traducirse en posponer el comienzo de las tareas y en que la constancia del día a día cueste más de lo que te gustaría.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una ética de trabajo firme y bastante autodisciplina. Suele manifestarse en ser eficiente y persistente, trabajar hasta terminar lo empezado y sostener un nivel alto de esfuerzo hacia lo que te propones.
<sub>Soto & John, 2017</sub>

<sub>Ítems 8, 23, 38, 53 · diapositivas 61–62 del material</sub>

### Responsabilidad

*Adherencia a los propios valores, honestidad y sentido del deber.*

**Nivel bajo.** Sugiere una relación más laxa con los compromisos adquiridos. Puede traducirse en faltar a lo prometido con cierta facilidad y en resultar menos previsible para quienes cuentan contigo.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere fiabilidad y constancia. Suele manifestarse en cumplir con rigor lo que se promete y en asumir el deber hacia los demás, de modo que tu entorno sabe que puede contar contigo cuando hace falta.
<sub>Soto & John, 2017</sub>

<sub>Ítems 13, 28, 43, 58 · diapositivas 66–67 del material</sub>

## Emocionalidad negativa

### Ansiedad

*Tendencia a preocuparse con facilidad y a sentir nerviosismo o tensión.*

**Nivel bajo.** Sugiere estabilidad ante la presión y facilidad para mantener la calma. Es raro que aparezcan miedos o preocupaciones desproporcionadas, y sueles gestionar el estrés sintiéndote seguro incluso en entornos exigentes.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una tendencia marcada a la preocupación y la tensión. Suele traducirse en episodios frecuentes de sentirse en alerta, dar muchas vueltas a los problemas y encontrar difícil desconectar en situaciones de estrés.
<sub>Soto & John, 2017</sub>

<sub>Ítems 4, 19, 34, 49 · diapositivas 71–72 del material</sub>

### Depresión

*Tendencia a registrar la tristeza y el desánimo con facilidad.*

**Nivel bajo.** Sugiere seguridad en uno mismo y una actitud resiliente ante los tropiezos. Sueles sentirte cómodo con quien eres y es raro que aparezcan periodos prolongados de desánimo.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una tendencia a registrar el abatimiento con más facilidad que la media. Puede costar sostener el optimismo después de un fracaso, y aparecer momentos de no sentirse del todo cómodo o seguro contigo mismo.
<sub>Soto & John, 2017</sub>

<sub>Ítems 9, 24, 39, 54 · diapositivas 76–77 del material</sub>

### Volatilidad emocional

*Facilidad con la que cambia el estado de ánimo ante los contratiempos.*

**Nivel bajo.** Sugiere estabilidad emocional y autocontrol. Suele traducirse en mantener la calma bajo presión y en no reaccionar de forma desproporcionada aunque la situación sea adversa.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una tendencia a alterarse con facilidad. Puede manifestarse en cambios de humor frecuentes y en que, ante un contratiempo, la emoción tome la delantera antes de poder encauzarla.
<sub>Soto & John, 2017</sub>

<sub>Ítems 14, 29, 44, 59 · diapositivas 81–82 del material</sub>

## Apertura de mente

### Curiosidad intelectual

*Inclinación a pensar en profundidad, analizar y explorar ideas.*

**Nivel bajo.** Sugiere preferencia por lo práctico y poco interés por lo abstracto. Puede traducirse en encontrar poco útiles las discusiones teóricas y en preferir la información concreta y aplicable.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una inclinación marcada al pensamiento profundo y a explorar ideas nuevas. Suele manifestarse en curiosidad por asuntos muy distintos entre sí y en disfrutar de las conversaciones intelectuales y de los temas abstractos.
<sub>Soto & John, 2017</sub>

<sub>Ítems 10, 25, 40, 55 · diapositivas 86–87 del material</sub>

### Sensibilidad estética

*Apreciación por el arte, la música, la naturaleza y la belleza.*

**Nivel bajo.** Sugiere pocos intereses artísticos. Puede traducirse en encontrar poco atractivas expresiones como la poesía o el teatro, y en preferir entornos y experiencias más prácticos, sin dar mucha importancia a lo estético.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una atracción clara por el arte, la música y la literatura. Suele acompañarse de valorar la belleza y de disfrutar de las experiencias estéticas y de las expresiones culturales.
<sub>Soto & John, 2017</sub>

<sub>Ítems 5, 20, 35, 50 · diapositivas 91–92 del material</sub>

### Imaginación creativa

*Tendencia a pensar de forma imaginativa y a generar ideas nuevas.*

**Nivel bajo.** Sugiere preferencia por lo práctico y por los caminos ya probados. Puede costar imaginar soluciones que no se hayan visto antes, y resultar más cómodo recurrir a métodos y rutinas conocidos que aportar algo original.
<sub>Soto & John, 2017</sub>

**Nivel alto.** Sugiere una tendencia marcada a la originalidad. Suele manifestarse en facilidad para imaginar escenarios y soluciones, disfrutar aportando ideas nuevas y encontrar maneras poco convencionales de hacer las cosas.
<sub>Soto & John, 2017</sub>

<sub>Ítems 15, 30, 45, 60 · diapositivas 96–97 del material</sub>


---

# Anexo B — Las combinaciones

26 reglas sacadas del material de origen. Son lo que hace que el informe diga
algo que la persona no podría deducir mirando cinco números.

**Una regla solo se afirma si se cumplen TODAS sus condiciones.** Si falta una, es una
señal: se escribe en condicional —«si además…»— y **no se cita**, porque no se ha cumplido.

**Qué cuenta como alta o baja.** Solo las bandas extremas. Contar las centrales hace que
casi cualquier perfil roce casi cualquier regla, y eso convierte el informe en ruido.

## Las que piden cuidado

- **Clínicas** — Riesgo elevado de agotamiento profesional · Bajo sentido de dirección vital · Riesgo elevado de agotamiento profesional. Nunca se dejan como veredicto: llevan qué hacer, y
  la mención de que si eso encaja con lo que la persona vive, hablarlo con un profesional
  es lo razonable.
- **Delicadas** — Orientación al poder y a la manipulación · Orientación a la gratificación inmediata · Riesgo de hostilidad y conflicto interpersonal. Describen un patrón, nunca a la persona.
  «Esta combinación se asocia con…», no «eres manipulador». Siempre con la palanca al lado.

### Riesgo elevado de agotamiento profesional

**Se cumple con:** puntuación baja en Sociabilidad, Nivel de energía y Confianza; alta en Depresión

Poca inclinación a socializar, poca energía disponible, desconfianza hacia los compañeros y tendencia a la tristeza. En el trabajo, esta combinación se asocia con una probabilidad notablemente mayor de agotamiento físico y emocional severo.

<sub>Ámbito laboral · Danner & Lechner, 2024 · diapositivas 28, 38, 53 · **clínica**</sub>

### Alto compromiso ocupacional y estatus social

**Se cumple con:** alta en Sociabilidad y Asertividad

Predice orgullo por la actividad profesional y compromiso con el trabajo. En lo interpersonal, estatus social alto, popularidad y facilidad para asumir roles de liderazgo.

<sub>Ámbito laboral · Danner & Lechner, 2024 · Ozer & Benet-Martínez, 2006 · Soto & John, 2017 · diapositivas 28, 33</sub>

### Comportamiento de ciudadanía organizacional (OCB)

**Se cumple con:** alta en Sociabilidad, Curiosidad intelectual y Respeto

Ir más allá de las obligaciones estrictas: ayudar a los compañeros, aportar ideas de mejora, sostener la moral del equipo y hablar bien de la organización.

<sub>Ámbito laboral · Danner & Lechner, 2024 · diapositivas 28, 48, 88</sub>

### Orientación prosocial y voluntariado

**Se cumple con:** alta en Sociabilidad y Compasión

Interés activo por relacionarse unido a preocupación genuina por el bienestar ajeno. Se asocia con conductas de ayuda, altruismo, voluntariado y relaciones familiares y de pareja satisfactorias.

<sub>Ámbito interpersonal · Ozer & Benet-Martínez, 2006 · Soto & John, 2017 · diapositivas 28</sub>

### Orientación al poder y a la manipulación

**Se cumple con:** puntuación baja en Compasión y Respeto; alta en Asertividad

Querer liderar e imponerse sin empatía por el sufrimiento ajeno y sin reparo en romper la cortesía. Es la combinación que mejor predice conductas de búsqueda de poder y disposición a instrumentalizar a otros.

<sub>Ámbito interpersonal · Soto & John, 2017 · Soto, 2019 · diapositivas 33, 43, 48 · **delicada**</sub>

### Sentido de propósito vital y autoaceptación

**Se cumple con:** puntuación baja en Depresión; alta en Nivel de energía y Responsabilidad

Vitalidad y entusiasmo, capacidad de cumplir objetivos de forma constante y ánimo alejado del abatimiento. Predice claridad de dirección en la vida y satisfacción con la propia valía.

<sub>Ámbito personal · Soto, 2019 · diapositivas 38 · revisión pendiente</sub>

> ⚠️ El original dice «responsabilidad» sin precisar si se refiere a la faceta (responsabilidad moral) o al dominio entero. Aquí se ha interpretado como la faceta.

### Alto crecimiento personal

**Se cumple con:** alta en Nivel de energía, Curiosidad intelectual y Compasión

Entusiasmo para explorar, voluntad de aprender en profundidad y deseo de empatizar con el entorno. Estas personas sienten que evolucionan y maduran a lo largo del tiempo.

<sub>Ámbito personal · Soto, 2019 · diapositivas 38, 43, 88</sub>

### Fuerte conexión social y comunitaria

**Se cumple con:** alta en Nivel de energía y Respeto

Entusiasmo y actividad social manteniendo la cortesía y el respeto por las normas. Predice vínculos comunitarios, de amistad y de compañerismo más sólidos.

<sub>Ámbito interpersonal · Soto, 2019 · diapositivas 38</sub>

### Comportamiento benevolente

**Se cumple con:** alta en Compasión, Confianza y Curiosidad intelectual

Empatía emocional, creencia en la bondad ajena y mente abierta. Predice conductas prosociales del día a día: prestar, apoyar, preocuparse por el entorno cercano.

<sub>Ámbito interpersonal · Soto, 2019 · diapositivas 43, 53, 88</sub>

### Protección frente al conflicto y al abandono del puesto

**Se cumple con:** alta en Confianza y Compasión

Buenas creencias hacia los compañeros junto con empatía funcionan como protector laboral: aumentan la satisfacción y reducen el deseo de abandonar el entorno de trabajo.

<sub>Ámbito laboral · Danner & Lechner, 2024 · diapositivas 53</sub>

### Orientación a la seguridad y a lo predecible

**Se cumple con:** puntuación baja en Sociabilidad y Curiosidad intelectual; alta en Organización

Valores orientados a evitar riesgos, a la seguridad personal y al mantenimiento de entornos predecibles. Perfiles que se alejan de la búsqueda de estimulación y de la ruptura de rutinas.

<sub>Ámbito personal · Soto & John, 2017 · diapositivas 58</sub>

### Mejor salud general autopercibida

**Se cumple con:** puntuación baja en Depresión; alta en Organización y Respeto

Capacidad de sostener hábitos de vida ordenados y saludables manteniendo a la vez equilibrio emocional e interpersonal. Las tres facetas juntas predicen mejor salud percibida de forma independiente.

<sub>Ámbito salud · Danner & Lechner, 2024 · diapositivas 58</sub>

### Alto rendimiento global

**Se cumple con:** alta en Organización, Productividad y Responsabilidad

El dominio de Responsabilidad completo: diseñar sistemas ordenados, tener la constancia para ejecutarlos y el compromiso cumplidor hacia el equipo.

<sub>Ámbito laboral · Soto & John, 2017 · diapositivas 58</sub>

### Dominio del entorno

**Se cumple con:** puntuación baja en Depresión; alta en Productividad

Ser resolutivo y enfocado a metas manteniendo el ánimo alejado del abatimiento. Es de los predictores más fuertes de sentirse competente para gestionar las exigencias de la vida diaria.

<sub>Ámbito personal · Soto & John, 2017 · Soto, 2019 · diapositivas 63, 78</sub>

### Orientación a la gratificación inmediata

**Se cumple con:** puntuación baja en Productividad y Responsabilidad; alta en Sociabilidad

Poca disciplina de trabajo y bajo sentido del deber junto con ganas de estar con otros. Favorece priorizar el ocio y la gratificación a corto plazo por delante de las metas a largo plazo.

<sub>Ámbito personal · Soto & John, 2017 · diapositivas 63, 68 · **delicada**</sub>

### Alta autonomía psicológica

**Se cumple con:** puntuación baja en Ansiedad; alta en Responsabilidad y Imaginación creativa

Cumplir con los propios deberes, flexibilidad mental para generar soluciones y gestionar la tensión sin angustiarse. Predice decisiones independientes, poco influidas por lo que hacen o piensan los demás.

<sub>Ámbito personal · Soto & John, 2017 · diapositivas 68, 73, 98</sub>

### Búsqueda de estimulación

**Se cumple con:** puntuación baja en Organización; alta en Responsabilidad y Sociabilidad

Cumplir con la palabra dada, alta energía social y tolerancia al desorden. Lleva a buscar activamente situaciones estimulantes que rompan la rutina.

<sub>Ámbito personal · Soto & John, 2017 · diapositivas 68</sub>

### Alta resistencia al estrés

**Se cumple con:** puntuación baja en Ansiedad y Volatilidad emocional

Gestionar la tensión sin angustia y sostener el humor sin altibajos. Es el predictor más fuerte de que compañeros y evaluadores externos describan a alguien como resistente al estrés.

<sub>Ámbito laboral · Soto & John, 2017 · diapositivas 73, 83</sub>

### Bajo sentido de dirección vital

**Se cumple con:** puntuación baja en Nivel de energía y Responsabilidad; alta en Depresión

Tristeza o inseguridad frecuentes, falta de vitalidad y dificultad para comprometerse con las propias obligaciones. Se asocia con los niveles más bajos de sentido vital y de objetivos claros.

<sub>Ámbito personal · Soto, 2019 · diapositivas 78 · **clínica**, revisión pendiente</sub>

> ⚠️ El original dice «baja responsabilidad» sin precisar faceta o dominio. Aquí se ha interpretado como la faceta.

### Relaciones positivas y autoaceptación

**Se cumple con:** puntuación baja en Depresión; alta en Sociabilidad y Compasión

Ausencia de abatimiento junto con deseo de conectar y ternura empática. Predice relaciones interpersonales satisfactorias y aceptación de la propia identidad.

<sub>Ámbito interpersonal · Soto, 2019 · diapositivas 78</sub>

### Riesgo de hostilidad y conflicto interpersonal

**Se cumple con:** puntuación baja en Compasión y Respeto; alta en Volatilidad emocional

Reaccionar con irritación rápida sobre una base de poca cortesía y poca empatía. Se asocia con insatisfacción, conductas confrontativas y conflictos severos tanto en pareja como en el trabajo.

<sub>Ámbito interpersonal · Ozer & Benet-Martínez, 2006 · Soto & John, 2017 · diapositivas 83 · **delicada**</sub>

### Riesgo elevado de agotamiento profesional

**Se cumple con:** puntuación baja en Sociabilidad; alta en Volatilidad emocional

Humor inestable unido a poco interés por conectar con los compañeros y, por tanto, poco apoyo social disponible. Es una de las vías directas al agotamiento profesional severo.

<sub>Ámbito laboral · Danner & Lechner, 2024 · diapositivas 83 · **clínica**</sub>

### Fuerte autodirección

**Se cumple con:** alta en Curiosidad intelectual y Imaginación creativa

Hambre de conocimiento unida a la capacidad de generar visiones nuevas. Define perfiles exploratorios que investigan y actúan fuera de la norma por motivación intrínseca.

<sub>Ámbito personal · Soto & John, 2017 · Soto, 2019 · diapositivas 88, 98</sub>

### Orientación al universalismo

**Se cumple con:** alta en Sensibilidad estética y Confianza

Valorar la belleza y el entorno junto con una creencia positiva en los demás. Se asocia con preocupación por el bienestar general y con conductas de apoyo a causas colectivas y ambientales.

<sub>Ámbito personal · Soto & John, 2017 · diapositivas 93</sub>

### Apertura a la experiencia plena

**Se cumple con:** alta en Sensibilidad estética, Curiosidad intelectual y Imaginación creativa

El dominio de Apertura completo: preferencia por una gama amplia y compleja de experiencias perceptivas, cognitivas y afectivas, buscando activamente la novedad.

<sub>Ámbito personal · Soto & John, 2017 · diapositivas 93</sub>

### Conformidad y tradición

**Se cumple con:** puntuación baja en Imaginación creativa y Sociabilidad; alta en Respeto

Poco interés por generar alternativas nuevas, respeto rígido por las normas y las figuras de autoridad, y poca búsqueda de protagonismo social. Predice conductas conformistas y apego a las reglas establecidas.

<sub>Ámbito personal · Soto & John, 2017 · diapositivas 98</sub>


---

# Anexo C — Bandas, baremos y evidencia

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


---

# Anexo D — El informe y su esquema

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

## El encargo, tal como se le pasa al modelo

Esto es literalmente lo que lleva `src/services/prompt.ts`, para que la skill y el
comando pidan lo mismo:

```
Eres quien redacta los informes de Identify by Impausa, el test de personalidad
BFI-2 de LivePausa. Recibes un perfil YA INTERPRETADO y devuelves únicamente los
pasajes redactados, en JSON.

QUÉ NO HACES
- No calculas ni corriges puntuaciones: vienen dadas y son correctas.
- No añades hallazgos que no estén en el material que recibes.
- No diagnosticas. Ninguna faceta es una condición clínica: «Ansiedad» y
  «Depresión» son nombres técnicos de escalas de personalidad.
- No dices si alguien sirve para un puesto, ni predices lo que hará.
- No inventas referencias.

TONO
Próximo, profesional, humano, claro, motivador, profundo, respetuoso, fácil de
entender, práctico, accionable, prudente y no repetitivo. Tres reglas:
1. Atribuye a los resultados, no a la persona: «los resultados muestran»,
   «tu perfil tiende a», «esto sugiere».
2. Matiza: «puede», «tiende a», «suele». Nunca un absoluto sobre alguien.
3. Termina en algo accionable. Si nombras un coste, di qué hacer con él.

Nada grandilocuente:
  «Eres una fuerza imparable» → «Los resultados muestran una alta orientación a la acción»
  «Eres una líder nata» → «Tu perfil puede aportar foco, dirección y capacidad de avance»
  «Tu mente está programada para…» → «Puedes tender a tomar decisiones con rapidez»

Segunda persona. Nunca etiquetes: «tu patrón tiende a…», no «eres un X».
Toda debilidad, con su palanca al lado. Ningún halago vacío.

QUÉ PUEDES AFIRMAR
- Lo que se lee directamente de una puntuación: afirmación.
- Lo que dice una regla de combinación que ha disparado: afirmación, y puedes
  citar su referencia.
- Cualquier otra cosa: pregunta o condicional. Nunca afirmación.

LAS SEÑALES SON CONDICIONALES
Las reglas «casi cumplidas» no describen a la persona: les falta una condición.
Escríbelas en condicional («si además…») y no las cites.

SI HAY MATERIAL DELICADO
Cuando una regla venga marcada como clínica, no la dejes como veredicto: di qué
hacer, y menciona que si eso encaja con lo que la persona vive, hablarlo con un
profesional es lo razonable. Si viene marcada como delicada, describe el patrón,
nunca a la persona.

SI NO HA DISPARADO NINGUNA REGLA
No lo disimules ni rellenes. El peso recae en el recorrido dominio a dominio.

DE DÓNDE SACAS LAS PALANCAS
Las preguntas y el plan no salen de tu criterio: salen del método de la casa
(skill executive-coach-senior). Según lo que haya salido alto o bajo:

- Asertividad baja → marco de asertividad: poner límites, decir que no, recibir
  críticas. La palanca es el guion concreto, no «tener más confianza».
- Respeto bajo con asertividad alta → marco de conflicto: qué tipo de conflicto
  es, a qué temperatura está, y separar posiciones de intereses.
- Volatilidad emocional alta → regulación emocional ANTES que cualquier guion de
  conversación difícil. El orden importa.
- Confianza baja → dinámicas de poder y mapa de personas: delegar cuesta más de
  lo que explica la capacidad, y se entrena con pruebas pequeñas y baratas.
- Organización baja con productividad alta → sistemas y tiempo, no motivación.

Y una regla que viene de ahí: **no recetes el rasgo que falta**. Decirle a quien
tiene la organización baja que se organice más no funciona casi nunca; la palanca
suele ser estructura externa, no más esfuerzo.

LONGITUDES
- titular: una línea, menos de 80 caracteres
- perfilEnUnaFrase: 120-150 palabras
- cada dominio: 150-200 palabras
- enElTrabajo: 200-250 palabras
- preguntas: entre 5 y 7, una línea cada una
- planAccion: exactamente 3 pasos, unas 60 palabras cada uno
- conclusion: 80-120 palabras

Devuelve solo el JSON del esquema. Nada más.
```

---

## Esquema de la respuesta

Una clave por sección, con longitud máxima. Nada de prosa libre que luego haya que
parsear. Los identificadores de dominio son fijos.

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "titular",
    "perfilEnUnaFrase",
    "dominios",
    "senales",
    "enElTrabajo",
    "preguntas",
    "planAccion",
    "conclusion"
  ],
  "properties": {
    "titular": {
      "type": "string",
      "maxLength": 80
    },
    "perfilEnUnaFrase": {
      "type": "string",
      "maxLength": 1200
    },
    "dominios": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "extraversion",
        "agreeableness",
        "conscientiousness",
        "negative_emotionality",
        "open_mindedness"
      ],
      "properties": {
        "extraversion": {
          "type": "string",
          "maxLength": 1600
        },
        "agreeableness": {
          "type": "string",
          "maxLength": 1600
        },
        "conscientiousness": {
          "type": "string",
          "maxLength": 1600
        },
        "negative_emotionality": {
          "type": "string",
          "maxLength": 1600
        },
        "open_mindedness": {
          "type": "string",
          "maxLength": 1600
        }
      }
    },
    "senales": {
      "type": "string",
      "maxLength": 600
    },
    "enElTrabajo": {
      "type": "string",
      "maxLength": 2000
    },
    "preguntas": {
      "type": "array",
      "minItems": 5,
      "maxItems": 7,
      "items": {
        "type": "string",
        "maxLength": 200
      }
    },
    "planAccion": {
      "type": "array",
      "minItems": 3,
      "maxItems": 3,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "titulo",
          "texto",
          "indicador"
        ],
        "properties": {
          "titulo": {
            "type": "string",
            "maxLength": 60
          },
          "texto": {
            "type": "string",
            "maxLength": 600
          },
          "indicador": {
            "type": "string",
            "maxLength": 240
          }
        }
      }
    },
    "conclusion": {
      "type": "string",
      "maxLength": 1000
    }
  }
}
```


---

# Anexo E — Metáforas

Del catálogo de la skill `metaforas-coaching`. Sus reglas, que son las que mandan:

- **3 en todo el informe**, nunca una por sección.
- **Una imagen-ancla al final**, la de la faceta más distintiva del perfil.
- **Nunca dos de la misma categoría**, que sería repetirse.
- Se eligen **por resonancia con el dato concreto**: solo facetas en banda extrema. Una
  puntuación del medio no justifica una imagen.

## Categorías excluidas, y por qué

13 Perdón · 14 Culpa y Vergüenza · 15 Duelo y Pérdida · 19 Trabajo con el Niño Interior · 21 Soledad · 25 Desafíos de la Parentalidad · 33 Sueño y Descanso · 34 Ansiedad Social · 35 Crecimiento Espiritual · 38 Trauma · 01 Recuperación de la Dependencia Química · 03 Imagen Corporal

La propia skill las marca como transversales y delicadas: solo se abren cuando la persona
las ha nombrado, y un test de personalidad no lo hace nunca. **No están en este fichero**,
no solo fuera del mapa.

Dos cautelas más: poca sociabilidad **no es** soledad ni ansiedad social — son cosas
distintas, y por eso va a equilibrio y atención plena, que hablan de cómo recarga esa
persona y no de un problema.

## De faceta a categoría

| Faceta | Si sale baja | Si sale alta |
| --- | --- | --- |
| Sociabilidad | 40 Equilibrio entre Trabajo y Vida Personal · 22 Atención Plena y Presencia | 07 Habilidades de Comunicación |
| Asertividad | 04 Límites · 07 Habilidades de Comunicación | 20 Liderazgo |
| Nivel de energía | 05 Burnout y Equilibrio entre Vida Personal y Profesional · 23 Motivación y Procrastinación | 40 Equilibrio entre Trabajo y Vida Personal |
| Compasión | 28 Cuestiones de Relación | 30 Autocompasión |
| Respeto | 08 Resolución de Conflictos · 18 Control de Impulsos | 04 Límites |
| Confianza | 39 Confianza y Vulnerabilidad · 28 Cuestiones de Relación | 39 Confianza y Vulnerabilidad |
| Organización | 37 Gestión del Tiempo · 23 Motivación y Procrastinación | 26 Perfeccionismo |
| Productividad | 23 Motivación y Procrastinación | 40 Equilibrio entre Trabajo y Vida Personal |
| Responsabilidad | 23 Motivación y Procrastinación | 26 Perfeccionismo |
| Ansiedad | 29 Resiliencia | 02 Ansiedad · 36 Gestión del Estrés · 22 Atención Plena y Presencia |
| Depresión | 16 Esperanza y Optimismo | 16 Esperanza y Optimismo · 30 Autocompasión |
| Volatilidad emocional | 11 Regulación Emocional | 11 Regulación Emocional · 18 Control de Impulsos |
| Curiosidad intelectual | 06 Cambio y Crecimiento | 31 Autodescubrimiento |
| Sensibilidad estética | 06 Cambio y Crecimiento | 22 Atención Plena y Presencia |
| Imaginación creativa | 09 Creatividad · 27 Resolución de Problemas | 09 Creatividad |

## El catálogo

### 02 · Ansiedad

- **Caminar sobre la cuerda floja**: La vida es como caminar sobre una cuerda floja: cada paso requiere equilibrio, pero con la práctica se vuelve más firme.
- **Alarma hiperactiva**: La ansiedad es como una alarma de coche hiperactiva, que se dispara al menor toque.
- **Nubes de tormenta**: Los pensamientos giran como nubes de tormenta, oscureciendo tu mente, incluso cuando el cielo está despejado.
- **Corriendo sin avanzar**: Corres lo más rápido que puedes, pero parece que nunca logras avanzar.
- **Mochila pesada**: Cargar la ansiedad es como llevar una mochila pesada: cada tarea parece más difícil de lo que debería ser.
- **Cables enredados**: Tus pensamientos son como cables enredados, todos confusos e imposibles de organizar rápidamente.

### 04 · Límites

- **Cerca de protección**: Los límites protegen tu espacio personal, manteniendo alejadas las influencias negativas.
- **Fortaleza personal**: Tu fuerza interior protege tu paz del caos exterior.
- **Política de puertas abiertas**: Los límites saludables abren espacio para relaciones de confianza y mantienen alejados a los intrusos.
- **Línea invisible**: Establece una frontera clara entre lo seguro y lo amenazante.
- **Señales de tráfico**: Las señales de tráfico guían las interacciones, indicando cuándo detenerse o seguir adelante.
- **Puerto seguro**: Un puerto seguro ofrece refugio contra tormentas emocionales.

### 05 · Burnout y Equilibrio entre Vida Personal y Profesional

- **Funcionando sin combustible**: No puedes seguir conduciendo sin repostar; tu energía necesita ser renovada.
- **Acto de equilibrio**: La vida es un acto de malabares, que requiere equilibrio entre el trabajo y el tiempo personal.
- **Circuito sobrecargado**: Un circuito sobrecargado está destinado a fallar; maneja tu energía con sabiduría.
- **Ahogamiento en tareas**: Es como ahogarse en un mar de tareas sin un salvavidas.
- **Elástico estirado**: Un elástico estirado está a punto de romperse; conoce tus límites.
- **Vela encendida**: Una vela encendida ilumina el ambiente, pero se apaga rápidamente sin cuidado.

### 06 · Cambio y Crecimiento

- **De oruga a mariposa**: La transformación lleva tiempo, pero puede resultar en algo hermoso.
- **Hoja abriéndose**: Al igual que una hoja se abre, el crecimiento ocurre poco a poco mientras absorbes luz.
- **Árbol en evolución**: Un árbol se adapta al ambiente, mostrando fuerza a lo largo de las estaciones.
- **Fénix renaciendo**: Cada obstáculo es una oportunidad para renacer más fuerte.
- **Etapa de crisálida**: Pasar por momentos incómodos es esencial para el crecimiento.
- **Creación de mosaico**: Cada experiencia, buena o mala, construye el mosaico de quién eres.

### 07 · Habilidades de Comunicación

- **Puente de Palabras**: La comunicación eficaz construye un puente que conecta corazones y mentes.
- **Libro Abierto**: Ser un libro abierto invita a la transparencia y fortalece la confianza en las relaciones.
- **Mano Doble**: La comunicación es una vía de doble sentido, donde ambos deben participar.
- **Canal Claro**: Un canal claro asegura que los mensajes sean comprendidos sin ruidos.
- **Ondas Sonoras**: Las palabras viajan como ondas sonoras, alcanzando y tocando a quien escucha.
- **Piezas de Rompecabezas**: Cada conversación encaja como piezas de un rompecabezas, completando el cuadro.

### 08 · Resolución de Conflictos

- **Puente Sobre Aguas Turbulentas**: Construir un puente ayuda a atravesar emociones intensas y malentendidos.
- **Hilo Enredado**: Un conflicto es como un hilo enredado; requiere paciencia para deshacerse de él y traer claridad.
- **Camino Compartido**: Encontrar un camino común requiere que ambos caminen juntos hacia la solución.
- **Luz en la Niebla**: La resolución de conflictos actúa como una luz en la niebla, guiando a través de las incertidumbres.
- **Notas en Armonía**: Resolver conflictos es como armonizar notas musicales para crear un sonido agradable.
- **Aguas Tranquilas**: Buscar aguas calmadas ayuda a reducir la tensión y facilita un diálogo productivo.

### 09 · Creatividad

- **Tela en Blanco**: Una tela en blanco ofrece infinitas posibilidades para crear y expresarse.
- **Río Fluyente**: La creatividad fluye como un río, cambiando de dirección cuando es necesario.
- **Paleta de Colores**: Una paleta de colores representa las emociones e ideas esperando ser exploradas.
- **Mosaico de Ideas**: Cada idea es una pieza de un mosaico, creando una imagen vibrante cuando se unen.
- **Semilla de Inspiración**: Una pequeña inspiración puede crecer y convertirse en una gran idea con cuidado.
- **Experiencia en la Cocina**: Crear en la cocina es mezclar ingredientes inesperados para sorprender los sentidos.

### 11 · Regulación Emocional

- **Equilibrista**: Controlar las emociones es como caminar por una cuerda floja, requiriendo atención y equilibrio.
- **Olas del Océano**: Las emociones van y vienen como las olas del mar, requiriendo conciencia y aceptación.
- **Enfrentando la Tormenta**: Regular las emociones ayuda a enfrentar momentos turbulentos con más fuerza.
- **Barco a Vela**: Un barco ajustando sus velas simboliza la adaptación necesaria para el equilibrio emocional.
- **Puerto Seguro**: Un puerto tranquilo representa un espacio seguro para procesar y lidiar con las emociones.
- **Jardinero Cuidadoso**: Un jardinero cultiva plantas, así como tú puedes cuidar tu bienestar emocional.

### 16 · Esperanza y Optimismo

- **Sol Naciente**: Simboliza nuevos comienzos y la promesa de días más iluminados.
- **Luz al Final del túnel**: La esperanza brilla como una luz al final del túnel, guiándote hacia adelante.
- **Brotecito en Primavera**: Representa el potencial de crecimiento y renovación en tiempos difíciles.
- **Cielo Estrellado**: Recuerda que, incluso en la oscuridad, hay belleza y esperanza.
- **Puerta Abierta**: Simboliza nuevas oportunidades y la posibilidad de cambios.
- **Camino Serpenteante**: La vida sigue un camino lleno de curvas, llevando a la esperanza y descubrimientos.

### 18 · Control de Impulsos

- **Pelota Botando**: Las decisiones impulsivas pueden rebotar, llevando a resultados inesperados.
- **Rebote**: Al igual que un tope desacelera el coche, una pausa puede ayudar a frenar los impulsos.
- **Caballo Salvaje**: Un caballo descontrolado representa impulsos desenfrenados; aprende a dominarlos para tener más control.
- **Cuerda Desgastada**: Una cuerda gastada simboliza el delicado equilibrio necesario para gestionar comportamientos impulsivos.
- **Llama Encendida**: Una llama abierta se enciende rápidamente; de la misma manera, las decisiones impulsivas pueden causar "quemaduras" emocionales.
- **Equilibrista en la Cuerda Floja**: Mantener el equilibrio en una cuerda requiere enfoque, así como controlar tus impulsos en la vida diaria.

### 20 · Liderazgo

- **Estrella Guía**: Imagina ser una estrella guía, iluminando el camino para aquellos que buscan tu orientación.
- **Roble Fuerte**: Al igual que un roble robusto, los verdaderos líderes se mantienen firmes y ofrecen apoyo a los que están a su alrededor.
- **Faro de Luz**: Un faro brilla intensamente, representando la claridad y la visión que los líderes aportan a sus equipos.
- **Volante de Dirección**: Visualízate al volante, guiando a tu equipo hacia los objetivos comunes.
- **Brújula de Integridad**: Una brújula que apunta al verdadero norte ayuda a tomar decisiones éticas en el liderazgo.
- **Barco en Navegación**: Un barco enfrentando mares turbulentos simboliza el coraje necesario para liderar en tiempos difíciles.

### 22 · Atención Plena y Presencia

- **Agua Estancada**: Al igual que el agua estancada, la atención plena permite reflexionar sin las distracciones a su alrededor.
- **Brisa Suave**: Una brisa suave te invita a sentir el momento presente, tocando tu alma delicadamente.
- **Flor de Loto**: La flor de loto florece bellamente, simbolizando el despertar de la conciencia interior.
- **Huellas en la Arena**: Cada huella en la arena recuerda la importancia de estar presente en el viaje de la vida.
- **Libro Abierto**: Un libro abierto representa la importancia de estar receptivo a las experiencias de la vida.
- **Hojas Bailarinas**: Hojas bailando al viento ilustran la belleza de estar en el momento y dejar ir.

### 23 · Motivación y Procrastinación

- **Ritmo de Tortuga**: El progreso puede parecer lento, como el de una tortuga, pero cada pequeño paso cuenta para alcanzar tus objetivos.
- **Coche Atascado**: Un coche atrapado en el barro simboliza cómo la procrastinación puede impedir tu avance.
- **Escalada de Montaña**: Subir una montaña requiere esfuerzo, pero cada paso te acerca a la cima.
- **Llamas Danzantes**: Las llamas danzantes representan la chispa de la motivación que impulsa la acción cuando se alimenta.
- **Puerta Abierta**: Una puerta abierta simboliza las oportunidades que te esperan al vencer la vacilación.
- **Paseo en Bicicleta**: Andar en bicicleta requiere pedalear constantemente; de la misma manera, la motivación surge con esfuerzo continuo.

### 26 · Perfeccionismo

- **Rompecabezas Imperfecto**: No todas las piezas deben encajar perfectamente para crear algo hermoso.
- **Espejo Roto**: Un espejo roto simboliza la distorsión causada por la búsqueda de patrones inalcanzables.
- **Borrador**: La vida es un borrador; está bien borrar y empezar de nuevo mientras encuentras tu camino.
- **Fotografía Descolorida**: Una fotografía descolorida captura la belleza de los momentos y recuerdos imperfectos.
- **Piedra Desgastada**: Una piedra desgastada cuenta una historia, revelando la belleza que surge de las imperfecciones.
- **Lienzo Envejecido**: Un lienzo envejecido te invita a crear arte sin miedo de cometer errores.

### 27 · Resolución de Problemas

- **Piezas de Rompecabezas**: Cada pieza representa una parte del problema, que al encajar revela el cuadro completo.
- **Laberinto Complejo**: Un laberinto ilustra la complejidad de los desafíos, pero siempre hay una salida.
- **Caja de Herramientas**: Representa los recursos disponibles para resolver problemas de diferentes formas.
- **Haz de Luz del Faro**: Un faro ilumina el camino en medio de la niebla, ayudando a encontrar claridad en las soluciones.
- **Libro de Recetas**: Muestra que resolver problemas requiere combinar los ingredientes correctos para obtener buenos resultados.
- **Puerta Abierta**: Simboliza nuevas oportunidades y perspectivas frente a los desafíos.

### 28 · Cuestiones de Relación

- **Vides entrelazadas**: Al igual que las vides entrelazadas, las relaciones crecen más fuertes con la conexión y el apoyo.
- **Puente de confianza**: Construir un puente de confianza es esencial para superar desafíos en las relaciones.
- **Tapiz de historias**: Las relaciones forman un tapiz, donde cada hilo representa experiencias compartidas.
- **Conexión del corazón**: Una conexión verdadera fortalece los lazos entre las personas.
- **Estrella guía**: Una estrella guía dirige las conversaciones hacia una mayor comprensión entre los compañeros.
- **Espejo de reflexión**: Reflexionar sobre las actitudes del compañero revela aprendizajes y acercamientos.

### 29 · Resiliencia

- **Bambú al Viento**: El bambú se dobla, pero no se quiebra, ilustrando la fuerza encontrada en la resiliencia.
- **Fénix Renaciendo**: Como la fénix que resurge de las cenizas, la resiliencia nace al superar desafíos.
- **Roble Fuerte**: Un roble resiste las tormentas, representando la durabilidad de los resilientes.
- **Subida de Montaña**: Escalar una montaña requiere persistencia, simbolizando el viaje de la resiliencia.
- **Puente de Fuerza**: El puente conecta dos lados, mostrando cómo la resiliencia ayuda a superar obstáculos.
- **Olas Rodantes**: Las olas golpean, pero siempre retroceden, reflejando el vaivén de la resiliencia.

### 30 · Autocompasión

- **Cobertor Suave**: Una manta suave te envuelve en confort, reflejando el calor de la autocompasión.
- **Brisa Suave**: Una brisa suave lleva gentileza, invitándote a tratarte con cuidado.
- **Abrazo Acogedor**: Un abrazo acogedor simboliza el apoyo cariñoso que puedes ofrecerte a ti mismo.
- **Aguas de Sanación**: Aguas tranquilas alivian el espíritu, representando el poder de la autocompasión.
- **Corazón Sensible**: Un corazón sensible ilustra la gentileza que puedes dirigir hacia ti mismo.
- **Sol Radiante**: El sol brilla con fuerza, simbolizando el calor del amor propio y la aceptación.

### 31 · Autodescubrimiento

- **Páginas en Blanco**: La vida es un libro no escrito; cada día es una nueva oportunidad para crear un capítulo.
- **Jardín Escondido**: Un jardín oculto simboliza partes de ti que aún esperan florecer.
- **Río que Serpentea**: Un río sinuoso refleja el viaje fluido del autodescubrimiento, lleno de curvas y adaptaciones.
- **Brújula Rota**: Una brújula rota ilustra la confusión al buscar tu verdadera dirección en la vida.
- **Luz Entre los Árboles**: La luz filtrada por los árboles representa momentos de claridad durante tu exploración interior.
- **Mariposa Emergente**: Como una mariposa saliendo del capullo, el autodescubrimiento revela tus verdaderos colores.

### 36 · Gestión del Estrés

- **Mochila Pesada**: Imagina deshacerte de una mochila llena de preocupaciones, abrazando días más ligeros.
- **Equilibrista en la Cuerda Floja**: Piensa en la gracia de un equilibrista, equilibrando las demandas de la vida con enfoque y calma.
- **Vaso Derramado**: Visualiza un vaso derramándose—tomarte un tiempo para aliviar el estrés evita que se acumule.
- **Río Tranquilo**: Imagina un río fluyendo suavemente, representando la serenidad en medio de los desafíos.
- **Olla a Presión**: Piensa en una olla a presión liberando vapor; liberar el estrés evita sobrecargas.
- **Nubes Tormentosas**: Visualiza nubes oscuras que se disipan, recordando que el estrés es temporal.

### 37 · Gestión del Tiempo

- **Rompecabezas**: Armar las piezas de un rompecabezas representa el arte de organizar tareas de manera eficiente.
- **Acto de Equilibrio**: Dominar el equilibrio entre prioridades mantiene tu vida en armonía.
- **Mecanismo de Reloj**: Un mecanismo de reloj funciona bien cuando cada pieza está en su lugar correcto.
- **Reloj de Arena Dorado**: Cada grano de arena que cae en el reloj de arena recuerda el valor del tiempo.
- **Río Fluyendo**: Un río que fluye simboliza el avance del tiempo y cómo navegamos a través de él.
- **Mapa Diario**: Un mapa diario traza el camino entre tus tareas, ayudando a mantener el enfoque.

### 39 · Confianza y Vulnerabilidad

- **Puente Frágil**: Un puente frágil simboliza el delicado equilibrio entre la confianza y la vulnerabilidad en las relaciones.
- **Puerta Abierta**: Una puerta abierta invita a los demás a entrar, ilustrando la disposición de ser vulnerable con quienes confías.
- **Frasco de Vidrio**: Un frasco de vidrio guarda momentos preciosos, representando el cuidado necesario para proteger tus vulnerabilidades.
- **Caída de Confianza**: Confiar en los demás es como lanzarse a una caída de confianza, exigiendo coraje para apoyarse en alguien.
- **Ramas al Viento**: Las ramas que se mueven muestran la flexibilidad necesaria para confiar en los demás sin perder el equilibrio.
- **Tejido Entretejido**: Un tejido entretejido ilustra las conexiones creadas a través de la confianza y las experiencias compartidas.

### 40 · Equilibrio entre Trabajo y Vida Personal

- **Dinámica del Columpio**: Equilibrarse en un columpio resalta la necesidad de dar igual atención al trabajo y a la vida personal.
- **Malabares Diarios**: La vida parece un malabarismo; es esencial mantener todo en movimiento sin dejar que nada caiga.
- **Camino en la cuerda floja**: Caminar en la cuerda floja ilustra el cuidado necesario para mantener el equilibrio.
- **Mosaico colorido**: Los diversos aspectos de la vida se unen para crear armonía.
- **Balanza del Día a Día**: Pesar las obligaciones del trabajo contra las necesidades personales resalta la importancia del equilibrio.
- **Jardín del Cuidador**: Cuidar de diferentes áreas de la vida lleva al crecimiento y florecimiento.


---

# Anexo F — Protocolo de seguridad

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

---

## Inferencias prohibidas

No se infiere del BFI-2: capacidad intelectual, salud mental, idoneidad para un puesto,
rasgos clínicos, ni predicciones de rendimiento. Describe tendencia, no comportamiento en
un momento dado.

## Los nombres de las facetas

Se mantiene la nomenclatura original del instrumento — decisión de la autora. «Ansiedad» y
«Depresión» son nombres técnicos de escalas de personalidad, no descripciones de un estado
clínico, y el informe lo dice donde aparecen las puntuaciones, no escondido en una leyenda.


---

# Anexo G — El instrumento

**BFI-2** (Big Five Inventory-2, Soto & John 2017), adaptación española de Gallardo-Pujol
et al. (2022). 60 ítems, 5 dominios, 15 facetas.

## Escala

1. Muy en desacuerdo · 2. Algo en desacuerdo · 3. Neutral, sin opinión · 4. Algo de acuerdo · 5. Muy de acuerdo

Enunciado común: **«Soy alguien que…»**

## Cálculo

- Ítems inversos: `6 - response`. 30 de los 60.
- Faceta: media de sus 4 ítems ya recodificados.
- Dominio: media de sus 12 ítems ya recodificados.
- Rango de cualquier faceta o dominio: 1,00 – 5,00.

## Los 60 ítems

| # | Enunciado | Faceta | Polaridad |
| --- | --- | --- | --- |
| 1 | Abierto/a, sociable | Sociabilidad | directo |
| 2 | Compasivo/a, con un gran corazón | Compasión | directo |
| 3 | Que tiende a ser desorganizado/a | Organización | inverso |
| 4 | Relajado/a, que gestiona bien el estrés | Ansiedad | inverso |
| 5 | Con pocos intereses artísticos | Sensibilidad estética | inverso |
| 6 | Con una personalidad asertiva | Asertividad | directo |
| 7 | Respetuoso/a, que trata a los demás con respeto | Respeto | directo |
| 8 | Que tiende a ser perezoso/a | Productividad | inverso |
| 9 | Que se mantiene optimista después de sufrir un contratiempo | Depresión | inverso |
| 10 | Que siente curiosidad por gran variedad de cosas | Curiosidad intelectual | directo |
| 11 | Que raramente se siente emocionado/a o entusiasmado/a | Nivel de energía | inverso |
| 12 | Que tiende a buscar los defectos de los demás | Confianza | inverso |
| 13 | Formal, constante | Responsabilidad | directo |
| 14 | Variable, con notables cambios de humor | Volatilidad emocional | directo |
| 15 | Ingenioso/a, que busca formas inteligentes de hacer las cosas | Imaginación creativa | directo |
| 16 | Que tiende a estar callado/a | Sociabilidad | inverso |
| 17 | Que siente poca compasión hacia los demás | Compasión | inverso |
| 18 | Metódico/a, a quien le gusta mantenerlo todo en orden | Organización | directo |
| 19 | Que puede ponerse tenso/a | Ansiedad | directo |
| 20 | Fascinado/a por el arte, la música o la literatura | Sensibilidad estética | directo |
| 21 | Dominante, que actúa como líder | Asertividad | directo |
| 22 | Que empieza discusiones con los demás | Respeto | inverso |
| 23 | A quien le cuesta empezar las tareas | Productividad | inverso |
| 24 | Que se siente seguro/a, cómodo/a consigo mismo/a | Depresión | inverso |
| 25 | Que evita conversaciones intelectuales y filosóficas | Curiosidad intelectual | inverso |
| 26 | Menos activo/a que otras personas | Nivel de energía | inverso |
| 27 | Comprensivo/a con los demás | Confianza | directo |
| 28 | Que puede ser algo descuidado/a | Responsabilidad | inverso |
| 29 | Emocionalmente estable, que no se altera con facilidad | Volatilidad emocional | inverso |
| 30 | Con poca creatividad | Imaginación creativa | inverso |
| 31 | A veces tímido/a, introvertido/a | Sociabilidad | inverso |
| 32 | Servicial y generoso/a con los demás | Compasión | directo |
| 33 | Que mantiene todo limpio y ordenado | Organización | directo |
| 34 | Que se preocupa mucho | Ansiedad | directo |
| 35 | Que valora el arte y la belleza | Sensibilidad estética | directo |
| 36 | A quien le es difícil influir en los demás | Asertividad | inverso |
| 37 | Que a veces es grosero/a con los demás | Respeto | inverso |
| 38 | Eficiente, que consigue que las cosas se hagan | Productividad | directo |
| 39 | Que a menudo se siente triste | Depresión | directo |
| 40 | Complejo/a, de pensamientos profundos | Curiosidad intelectual | directo |
| 41 | Lleno/a de energía | Nivel de energía | directo |
| 42 | Que desconfía de las intenciones de los demás | Confianza | inverso |
| 43 | Fiable, con el/la que siempre se puede contar | Responsabilidad | directo |
| 44 | Que controla sus emociones | Volatilidad emocional | inverso |
| 45 | Que tiene dificultad para imaginarse las cosas | Imaginación creativa | inverso |
| 46 | Hablador/a | Sociabilidad | directo |
| 47 | Que puede ser frío/a e insensible | Compasión | inverso |
| 48 | Que lo deja todo hecho un lío, que no limpia | Organización | inverso |
| 49 | Que raramente se siente ansioso/a o miedoso/a | Ansiedad | inverso |
| 50 | Que considera que la poesía y el teatro son aburridos | Sensibilidad estética | inverso |
| 51 | Que prefiere que otros/as asuman la responsabilidad | Asertividad | inverso |
| 52 | Educado/a, cortés con los demás | Respeto | directo |
| 53 | Tenaz, que trabaja hasta terminar la tarea | Productividad | directo |
| 54 | Que tiende a sentirse deprimido/a, melancólico/a | Depresión | directo |
| 55 | Con poco interés por ideas abstractas | Curiosidad intelectual | inverso |
| 56 | Que muestra mucho entusiasmo | Nivel de energía | directo |
| 57 | Que piensa bien de la gente | Confianza | directo |
| 58 | Que a veces se comporta de manera irresponsable | Responsabilidad | inverso |
| 59 | Temperamental, que se exalta fácilmente | Volatilidad emocional | directo |
| 60 | Original, que aporta ideas nuevas | Imaginación creativa | directo |

<sub>Enunciados oficiales del apéndice del postprint (OSF kp572), con 2 desviaciones declaradas: ítems 20 y 51, en forma inclusiva por criterio editorial de IMPAUSA.</sub>
