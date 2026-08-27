# Propuesta de baremos — pendiente de validar

> **Nada de este documento está en la configuración del motor.** Son los datos que he
> encontrado publicados, con sus problemas señalados, para que se decidan antes de
> entrar en `src/config/baremos.json`.

## De dónde salen

Gallardo-Pujol, D., Rouco, V., Cortijos-Bernabeu, A., Oceja, L., Soto, C. J., & John, O. P.
(2022). *Factor structure, gender invariance, measurement properties, and short forms of
the Spanish adaptation of the Big Five Inventory-2.* **Psychological Test Adaptation and
Development**. DOI 10.1027/2698-1866/a000020.

- **Postprint completo y abierto:** https://osf.io/download/hywba/
- Repositorio: https://osf.io/kp572/ — es **el mismo que cita tu Excel**, y de ahí sale
  también el `Spanish BFI-2 Form.pdf` que estamos usando (mismo fichero, 66.643 bytes).
- Licencia CC-BY.

Las cifras de abajo son la **Tabla 1 del artículo (Estudio 1)**, transcritas literalmente.

## Los números

| # | Dominio / Faceta | Hombres M | DT | Mujeres M | DT | Combinada M | DT | d |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **Extraversión** | 3,30 | 0,57 | 3,44 | 0,53 | 3,42 | 0,54 | 0,26 |
| 2 | Sociabilidad | 3,23 | 0,95 | 3,39 | 0,89 | 3,36 | 0,90 | 0,17 |
| 3 | Asertividad | 3,36 | 0,64 | 3,37 | 0,65 | 3,37 | 0,65 | 0,01 |
| 4 | Nivel de Energía | 3,55 | 0,76 | 3,74 | 0,68 | 3,71 | 0,70 | 0,28 |
| 5 | **Cordialidad** | 3,69 | 0,55 | 3,91 | 0,46 | 3,87 | 0,48 | 0,45 |
| 6 | Compasión | 3,85 | 0,66 | 4,10 | 0,59 | 4,06 | 0,61 | 0,42 |
| 7 | Respeto | 3,79 | 0,68 | 4,01 | 0,57 | 3,97 | 0,60 | 0,37 |
| 8 | Confianza | 3,44 | 0,70 | 3,62 | 0,63 | 3,58 | 0,64 | 0,27 |
| 9 | **Responsabilidad** | 3,26 | 0,64 | 3,43 | 0,66 | 3,40 | 0,66 | 0,26 |
| 10 | Organización | 3,28 | 0,97 | 3,38 | 0,97 | 3,36 | 0,97 | 0,10 |
| 11 | Productividad | 3,24 | 0,71 | 3,41 | 0,72 | 3,38 | 0,72 | 0,24 |
| 12 | Responsabilidad (faceta) | 3,27 | 0,63 | 3,51 | 0,64 | 3,47 | 0,64 | 0,37 |
| 13 | **Emocionalidad negativa** | 2,95 | 0,77 | 3,17 | 0,69 | 3,13 | 0,71 | 0,32 |
| 14 | Ansiedad | 3,29 | 0,85 | 3,68 | 0,70 | 3,61 | 0,74 | 0,53 |
| 15 | Depresión | 2,77 | 0,91 | 2,81 | 0,90 | 2,81 | 0,90 | 0,05 |
| 16 | Volatilidad emocional | 2,78 | 0,94 | 3,03 | 0,86 | 2,98 | 0,88 | 0,29 |
| 17 | **Apertura de mente** | 3,86 | 0,63 | 3,90 | 0,57 | 3,89 | 0,58 | 0,07 |
| 18 | Curiosidad intelectual | 4,05 | 0,70 | 4,06 | 0,62 | 4,06 | 0,64 | 0,02 |
| 19 | Sensibilidad estética | 3,65 | 0,96 | 3,87 | 0,84 | 3,83 | 0,87 | 0,25 |
| 20 | Imaginación creativa | 3,88 | 0,70 | 3,77 | 0,65 | 3,79 | 0,66 | −0,17 |
| | **N** | 182 | | 818 | | 1.000 | | |

`d` es la diferencia entre hombres y mujeres; positivo significa puntuación más alta en
mujeres. El artículo indica que a partir de 0,16 son significativas a *p* < .05.

## Los cuatro problemas de esta muestra

Esto es lo que hay que decidir, y por eso no lo he metido sin más:

**1. Son estudiantes, y jóvenes.** «Estudiantes de primero y segundo de Psicología de
dos universidades españolas» más bola de nieve por redes sociales. Edad media **23,1
años** (rango 17–75, DT 11,1). Si el test se usa con directivos y profesionales de 35 a
55, comparar contra una muestra de 23 años desplaza todas las bandas.

**2. Es una muestra de mujeres.** **81,8 % mujeres.** La columna «Combinada» es, en la
práctica, un baremo femenino. Y las diferencias por sexo no son triviales: Ansiedad
d = 0,53, Cordialidad d = 0,45, Compasión d = 0,42.

**3. No hay invarianza escalar por sexo.** El propio artículo indica que solo se
confirmó invarianza métrica. Traducido: comparar las medias directamente entre hombres y
mujeres no está plenamente justificado por los datos.

**4. Fiabilidad floja en las facetas.** Los dominios van bien (omega > .83, salvo
Cordialidad con .79). Pero de las 15 facetas, según el artículo: 5 por encima de ~.74,
**8 entre .64 y .73**, y **2 entre .55 y .60**. Son escalas de 4 ítems y era esperable,
pero significa que una faceta suelta sostiene menos peso que un dominio.

## Lo que propongo

**Baremo por sexo, no el combinado.** Con d = 0,53 en Ansiedad, usar la columna combinada
—que es 82 % femenina— haría que un hombre con ansiedad media apareciese como bajo. Si el
test pregunta el sexo, se aplica la columna que toque; si no lo pregunta, hay que
decidirlo, y esa es una decisión de producto además de psicométrica.

**Decir en el informe contra qué se compara.** Una línea: «percentiles calculados sobre
una muestra española de 1.000 personas, mayoritariamente universitarias y jóvenes
(Gallardo-Pujol et al., 2022)». Es honesto y no cuesta nada.

**Tratar las facetas con más prudencia que los dominios.** Propuesta concreta: las
afirmaciones de dominio se pueden hacer con normalidad; las de faceta suelta con
matices, y las dos facetas de fiabilidad más baja no deberían sostener solas ninguna
afirmación fuerte. Las reglas de combinación quedan a salvo, porque piden varias facetas
a la vez.

**Y sigue en pie la salida C.** En cuanto haya suficientes tests de personas reales de
IMPAUSA, un baremo propio de población adulta profesional sería mejor que este para el
uso que le vais a dar.

## Preguntas para Elisenda

1. ¿Es este el baremo español de referencia, o hay otro más reciente o con muestra
   general que no haya encontrado?
2. ¿Baremo por sexo o combinado, teniendo en cuenta que no hay invarianza escalar?
3. Con una muestra de edad media 23 años, ¿es defendible usarla con clientes de coaching
   de 35–55, o conviene declarar los resultados solo como posición en la escala hasta
   tener muestra propia?
4. Las dos facetas con fiabilidad entre .55 y .60, ¿cuáles son exactamente y qué
   prudencia recomienda al interpretarlas?
5. Las tres reglas marcadas `revision` en `combinations.json`: cuando el material dice
   «responsabilidad», ¿se refiere a la faceta de responsabilidad moral o al dominio?

---

## Pregunta añadida (6)

Al implementar el motor apareció una decisión de calibración que también le toca a ella:

**Cuando una regla del material dice «Alta Sociabilidad», ¿qué debería contar como
alta?** Solo el cuartil superior, o también quien está algo por encima de la media.

Con el caso de ejemplo, el criterio amplio activa 16 de las 26 reglas —entre disparadas
y a falta de una— y el estricto no dispara ninguna. La diferencia entre un informe que
dice demasiado y uno que no dice nada está justo en ese corte.

Ver la sección «La calibración» de [`02-modelo-interpretacion.md`](02-modelo-interpretacion.md).
