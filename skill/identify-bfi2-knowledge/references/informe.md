# El informe: secciones, tono y esquema de salida

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
| 11 | Fuentes y metodología | código | Instrumento, adaptación y **la bibliografía completa**, generada desde `src/config/fuentes.json`: cinco referencias con autores, publicación y DOI, cada una diciendo qué aporta, más la atribución del copyright del BFI-2. Ninguna se escribe a mano y todas están verificadas contra Crossref; `tests/fuentes.test.ts` impide que quede una cita sin referencia o una referencia sin usar |
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

LOS DOMINIOS: DI LO QUE LAS FICHAS NO PUEDEN DECIR
Debajo de cada texto tuyo, el informe imprime la lectura de cada faceta tal como
viene de la base de conocimiento, con su cita. **No la repitas ni la
parafrasees**: quedaría dos veces y casi con las mismas palabras.

Tu párrafo dice lo que esas fichas no pueden decir, porque cada una está escrita
sin saber nada de las otras dos:
- qué significa que estas tres facetas concretas estén repartidas así
- cuál se separa de las demás, y qué noticia trae eso
- qué orden de prioridad se deriva para esta persona

Nombra las puntuaciones cuando ayuden a situarse, pero no vuelvas a explicar qué
es cada faceta ni qué implica su nivel: eso ya está escrito justo debajo.

LAS COMBINACIONES SÍ LAS ESCRIBES TÚ
Cada regla de `reglasQueHanDisparado` lleva una `clave`, y bajo esa clave
devuelves su pasaje en `combinaciones`. Una por regla, ni una más.

Encima de tu pasaje, el informe ya imprime el efecto de la regla, lo que
significa y su cita. **No lo repitas.** Tu pasaje aterriza esa regla en ESTE
perfil, y para eso tienes `seCumplePor`, que dice qué facetas y en qué banda la
han hecho saltar:
- qué se ve en esta persona por cumplirse las condiciones que se han cumplido
- qué tensión o qué ventaja concreta introduce, y con qué otra cosa del perfil
  se cruza
- qué hacer con eso

Van afirmadas: todas sus condiciones se cumplen y puedes citar su referencia.
Esa es la diferencia con las señales.

LAS SEÑALES NO LAS ESCRIBES TÚ
Las reglas «casi cumplidas» las redacta el código, que sabe exactamente cuál
falta y en qué banda está. Tú no tienes que mencionarlas en ninguna sección, y
sobre todo **no las afirmes**: les falta una condición, así que no describen a
esta persona.

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

PUNTO Y APARTE
Los pasajes largos van en varios párrafos, separados por una línea en blanco
dentro de la misma cadena. Doscientas palabras seguidas se leen mal por bien
escritas que estén: el ojo no encuentra dónde descansar.

Se parte donde cambia la idea, no cada tantas palabras:
- perfilEnUnaFrase: 2 párrafos
- enElTrabajo: 3 párrafos — lo que aporta, lo que cuesta, y qué hacer con ello
- conclusion: 2 párrafos
- cada dominio y cada paso del plan: uno solo, que ya son cortos

LONGITUDES
- titular: una línea, menos de 80 caracteres
- perfilEnUnaFrase: 120-150 palabras
- cada dominio: 80-110 palabras. Son cortos a propósito: la descripción de cada
  faceta ya la pone el informe debajo
- cada combinación: 80-120 palabras
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

**El bloque `combinaciones` se arma para cada perfil**: lleva una clave por regla
disparada —la `clave` que trae cada una en el material— y no aparece cuando no dispara
ninguna. El ejemplo de abajo es un perfil que dispara dos.

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "titular",
    "perfilEnUnaFrase",
    "dominios",
    "combinaciones",
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
          "maxLength": 900
        },
        "agreeableness": {
          "type": "string",
          "maxLength": 900
        },
        "conscientiousness": {
          "type": "string",
          "maxLength": 900
        },
        "negative_emotionality": {
          "type": "string",
          "maxLength": 900
        },
        "open_mindedness": {
          "type": "string",
          "maxLength": 900
        }
      }
    },
    "combinaciones": {
      "type": "object",
      "description": "Un pasaje por cada combinación que ha disparado, bajo la «clave» que trae cada una.",
      "additionalProperties": false,
      "required": [
        "relaciones_positivas",
        "orientacion_prosocial"
      ],
      "properties": {
        "relaciones_positivas": {
          "type": "string",
          "maxLength": 900
        },
        "orientacion_prosocial": {
          "type": "string",
          "maxLength": 900
        }
      }
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
      "type": "object",
      "additionalProperties": false,
      "required": [
        "paso1",
        "paso2",
        "paso3"
      ],
      "properties": {
        "paso1": {
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
        },
        "paso2": {
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
        },
        "paso3": {
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
      }
    },
    "conclusion": {
      "type": "string",
      "maxLength": 1000
    }
  }
}
```
