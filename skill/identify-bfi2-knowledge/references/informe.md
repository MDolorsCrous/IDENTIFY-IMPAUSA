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
