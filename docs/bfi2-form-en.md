# El formulario BFI-2 en inglés — fuente y verificación

**Estado: listo para la fase 3 del plan del inglés.** Este documento es el equivalente
inglés del `Spanish BFI-2 Form.pdf`: los 60 ítems oficiales con su número, el enunciado
introductorio, la escala de respuesta y la clave de corrección. De aquí deben salir los
textos de `src/i18n/en.json` cuando la fase 3 arranque, y contra esto se validan.

## De dónde sale

Del **apéndice del artículo original** (páginas 77–78 del manuscrito):

> Soto, C. J., & John, O. P. (2017). *The next Big Five Inventory (BFI-2): Developing and
> assessing a hierarchical model with 15 facets to enhance bandwidth, fidelity, and
> predictive power.* Journal of Personality and Social Psychology, 113(1), 117–143.
> DOI [10.1037/pspp0000096](https://doi.org/10.1037/pspp0000096)

El apéndice reproduce el formulario completo con la nota «Reprinted with permission» y la
línea de copyright. Es mejor fuente que la descarga del Berkeley Personality Lab que
esperábamos: es el artículo publicado, citable y estable. **Ojo: ese permiso ampara al
artículo, no nuestro uso comercial** — la licencia sigue como dice
[`licencia-bfi2.md`](licencia-bfi2.md), y el correo a los autores sigue pendiente.

## Verificación (tres vías, hecha el 3-9-2026)

1. **La clave del apéndice** es idéntica, erre a erre, a la `CLAVE_OFICIAL` de
   [`tests/clave-oficial.test.ts`](../tests/clave-oficial.test.ts) (que viene del
   formulario español) y a la que publica la documentación del paquete R de LCBC-UiO
   (lcbc-uio.github.io/questionnaires/articles/bfi-2.html). La numeración inglesa y la
   española son la misma, confirmado por tres fuentes independientes.
2. **Los 60 textos de la Tabla 6 del artículo** (agrupados por faceta, con la etiqueta
   Original/Revised/New) coinciden con los del apéndice numerado.
3. **Ítem a ítem contra el español** de
   [`src/config/enunciados-oficiales.json`](../src/config/enunciados-oficiales.json):
   los 60 casan por traducción y por polaridad, sin ninguna ambigüedad.

## El formulario

**Instrucciones:**

> Here are a number of characteristics that may or may not apply to you. For example, do
> you agree that you are someone who likes to spend time with others? Please write a
> number next to each statement to indicate the extent to which you agree or disagree
> with that statement.

**Escala de respuesta:**

| 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|
| Disagree strongly | Disagree a little | Neutral; no opinion | Agree a little | Agree strongly |

**Enunciado introductorio:** *I am someone who...*

**Cierre del formulario:** *Please check: Did you write a number in front of each statement?*

**Atribución:** BFI-2 items copyright 2016 by Oliver P. John and Christopher J. Soto.

## Los 60 ítems

R = ítem inverso según la clave oficial. La columna en español es el ítem equivalente del
formulario español, para que la correspondencia se pueda comprobar de un vistazo.

| # | I am someone who... | R | Faceta | Soy alguien... |
|---|---|---|---|---|
| 1 | Is outgoing, sociable. | | sociability | Abierto/a, sociable |
| 2 | Is compassionate, has a soft heart. | | compassion | Compasivo/a, con un gran corazón |
| 3 | Tends to be disorganized. | R | organization | Que tiende a ser desorganizado/a |
| 4 | Is relaxed, handles stress well. | R | anxiety | Relajado/a, que gestiona bien el estrés |
| 5 | Has few artistic interests. | R | aesthetic_sensitivity | Con pocos intereses artísticos |
| 6 | Has an assertive personality. | | assertiveness | Con una personalidad asertiva |
| 7 | Is respectful, treats others with respect. | | respectfulness | Respetuoso/a, que trata a los demás con respeto |
| 8 | Tends to be lazy. | R | productiveness | Que tiende a ser perezoso/a |
| 9 | Stays optimistic after experiencing a setback. | R | depression | Que se mantiene optimista después de sufrir un contratiempo |
| 10 | Is curious about many different things. | | intellectual_curiosity | Que siente curiosidad por gran variedad de cosas |
| 11 | Rarely feels excited or eager. | R | energy_level | Que raramente se siente emocionado/a o entusiasmado/a |
| 12 | Tends to find fault with others. | R | trust | Que tiende a buscar los defectos de los demás |
| 13 | Is dependable, steady. | | responsibility | Formal, constante |
| 14 | Is moody, has up and down mood swings. | | emotional_volatility | Variable, con notables cambios de humor |
| 15 | Is inventive, finds clever ways to do things. | | creative_imagination | Ingenioso/a, que busca formas inteligentes de hacer las cosas |
| 16 | Tends to be quiet. | R | sociability | Que tiende a estar callado/a |
| 17 | Feels little sympathy for others. | R | compassion | Que siente poca compasión hacia los demás |
| 18 | Is systematic, likes to keep things in order. | | organization | Metódico/a, a quien le gusta mantenerlo todo en orden |
| 19 | Can be tense. | | anxiety | Que puede ponerse tenso/a |
| 20 | Is fascinated by art, music, or literature. | | aesthetic_sensitivity | Fascinado por el arte, la música o la literatura |
| 21 | Is dominant, acts as a leader. | | assertiveness | Dominante, que actúa como líder |
| 22 | Starts arguments with others. | R | respectfulness | Que empieza discusiones con los demás |
| 23 | Has difficulty getting started on tasks. | R | productiveness | A quien le cuesta empezar las tareas |
| 24 | Feels secure, comfortable with self. | R | depression | Que se siente seguro/a, cómodo/a consigo mismo/a |
| 25 | Avoids intellectual, philosophical discussions. | R | intellectual_curiosity | Que evita conversaciones intelectuales y filosóficas |
| 26 | Is less active than other people. | R | energy_level | Menos activo/a que otras personas |
| 27 | Has a forgiving nature. | | trust | Comprensivo/a con los demás |
| 28 | Can be somewhat careless. | R | responsibility | Que puede ser algo descuidado/a |
| 29 | Is emotionally stable, not easily upset. | R | emotional_volatility | Emocionalmente estable, que no se altera con facilidad |
| 30 | Has little creativity. | R | creative_imagination | Con poca creatividad |
| 31 | Is sometimes shy, introverted. | R | sociability | A veces tímido/a, introvertido/a |
| 32 | Is helpful and unselfish with others. | | compassion | Servicial y generoso/a con los demás |
| 33 | Keeps things neat and tidy. | | organization | Que mantiene todo limpio y ordenado |
| 34 | Worries a lot. | | anxiety | Que se preocupa mucho |
| 35 | Values art and beauty. | | aesthetic_sensitivity | Que valora el arte y la belleza |
| 36 | Finds it hard to influence people. | R | assertiveness | A quien le es difícil influir en los demás |
| 37 | Is sometimes rude to others. | R | respectfulness | Que a veces es grosero/a con los demás |
| 38 | Is efficient, gets things done. | | productiveness | Eficiente, que consigue que las cosas se hagan |
| 39 | Often feels sad. | | depression | Que a menudo se siente triste |
| 40 | Is complex, a deep thinker. | | intellectual_curiosity | Complejo/a, de pensamientos profundos |
| 41 | Is full of energy. | | energy_level | Lleno/a de energía |
| 42 | Is suspicious of others' intentions. | R | trust | Que desconfía de las intenciones de los demás |
| 43 | Is reliable, can always be counted on. | | responsibility | Fiable, con el/la que siempre se puede contar |
| 44 | Keeps their emotions under control. | R | emotional_volatility | Que controla sus emociones |
| 45 | Has difficulty imagining things. | R | creative_imagination | Que tiene dificultad para imaginarse las cosas |
| 46 | Is talkative. | | sociability | Hablador/a |
| 47 | Can be cold and uncaring. | R | compassion | Que puede ser frío/a e insensible |
| 48 | Leaves a mess, doesn't clean up. | R | organization | Que lo deja todo hecho un lío, que no limpia |
| 49 | Rarely feels anxious or afraid. | R | anxiety | Que raramente se siente ansioso/a o miedoso/a |
| 50 | Thinks poetry and plays are boring. | R | aesthetic_sensitivity | Que considera que la poesía y el teatro son aburridos |
| 51 | Prefers to have others take charge. | R | assertiveness | Que prefiere que otros asuman la responsabilidad |
| 52 | Is polite, courteous to others. | | respectfulness | Educado/a, cortés con los demás |
| 53 | Is persistent, works until the task is finished. | | productiveness | Tenaz, que trabaja hasta terminar la tarea |
| 54 | Tends to feel depressed, blue. | | depression | Que tiende a sentirse deprimido/a, melancólico/a |
| 55 | Has little interest in abstract ideas. | R | intellectual_curiosity | Con poco interés por ideas abstractas |
| 56 | Shows a lot of enthusiasm. | | energy_level | Que muestra mucho entusiasmo |
| 57 | Assumes the best about people. | | trust | Que piensa bien de la gente |
| 58 | Sometimes behaves irresponsibly. | R | responsibility | Que a veces se comporta de manera irresponsable |
| 59 | Is temperamental, gets emotional easily. | | emotional_volatility | Temperamental, que se exalta fácilmente |
| 60 | Is original, comes up with new ideas. | | creative_imagination | Original, que aporta ideas nuevas |

## La clave de corrección, tal como aparece en el apéndice

Idéntica a la `CLAVE_OFICIAL` de las pruebas; se copia para que este documento sea
autónomo.

**Dominios**

- Extraversion: 1, 6, 11R, 16R, 21, 26R, 31R, 36R, 41, 46, 51R, 56
- Agreeableness: 2, 7, 12R, 17R, 22R, 27, 32, 37R, 42R, 47R, 52, 57
- Conscientiousness: 3R, 8R, 13, 18, 23R, 28R, 33, 38, 43, 48R, 53, 58R
- Negative Emotionality: 4R, 9R, 14, 19, 24R, 29R, 34, 39, 44R, 49R, 54, 59
- Open-Mindedness: 5R, 10, 15, 20, 25R, 30R, 35, 40, 45R, 50R, 55R, 60

**Facetas**

- Sociability: 1, 16R, 31R, 46 · Assertiveness: 6, 21, 36R, 51R · Energy Level: 11R, 26R, 41, 56
- Compassion: 2, 17R, 32, 47R · Respectfulness: 7, 22R, 37R, 52 · Trust: 12R, 27, 42R, 57
- Organization: 3R, 18, 33, 48R · Productiveness: 8R, 23R, 38, 53 · Responsibility: 13, 28R, 43, 58R
- Anxiety: 4R, 19, 34, 49R · Depression: 9R, 24R, 39, 54 · Emotional Volatility: 14, 29R, 44R, 59
- Intellectual Curiosity: 10, 25R, 40, 55R · Aesthetic Sensitivity: 5R, 20, 35, 50R · Creative Imagination: 15, 30R, 45R, 60

## Notas para la fase 3

- El ítem 44 dice «Keeps **their** emotions under control»: el singular *they* es del
  formulario oficial, no se «corrige».
- El español tradujo 27 «Has a forgiving nature» como «Comprensivo/a con los demás» y 51
  «take charge» como «asuman la responsabilidad»: son decisiones de la adaptación
  oficial española, no errores; cada formulario manda en su idioma.
- La escala inglesa distingue «Disagree strongly» (1) de «Agree strongly» (5) con el
  punto medio «Neutral; no opinion»: el redactado exacto de arriba es el que debe llevar
  `en.json`, no una traducción del castellano.
