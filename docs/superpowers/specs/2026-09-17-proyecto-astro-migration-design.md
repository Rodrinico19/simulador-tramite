# Migración de `proyecto/` a Astro + Alpine.js

## Contexto

`proyecto/` es un sitio de curso de computación para adultos mayores, hoy
16 archivos HTML sueltos + un único `css/style.css` (782 líneas) + JS
inline duplicado en 14 archivos. No tiene build, no está desplegado en
ningún lado (uso local por ahora), y es independiente del workspace npm
de la raíz (`tramites-facil`, que agrupa `frontend`/`backend`).

Objetivo: migrar todo el sitio a Astro, con componentes reutilizables
para el header/nav repetido, las tarjetas de módulo/ejercicio, el
carrusel de diapositivas, y los patrones comunes de juego (contador,
vidas, mensaje de éxito/derrota, botón reintentar). La interactividad
pasa de JS inline a Alpine.js.

## Alcance

- Migración completa de las 16 páginas actuales, de una sola vez (no
  incremental por módulo aprobado en partes).
- `proyecto/` mantiene su propio `package.json`, **no** se suma a los
  workspaces de la raíz.
- Las URLs de salida se mantienen idénticas a los nombres de archivo
  actuales (`modulo1-ejercicio3.html` → ruta `/modulo1-ejercicio3`,
  etc.) — no hay nada externo enlazando al sitio todavía, pero no hay
  motivo para cambiarlas.
- Además de la migración técnica, un **rediseño visual** para que el
  sitio se vea profesional/pulido (paleta de colores coherente,
  tipografía cuidada, spacing consistente, sombras/bordes suaves en
  tarjetas y botones) — manteniendo textos, botones y objetivos de
  clic **igual de grandes** que hoy (público de adultos mayores, ver
  [[feedback_elderly_ui_sizing]]). No se achica ni densifica nada, solo
  se le sube el nivel de terminación visual.
- Fuera de alcance: hosting/deploy (sigue siendo local),
  tests automatizados (no aportan valor para contenido mayormente
  visual/interactivo de este tipo).

## Arquitectura

```
proyecto/
├── package.json
├── astro.config.mjs
├── public/
│   └── assets/              (clase1..5, descargas, fondo — movidos tal cual)
└── src/
    ├── layouts/
    │   ├── BaseLayout.astro     (<head>, viewport, import de CSS global + Alpine)
    │   └── LeccionLayout.astro  (header-pagina con link "Volver" + slot de contenido)
    ├── components/
    │   ├── CursoCard.astro
    │   ├── ModuloCard.astro
    │   ├── EjercicioCard.astro
    │   ├── Carrusel.astro           (x-data="carrusel(totalSlides)")
    │   ├── BtnDescarga.astro
    │   └── juegos/
    │       ├── Vidas.astro          (corazones)
    │       ├── Contador.astro       (texto "N / META")
    │       ├── MensajeExito.astro
    │       ├── MensajePerdiste.astro
    │       └── BtnReintentar.astro
    ├── scripts/
    │   └── alpine-components.js     (Alpine.data(...) por juego, ver abajo)
    ├── styles/
    │   ├── base.css        (reset, tipografía, header-pagina, cursos/modulos grid, volver)
    │   ├── carrusel.css
    │   ├── ejercicios.css  (juego-card, contador-clic, btn-reintentar, mensaje-exito/perdiste, vidas/corazon)
    │   ├── juegos.css      (estilos específicos: pulso, manzanas/arboles, sello-cursor, arrastre, carpeta, menu-contextual, punto-rojo)
    │   └── global.css      (importa los 4 anteriores en orden)
    └── pages/
        ├── index.astro
        ├── curso1.astro
        ├── modulo1.astro
        ├── modulo1-ejercicio1.astro   Mover mouse sobre 8 iconos (hover, sin click)
        ├── modulo1-ejercicio2.astro   Apuntar y quedarse quieto 15s (timer)
        ├── modulo1-ejercicio3.astro   Apuntar y hacer clic (target que se reposiciona)
        ├── modulo1-ejercicio4.astro   Practicar el pulso (arrastre horizontal en franja)
        ├── modulo1-ejercicio5.astro   Puntos rojos con clic izquierdo
        ├── modulo1-ejercicio6.astro   Colocar manzanas al arbolito (colisión geométrica, vidas)
        ├── modulo2.astro
        ├── modulo2-ejercicio1.astro   Doble clic (carpeta que se reposiciona)
        ├── modulo2-ejercicio2.astro   Arrastrar y soltar archivo en carpeta
        ├── modulo2-ejercicio3.astro   Clic derecho + menú contextual
        ├── modulo3.astro
        ├── modulo4.astro
        └── modulo5.astro
```

## Componentes y CSS

- El CSS actual se reparte en los 4 archivos de arriba **sin modificar
  ninguna regla** — es una reorganización, no una reescritura visual.
- `LeccionLayout.astro` reemplaza el bloque `<div class="header-pagina">`
  repetido en las 15 páginas internas (todas menos `index.astro`).
- `EjercicioCard.astro` / `ModuloCard.astro` / `CursoCard.astro`
  reemplazan las tarjetas de grilla repetidas en `index`, `curso1`,
  `modulo1..5`.
- `Carrusel.astro` recibe `totalSlides` y la carpeta de assets como
  props, y usa `Alpine.data('carrusel', (total) => ({...}))` para
  next/prev/contador — reemplaza el carrusel duplicado en modulo1..5.

## Alpine components (`src/scripts/alpine-components.js`)

Un factory por patrón de juego, registrado una sola vez vía
`Alpine.data(...)` e importado en `BaseLayout.astro`:

| Alpine component | Usado en | Notas |
|---|---|---|
| `carrusel(total)` | Carrusel.astro (todos los módulos) | índice + contador, sin cambios de lógica |
| `hoverIconos()` | modulo1-ejercicio1 | trackea mouseenter por icono |
| `apuntarQuieto(segundos)` | modulo1-ejercicio2 | temporizador que se resetea al mover el mouse |
| `apuntarClic()` | modulo1-ejercicio3 | reposiciona target al acertar |
| `pulso()` | modulo1-ejercicio4 | arrastre dentro de franja, detecta salida de rango |
| `puntosRojos()` | modulo1-ejercicio5 | clic izquierdo deja punto en la posición |
| `manzanas()` | modulo1-ejercicio6 | vidas + colisión geométrica con las copas de los 3 árboles — la lógica interna sigue siendo imperativa (getBoundingClientRect, hipotenusa), solo cambia dónde vive |
| `dobleClic()` | modulo2-ejercicio1 | reposiciona carpeta, contador |
| `arrastrarSoltar()` | modulo2-ejercicio2 | drag & drop nativo (dragstart/dragover/drop) envuelto en Alpine |
| `clicDerecho()` | modulo2-ejercicio3 | contextmenu + menú de opciones |

Cada factory expone su propio estado y métodos; no hay estado
compartido entre juegos.

## Migración (orden de trabajo)

1. Scaffold del proyecto Astro dentro de `proyecto/` (`package.json`,
   `astro.config.mjs`), instalar Alpine.js.
2. `BaseLayout.astro` + `LeccionLayout.astro` + CSS dividido en 4
   archivos (copiado 1:1, reorganizado por responsabilidad).
3. Componentes compartidos (`CursoCard`, `ModuloCard`, `EjercicioCard`,
   `Carrusel`, `BtnDescarga`, componentes de `juegos/`).
4. `alpine-components.js` con los 10 factories de la tabla.
5. `index.astro` + `curso1.astro`.
6. Módulo 1: `modulo1.astro` + sus 6 ejercicios.
7. Módulo 2: `modulo2.astro` + sus 3 ejercicios.
8. Módulos 3, 4, 5.
9. Borrar los `.html` viejos y `css/style.css` original una vez
   verificado cada módulo; `astro build` final.

## Verificación

Sin tests automatizados (no aportan valor real acá). La verificación es
visual/funcional con `astro dev`, módulo por módulo, contra el sitio
actual:

- Texto y botones se ven igual de grandes (público de adultos mayores).
- Cada juego responde igual: mismos contadores, mismos mensajes de
  éxito/derrota, mismo comportamiento de reinicio.
- El carrusel de cada módulo navega igual (anterior/siguiente/contador).
- Los links "Volver" y las descargas de PDF siguen apuntando bien.
- `astro build` corre sin errores al final.

## Consideraciones futuras (fuera de alcance de esta migración)

- Cuando el proyecto escale y se agreguen usuarios/contraseñas
  (login), `proyecto/` se mantiene estático — el login se resuelve
  llamando a un backend aparte (por ejemplo el `backend` que ya existe
  en la raíz del workspace, `tramites-facil`), con Alpine.js haciendo
  el `fetch` al endpoint de auth y guardando la sesión/token en el
  cliente. No requiere pasar Astro a modo SSR ni tocar la arquitectura
  de esta migración.
