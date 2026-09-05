// Los estilos de la pantalla de inicio.
//
// Mismo lenguaje visual que los informes Connect de la casa: marfil de fondo,
// bandas alternas, tarjetas de esquina redonda con borde suave, tipografía sans
// y el degradado naranja-dorado-verde reservado para el rótulo, el botón y las
// ondas. Los colores son los de src/config/marca.json.
//
// Sin acentos ni comillas curvas en los comentarios: este texto viaja dentro de
// una plantilla de JavaScript y conviene que no lleve nada raro.
export const estilosPortada = `
  /* ---- La pagina de inicio ---- */
  .inicio{display:block}
  .ancho{width:100%;max-width:64rem;margin:0 auto;padding-inline:clamp(1.25rem,4vw,2rem)}
  .ancho--estrecho{max-width:44rem}

  .banda{padding:clamp(3rem,7vw,5rem) 0;background:var(--ground)}
  .banda--blanca{background:var(--tarjeta)}
  .banda--menta{background:var(--menta)}
  .banda--melocoton{background:var(--melocoton)}
  .banda--cierre{background:var(--verde);color:#FDF9F3}
  .banda + .banda{border-top:1px solid var(--borde)}
  .banda--cierre{border-top:0}

  .inicio h2{font-family:"Montserrat",system-ui,sans-serif;font-weight:600;
    font-size:clamp(1.6rem,3.6vw,2.15rem);line-height:1.2;margin:0 0 1rem;color:var(--titulo)}
  .inicio h3{font-family:"Montserrat",system-ui,sans-serif;font-weight:600;
    font-size:1.02rem;line-height:1.35;margin:0 0 .35rem;color:var(--titulo)}
  .inicio p{margin:0 0 1rem;max-width:60ch}
  .ojo{font-family:"Montserrat",system-ui,sans-serif;font-size:.7rem;letter-spacing:.18em;
    text-transform:uppercase;color:var(--verde-texto);font-weight:700;margin:0 0 .55rem}
  .entradilla{font-size:1.06rem;color:var(--ink-soft);margin-bottom:2rem;max-width:62ch}
  .oculto{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

  /* ---- Hero ---- */
  .hero{position:relative;overflow:hidden;background:var(--ground);
    padding:clamp(2.5rem,6vw,4.5rem) 0 clamp(4rem,9vw,7rem);text-align:center}
  .hero__caja{display:flex;flex-direction:column;align-items:center;gap:1.15rem;
    position:relative;z-index:1;max-width:56rem}
  /* El logotipo de la casa, arriba a la izquierda, como la cabecera de
     cualquier pagina suya. El hero va centrado, asi que la marca tiene su
     propia fila: si estuviera dentro de la columna centrada, se centraria. */
  /* El logotipo a la izquierda y el selector de lengua a la derecha, arriba del
     todo: es donde se busca, y donde estaba antes —abajo, entre el codigo de
     acceso y la ola— habia que bajar hasta el final para encontrarlo. */
  .hero__marca{position:relative;z-index:1;text-align:left;
    display:flex;align-items:center;justify-content:space-between;gap:1rem;
    margin-bottom:clamp(1.6rem,5vw,3rem)}
  .hero__logo{height:clamp(26px,4.4vw,36px);width:auto;display:block;margin:0}
  /* Lleva colores fijos y el verde se pierde sobre el fondo oscuro. Como no se
     puede retocar el logotipo, se le da suelo claro. */
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]) .hero__logo{background:#F7F4EE;
      border-radius:10px;padding:.5rem .9rem}
  }
  :root[data-theme="dark"] .hero__logo{background:#F7F4EE;border-radius:10px;
    padding:.5rem .9rem}
  .hero p{max-width:46rem}
  /* El titular no debe pasar de tres lineas en pantalla grande: mas alto que
     eso y deja de leerse como un titulo. */
  .hero .hero__titular{max-width:56rem}
  /* Las ondas: decoracion de fondo, muy bajas de opacidad para que no compitan
     con el texto que tienen encima. */
  .ondas{position:absolute;left:0;right:0;bottom:-1px;width:100%;height:min(38vw,17rem);
    opacity:.16;pointer-events:none}
  .hero__titular{font-family:"Montserrat",system-ui,sans-serif;font-weight:600;
    font-size:clamp(1.22rem,2.5vw,1.68rem);line-height:1.32;color:var(--titulo);
    text-wrap:balance;margin:.4rem 0 0;max-width:52rem}
  .realce{background:linear-gradient(90deg,#F47A20 0%,#D5B447 55%,#5F927D 100%);
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .hero__base{font-family:"Montserrat",system-ui,sans-serif;font-size:.78rem;font-weight:600;
    letter-spacing:.12em;text-transform:uppercase;color:var(--verde-texto);margin:0}
  .hero__texto{font-size:1.06rem;color:var(--ink-soft);margin:0}
  .hero__rigor{display:flex;align-items:flex-start;gap:.6rem;text-align:left;
    background:var(--tarjeta);border:1px solid var(--borde);border-radius:12px;
    padding:.85rem 1.1rem;font-size:.94rem;color:var(--ink-soft);max-width:40rem;margin:0}
  .hero__rigor .ico{flex:none;color:var(--verde-medio);margin-top:.15rem}

  /* ---- Botones ---- */
  .cta{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
    min-height:52px;padding:.9rem 2.1rem;border:0;border-radius:999px;cursor:pointer;
    font-family:"Montserrat",system-ui,sans-serif;font-weight:600;font-size:1.02rem;
    color:#FFFFFF;background:linear-gradient(90deg,#C2410C 0%,#9A6207 50%,#27624F 100%);
    box-shadow:0 4px 14px rgba(39,98,79,.22);
    transition:transform .12s ease, box-shadow .12s ease, filter .12s ease}
  .cta:hover{transform:translateY(-1px);box-shadow:0 7px 20px rgba(39,98,79,.28);filter:saturate(1.08)}
  .cta:active{transform:translateY(0);box-shadow:0 2px 8px rgba(39,98,79,.24)}
  .banda--cierre .cta{background:#FFFDFC;color:var(--verde);box-shadow:0 4px 16px rgba(0,0,0,.18)}
  .micro{font-size:.88rem;color:var(--ink-soft);margin:0;max-width:38rem}
  .banda--cierre .micro{color:#D9E7DF}
  .banda--cierre h2{color:#FFFDFC}
  .banda--cierre p{color:#E4EFE9}
  .cierre{display:flex;flex-direction:column;align-items:center;text-align:center;gap:1rem}

  /* ---- La puerta, dentro del hero ---- */
  .puerta{display:flex;flex-direction:column;align-items:center;gap:.55rem;width:100%;max-width:26rem}
  .puerta__fila{display:flex;gap:.5rem;width:100%}
  .puerta__fila input{flex:1;min-width:0;font:inherit;color:inherit;background:var(--tarjeta);
    border:1px solid var(--borde);border-radius:999px;padding:.75rem 1.1rem;min-height:52px}
  .puerta__fila .cta{padding-inline:1.6rem;white-space:nowrap}
  .puerta .campo{align-items:center;text-align:center;margin:0;gap:.15rem}
  .puerta__error{color:#B3401A;font-size:.9rem;margin:0}

  /* ---- Retomar un test a medias ---- */
  .seguir{display:flex;flex-direction:column;align-items:center;gap:.8rem;
    background:var(--menta);border:1px solid var(--verde-suave-borde);
    border-radius:14px;padding:1.2rem 1.4rem;max-width:30rem;width:100%}
  .seguir__texto{margin:0;font-size:.96rem;color:var(--ink);text-align:center}
  .seguir__botones{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;
    justify-content:center}
  .seguir__botones .enlace{background:none;border:0;color:var(--verde-texto);
    font-weight:600;cursor:pointer;min-height:44px;padding:.5rem .3rem;
    text-decoration:underline;text-underline-offset:3px}

  /* ---- Tarjetas ---- */
  .rejilla{display:grid;gap:1rem}
  .rejilla--3{grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))}
  .rejilla--4{grid-template-columns:repeat(auto-fit,minmax(14rem,1fr))}
  .tarjeta{background:var(--tarjeta);border:1px solid var(--borde);border-radius:14px;
    padding:1.35rem 1.4rem;transition:transform .14s ease, box-shadow .14s ease, border-color .14s ease}
  .tarjeta:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(39,98,79,.09);
    border-color:var(--verde-suave-borde)}
  .tarjeta .ico{color:var(--verde-medio);margin-bottom:.7rem}
  .tarjeta p{margin:0;font-size:.95rem;color:var(--ink-soft);max-width:none}
  .banda--blanca .tarjeta{background:var(--ground)}
  .ico{width:26px;height:26px;display:block}

  /* ---- Desplegables ---- */
  .desplegable{background:var(--tarjeta);border:1px solid var(--borde);border-radius:14px;overflow:hidden}
  .banda--blanca .desplegable{background:var(--ground)}
  .desplegable__cab{display:flex;align-items:center;justify-content:space-between;gap:1rem;
    width:100%;text-align:left;background:none;border:0;cursor:pointer;padding:1.25rem 1.4rem;
    min-height:56px;font:inherit}
  .desplegable__cab b{font-family:"Montserrat",system-ui,sans-serif;font-weight:600;
    display:block;color:var(--titulo);font-size:1.05rem;margin-bottom:.2rem}
  .desplegable__resumen{display:block;font-size:.94rem;color:var(--ink-soft);max-width:52ch}
  .desplegable__flecha{flex:none;font-size:1.5rem;line-height:1;color:var(--verde-medio);
    transition:transform .2s ease}
  .desplegable__cab[aria-expanded="true"] .desplegable__flecha{transform:rotate(90deg)}
  .desplegable__cuerpo{padding:0 1.4rem 1.6rem}
  .desplegable__cuerpo .lista{margin-top:0}
  .desplegable__cuerpo > p:first-child{margin-top:0}

  /* ---- La pila de pliegues ---- */
  /* Cerrada, la pila tiene que seguir contando algo: por eso cada cabecera lleva
     su numero, su titulo y una linea de resumen. Quien pasa de largo se lleva
     los siete titulares; quien quiera el detalle, lo abre. */
  .pila{display:flex;flex-direction:column;gap:.7rem}
  .pliegue{background:var(--ground);border:1px solid var(--borde);border-radius:14px;
    transition:border-color .14s ease, box-shadow .14s ease}
  .banda--blanca .pliegue{background:var(--ground)}
  .pliegue:hover{border-color:var(--verde-suave-borde);box-shadow:0 4px 14px rgba(39,98,79,.07)}
  .pliegue .desplegable__cab{align-items:flex-start;gap:.9rem;padding:1.1rem 1.3rem}
  .pliegue__n{flex:none;display:grid;place-items:center;width:1.9rem;height:1.9rem;
    border-radius:50%;background:var(--menta);color:var(--verde-texto);font-weight:700;
    font-family:"Montserrat",system-ui,sans-serif;font-size:.86rem;margin-top:.1rem}
  .pliegue__texto{flex:1;min-width:0}
  .pliegue .desplegable__flecha{margin-top:.1rem}
  .pliegue[data-abierto="si"]{border-color:var(--verde-suave-borde)}
  .pliegue[data-abierto="si"] .pliegue__n{background:var(--verde);color:#FFFDFC}
  /* Dentro de un pliegue, las tarjetas van sobre el papel de la pagina para que
     se distingan del fondo del propio pliegue. */
  .pliegue .tarjeta,.pliegue .confianza > div,.pliegue .pasos li,.pliegue .ocean,
  .pliegue .recorrido li{background:var(--tarjeta)}
  .pliegue__sub{font-family:"Montserrat",system-ui,sans-serif;font-weight:600;
    font-size:1.12rem;color:var(--titulo);margin:2.2rem 0 .8rem;
    padding-top:1.4rem;border-top:1px solid var(--borde)}
  .pliegue .apartados{margin-bottom:0}
  .pliegue .oceanes{justify-content:flex-start}

  .lista{margin:0 0 1rem;padding-left:1.15rem;display:flex;flex-direction:column;gap:.5rem}
  .lista li{max-width:64ch}
  .destacado{border-left:3px solid var(--dorado);padding:.15rem 0 .15rem 1rem;
    font-size:1.02rem;color:var(--titulo);margin:1.4rem 0 0;max-width:60ch}
  .apunte{display:flex;align-items:flex-start;gap:.65rem;margin:1.6rem 0 0;font-size:.94rem;
    color:var(--ink-soft);max-width:64ch}
  .apunte .ico{flex:none;color:var(--verde-medio);margin-top:.1rem}

  /* ---- Banda de confianza ---- */
  .confianza{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1rem;
    margin:2.2rem 0 0;padding:0}
  .confianza > div{background:var(--tarjeta);border:1px solid var(--borde);border-radius:14px;
    padding:1.1rem 1.2rem}
  .confianza dt{font-family:"Montserrat",system-ui,sans-serif;font-weight:700;color:var(--verde-texto);
    font-size:1.05rem;margin-bottom:.2rem}
  .confianza dd{margin:0;font-size:.92rem;color:var(--ink-soft)}

  /* ---- Las cinco dimensiones ---- */
  /* Cinco tarjetas no caben en una fila legible, así que van tres y dos, con
     las dos de abajo centradas bajo las tres de arriba. */
  .oceanes{display:flex;flex-wrap:wrap;justify-content:center;gap:1rem}
  .ocean{flex:1 1 16rem;max-width:20rem}
  .ocean{background:var(--tarjeta);border:1px solid var(--borde);border-radius:14px;
    padding:1.3rem 1.35rem;border-top:4px solid var(--tono)}
  .ocean__cab{display:flex;align-items:flex-start;gap:.8rem;margin-bottom:.7rem}
  /* La letra va sobre el color del dominio, y su tinta se elige según lo claro
     que sea ese color: blanco sobre el verde y el azul, casi negro sobre el
     dorado, el naranja y el turquesa. */
  .ocean__letra{flex:none;display:grid;place-items:center;width:2.3rem;height:2.3rem;
    border-radius:50%;background:var(--tono);color:var(--tono-tinta,#FFFFFF);font-weight:700;
    font-family:"Montserrat",system-ui,sans-serif;font-size:1.1rem}
  .ocean h3{margin:0}
  .ocean__ingles{font-size:.8rem;font-style:italic;color:var(--ink-soft);margin:0;max-width:none}
  /* Los nombres de las facetas van en tinta, no en el color del dominio: en
     texto de este tamaño ninguno de los cinco colores llegaba al contraste
     mínimo. El color se queda donde es decoración —la insignia de la letra y el
     filete de arriba—, así que ninguna información depende de verlo. */
  .ocean__facetas{font-size:.9rem;color:var(--ink);font-weight:700;margin:0 0 .55rem;
    max-width:none}
  .ocean__texto{font-size:.94rem;color:var(--ink-soft);margin:0;max-width:none}

  /* ---- El recorrido del resultado ---- */
  .recorrido{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.7rem;
    list-style:none;margin:0 0 2rem;padding:0;counter-reset:none}
  .recorrido li{background:var(--ground);border:1px solid var(--borde);border-radius:12px;
    padding:1rem;display:flex;flex-direction:column;gap:.15rem;position:relative}
  .banda--blanca .recorrido li{background:var(--ground)}
  .recorrido__n{display:grid;place-items:center;width:1.6rem;height:1.6rem;border-radius:50%;
    background:var(--verde);color:#FFFFFF;font-size:.78rem;font-weight:700;margin-bottom:.3rem}
  .recorrido b{font-family:"Montserrat",system-ui,sans-serif;font-size:.95rem;color:var(--titulo)}
  .recorrido span:last-child{font-size:.85rem;color:var(--ink-soft)}

  /* ---- La muestra de informe ---- */
  .muestra{position:relative;border:1px solid var(--borde);border-radius:16px;overflow:hidden;
    background:var(--ground)}
  .muestra .muestra__sello{margin:0;padding:.6rem 1.2rem;background:var(--menta);
    font-family:"Montserrat",system-ui,sans-serif;font-size:.7rem;letter-spacing:.14em;
    text-transform:uppercase;color:var(--verde-texto);font-weight:700;
    border-bottom:1px solid var(--borde);max-width:none}
  /* Esta hoja es papel blanco FIJO, no una superficie del tema: imita el
     informe impreso. Todo lo que lleva encima tenia el color del tema, asi que
     en modo oscuro salia letra clara sobre blanco —1,22 de contraste—. Aqui
     dentro las tintas van fijas, como el papel. */
  .muestra__hoja{background:#FFFDFC;padding:1.5rem clamp(1.1rem,3vw,1.8rem) 1.6rem;
    color:#302A26}
  .muestra__hoja .ojo{color:#27624F}
  .muestra__hoja .muestra__nombre,.muestra__hoja .muestra__dato{color:#302A26}
  .muestra__hoja .muestra__dato em,.muestra__hoja .muestra__escala,
  .muestra__hoja .muestra__bloque p{color:#6E6862}
  .muestra__hoja .muestra__eje{background:#E9E4DA}
  .muestra__hoja .muestra__bloques{border-top-color:#E4DDD5}
  .muestra__hoja h4{font-family:"Montserrat",system-ui,sans-serif;font-weight:600;
    color:#27624F;margin:0 0 1rem;font-size:1.1rem}
  .muestra__fila{display:grid;grid-template-columns:minmax(6.5rem,9rem) 1fr auto;gap:.8rem;
    align-items:center;margin-bottom:.55rem}
  .muestra__nombre{font-size:.88rem}
  .muestra__eje{position:relative;height:8px;background:#E9E4DA;border-radius:2px;display:block}
  .muestra__relleno{position:absolute;left:0;top:0;bottom:0;border-radius:2px;opacity:.65;display:block}
  .muestra__dato{font-size:.85rem;font-variant-numeric:tabular-nums;text-align:right;
    min-width:5.6rem;color:var(--ink)}
  .muestra__dato em{font-style:normal;color:var(--ink-soft);font-size:.76rem}
  .muestra__escala{display:flex;justify-content:space-between;font-size:.72rem;color:var(--ink-soft);
    margin:.1rem 0 1.4rem;padding-left:calc(6.5rem + .8rem);padding-right:6.4rem;max-width:none}
  .muestra__bloques{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:.9rem;
    border-top:1px solid var(--borde);padding-top:1.2rem}
  .muestra__bloque p{font-size:.9rem;color:var(--ink-soft);margin:0;max-width:none}
  .muestra__bloque .ojo{margin-bottom:.3rem}

  /* ---- Listas del informe y pasos ---- */
  .apartados{margin:0;padding-left:1.4rem;display:flex;flex-direction:column;gap:.65rem;
    columns:2;column-gap:2.5rem}
  .apartados li{max-width:46ch;break-inside:avoid}
  .apartados b{color:var(--titulo)}
  .pasos{margin:0 0 .5rem;padding:0;list-style:none;counter-reset:paso;
    display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1rem}
  .pasos li{counter-increment:paso;background:var(--tarjeta);border:1px solid var(--borde);
    border-radius:14px;padding:1.2rem 1.3rem 1.2rem 3.3rem;position:relative;font-size:.95rem;
    color:var(--ink-soft)}
  .pasos li::before{content:counter(paso);position:absolute;left:1.2rem;top:1.15rem;
    display:grid;place-items:center;width:1.7rem;height:1.7rem;border-radius:50%;
    background:var(--dorado);color:#2B2317;font-weight:700;font-size:.82rem}
  .pasos b{display:block;color:var(--titulo);font-family:"Montserrat",system-ui,sans-serif;
    font-size:1rem;margin-bottom:.15rem}

  /* ---- Ficha y referencias ---- */
  .ficha{margin:0 0 1.4rem;display:grid;grid-template-columns:auto 1fr;gap:.45rem 1.2rem}
  .ficha dt{font-family:"Montserrat",system-ui,sans-serif;font-weight:600;color:var(--verde-texto);
    font-size:.92rem;white-space:nowrap}
  .ficha dd{margin:0;font-size:.95rem;color:var(--ink-soft)}
  .referencias{margin:0 0 1rem;padding-left:1.3rem;font-size:.9rem;color:var(--ink-soft);
    display:flex;flex-direction:column;gap:.55rem}
  .referencias a{color:var(--verde-texto)}
  .atribucion{font-size:.88rem;color:var(--ink-soft);margin:0}
  .lectura .lista li{color:var(--ink-soft)}
  .lectura .lista b{color:var(--ink)}

  /* ---- El pie de marca ----
     Las dos marcas de la casa, juntas y al final: IMPAUSA, que firma el
     producto, y LivePausa, que es el acompanamiento que hay detras. Aqui abajo
     y no en el hero, donde competirian con el rotulo. */
  .pie-marca{background:var(--tarjeta);border-top:1px solid var(--borde);
    padding:clamp(2rem,5vw,3rem) 0}
  .pie-marca__caja{display:flex;flex-direction:column;align-items:center;
    text-align:center;gap:1rem}
  .pie-marca__logos{display:flex;align-items:center;justify-content:center;
    gap:clamp(1.5rem,5vw,3rem);flex-wrap:wrap}
  /* Los dos logotipos tienen proporciones muy distintas —uno es una linea de
     texto y el otro casi cuadrado—, asi que se igualan por lo que se ve y no
     por una altura comun. */
  .pie-marca__impausa{height:26px;width:auto}
  .pie-marca__live{height:52px;width:auto}
  .pie-marca__contacto{margin:0;font-size:.94rem}
  .pie-marca__contacto a{color:var(--verde-texto);text-decoration:none;
    border-bottom:1px solid var(--borde)}
  .pie-marca__legal{margin:0;font-size:.82rem;color:var(--ink-soft)}
  /* Los logotipos llevan sus colores fijos y el verde oscuro se pierde sobre el
     fondo oscuro. No se pueden retocar, asi que se les da suelo claro. */
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]) .pie-marca__logos{background:#F7F4EE;
      border-radius:14px;padding:1rem 1.6rem}
  }
  :root[data-theme="dark"] .pie-marca__logos{background:#F7F4EE;
    border-radius:14px;padding:1rem 1.6rem}

  /* ---- Movil ---- */
  @media (max-width:640px){
    .ancho{padding-inline:20px}
    .apartados{columns:1}
    .hero__rigor{text-align:left}
    .puerta__fila{flex-direction:column}
    .puerta__fila .cta{width:100%}
    .cta{width:100%}
    .cierre .cta{width:100%}
    .muestra__fila{grid-template-columns:1fr auto;row-gap:.2rem}
    .muestra__eje{grid-column:1 / -1}
    .muestra__escala{padding-left:0;padding-right:0}
    .recorrido{grid-template-columns:1fr}
  }
  @media (max-width:380px){
    .ocean__cab{gap:.6rem}
  }
`;
