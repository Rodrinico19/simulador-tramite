# Migración de proyecto/ a Astro + Alpine.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el sitio estático `proyecto/` (16 páginas HTML sueltas, un CSS de 782 líneas, JS inline duplicado) a un proyecto Astro con componentes reutilizables, manteniendo el diseño visual idéntico y usando Alpine.js para toda la interactividad.

**Architecture:** Astro genera HTML estático puro (sin servidor). Alpine.js se instala como dependencia npm, se inicializa una vez desde `BaseLayout.astro`, y cada patrón de juego/carrusel vive como un `Alpine.data(...)` factory reutilizable en `src/scripts/alpine-components.js`. Las páginas Astro son composiciones delgadas de layouts + componentes.

**Tech Stack:** Astro (^4.16), Alpine.js (^3.14), Node 24 (ya instalado), sin backend, sin tests automatizados (contenido visual/interactivo — ver Verificación en la spec).

**Spec:** `docs/superpowers/specs/2026-09-17-proyecto-astro-migration-design.md` — el plan asume ese diseño; los ejecutores deben leer ambos documentos.

## Global Constraints

- `proyecto/` tiene su propio `package.json`, **no** se agrega a los workspaces de la raíz (`tramites-facil`).
- Las URLs de salida deben mantenerse idénticas a los nombres de archivo actuales (ej. `modulo1-ejercicio3.html` → ruta `/modulo1-ejercicio3`).
- No se modifica ninguna regla CSS existente durante la reorganización — solo se reparte en archivos.
- No se agregan tests automatizados — la verificación de cada tarea es visual/funcional con `astro dev`.
- Todo el emoji/texto de la UI se mantiene exactamente igual al original (mismos textos en español, mismos iconos).
- El sitio sigue siendo 100% estático — sin llamadas a APIs, sin backend.

---

## Task 1: Scaffold del proyecto Astro

**Files:**
- Create: `proyecto/package.json`
- Create: `proyecto/astro.config.mjs`

**Interfaces:**
- Produces: comandos `npm run dev`, `npm run build`, `npm run preview` ejecutables desde `proyecto/`.

- [ ] **Step 1: Crear `proyecto/package.json`**

```json
{
  "name": "proyecto-computacion",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^4.16.0",
    "alpinejs": "^3.14.1"
  }
}
```

- [ ] **Step 2: Crear `proyecto/astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({});
```

- [ ] **Step 3: Instalar dependencias**

Run: `cd proyecto && npm install`
Expected: instala sin errores, crea `proyecto/node_modules` y `proyecto/package-lock.json`.

- [ ] **Step 4: Verificar que el servidor de desarrollo arranca**

Run (desde `proyecto/`, en background, matarlo después de confirmar): `npm run dev`
Expected: la consola muestra `astro  vX.X.X ready in` y una URL local (ej. `http://localhost:4321/`). Detener el proceso una vez confirmado.

- [ ] **Step 5: Commit**

```bash
git add proyecto/package.json proyecto/astro.config.mjs proyecto/package-lock.json
git commit -m "chore(proyecto): scaffold Astro project"
```

Nota: agregar `proyecto/node_modules/` y `proyecto/dist/` al `.gitignore` raíz si no están ya cubiertos (el `.gitignore` raíz ya ignora `node_modules/` y `dist/` globalmente, así que no hace falta tocarlo).

---

## Task 2: Mover assets a `public/` y dividir el CSS en 4 archivos

**Files:**
- Move: `proyecto/assets/**` → `proyecto/public/assets/**`
- Create: `proyecto/src/styles/base.css`
- Create: `proyecto/src/styles/carrusel.css`
- Create: `proyecto/src/styles/ejercicios.css`
- Create: `proyecto/src/styles/juegos.css`

**Interfaces:**
- Produces: 4 archivos CSS que `BaseLayout.astro` (Task 4) importará. Assets servidos en `/assets/...`.

- [ ] **Step 1: Mover assets**

```bash
git mv proyecto/assets proyecto/public/assets
```

- [ ] **Step 2: Crear `proyecto/src/styles/base.css`**

Copiar textualmente, sin modificar ninguna regla, las siguientes reglas de `proyecto/css/style.css` (el archivo original sigue en disco hasta la Tarea 18, usalo como fuente): `html`, `body`, `.header-pagina`, `.header-pagina h1`, `.header-pagina .volver`, `.header-pagina .volver:hover`, `.cursos`, `.curso-card`, `.curso-card .icono`, `.curso-card:hover, .curso-card:focus-visible`, `.curso-card--1`, `.curso-card--2`, `.volver`, `.volver:hover`, `.modulos-grid`, `.modulo-card`, `.modulo-card .icono`, `.modulo-card:hover, .modulo-card:focus-visible`, `.modulo-card--1` a `.modulo-card--8`, `.leccion`, `.leccion h2` (líneas 1–171 y 244–247 del original).

Agregar al final del archivo esta regla nueva (no existe en el original, es necesaria para Alpine — evita el parpadeo de elementos `x-show`/`x-cloak` antes de que Alpine inicialice):

```css
[x-cloak] {
  display: none !important;
}
```

- [ ] **Step 3: Crear `proyecto/src/styles/carrusel.css`**

Copiar textualmente estas reglas de `proyecto/css/style.css`: `.carrusel`, `.carrusel__img`, `.carrusel__controles`, `.carrusel__controles button`, `.carrusel__controles button:hover`, `.carrusel__contador`, `.descargas-multiples`, `.descargas-multiples .btn-descarga`, `.btn-descarga`, `.btn-descarga:hover` (líneas 173–242).

- [ ] **Step 4: Crear `proyecto/src/styles/ejercicios.css`**

Copiar textualmente estas reglas: `.juegos-grid`, `.juego-card`, `.juego-card--solo`, `.juego-card--solo p`, `.ejercicio-card`, `.ejercicio-card:hover, .ejercicio-card:focus-visible`, `.ejercicio-card .icono`, `.ejercicio-card h3`, `.ejercicio-card p`, `.ejercicio-card--1` a `--3`, `.juego-card h3`, `.juego-card p`, `.mensaje-exito`, `.contador-clic`, `.btn-reintentar`, `.btn-reintentar:hover` (líneas 249–353), y `.vidas`, `.corazon`, `.corazon.rota`, `.corazon.perdida`, `@keyframes romper-corazon`, `.mensaje-perdiste` (líneas 435–468).

- [ ] **Step 5: Crear `proyecto/src/styles/juegos.css`**

Copiar textualmente el resto de las reglas específicas de cada juego: `.juego-mover .iconos`, `.juego-mover .icono`, `.juego-mover .icono.marcado`, `.juego-quieto .objetivo` (líneas 355–397); `.area`, `.carpeta`, `.area--grande`, `.carpeta--centrada`, `.carpeta--grande` (líneas 399–434); `.pulso-zona`, `.pulso-pista`, `.pulso-etiqueta`, `.pulso-etiqueta--salida`, `.pulso-etiqueta--meta`, `.pulso-cuadrado` (líneas 470–514); `.hoja`, `.punto-rojo` (líneas 516–536); `.sello-cursor`, `.sello-cursor__cuerpo`, `.sello-cursor__base`, `.sello-cursor--presionado` (líneas 538–566); y desde `.arboles-contadores` hasta el final del archivo: `.escena`, `.sol`, `.suelo`, `.arboles`, `.arbol`, `.tronco`, `.hoja-copa`, `.hoja-copa--inferior`, `.hoja-copa--superior`, `.manzana`, `.manzana-cursor`, `.manzana-cursor__tallo`, `.manzana-cursor__cuerpo`, `.manzana-cursor--presionado`, `.menu-contextual`, `.menu-contextual button`, `.menu-contextual button:hover`, `.area--arrastre`, `.zona-destino`, `.zona-destino .icono`, `.zona-destino--activa`, `.archivo-arrastrable`, `.archivo-arrastrable:active`, `.carpeta--abierta`, `@keyframes abrir-carpeta` (líneas 567–783).

- [ ] **Step 6: Verificar que no falta ni sobra ninguna regla**

Run: `grep -c '^\.' proyecto/css/style.css` y contar selectores top-level en los 4 archivos nuevos combinados — deben coincidir en cantidad de bloques de reglas (los `@keyframes` y reglas con `,` cuentan como un bloque cada uno). Si hay diferencia, revisar qué regla quedó afuera.

- [ ] **Step 7: Commit**

```bash
git add proyecto/public/assets proyecto/src/styles
git commit -m "refactor(proyecto): split style.css into 4 files by responsibility, move assets to public/"
```

---

## Task 3: `alpine-init.js` y `alpine-components.js` (con `carrusel` como primer factory)

**Files:**
- Create: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/scripts/alpine-init.js`

**Interfaces:**
- Produces: `registerComponents(Alpine)` exportado desde `alpine-components.js`, usado por `alpine-init.js`. Cada tarea posterior (7–16) agrega su propio factory a este archivo y su línea de registro.
- Consumes: ninguno (primera pieza de lógica JS del proyecto).

- [ ] **Step 1: Crear `proyecto/src/scripts/alpine-components.js`**

```js
export function estadoVidasInicial(cantidad) {
  return Array.from({ length: cantidad }, () => 'entera');
}

export function romperVida(vidasArray) {
  let indice = -1;
  for (let i = vidasArray.length - 1; i >= 0; i--) {
    if (vidasArray[i] !== 'perdida') {
      indice = i;
      break;
    }
  }
  if (indice === -1) return;
  vidasArray[indice] = 'rota';
  setTimeout(() => {
    vidasArray[indice] = 'perdida';
  }, 350);
}

function carrusel(carpeta, archivos) {
  return {
    indice: 0,
    archivos,
    get total() {
      return this.archivos.length;
    },
    get src() {
      return `/assets/${carpeta}/${this.archivos[this.indice]}`;
    },
    get alt() {
      return `Diapositiva ${this.indice + 1} de ${this.total}`;
    },
    get contador() {
      return `${this.indice + 1} / ${this.total}`;
    },
    anterior() {
      this.indice = (this.indice - 1 + this.total) % this.total;
    },
    siguiente() {
      this.indice = (this.indice + 1) % this.total;
    }
  };
}

export function registerComponents(Alpine) {
  Alpine.data('carrusel', carrusel);
}
```

- [ ] **Step 2: Crear `proyecto/src/scripts/alpine-init.js`**

```js
import Alpine from 'alpinejs';
import { registerComponents } from './alpine-components.js';

registerComponents(Alpine);
window.Alpine = Alpine;
Alpine.start();
```

- [ ] **Step 3: Commit**

```bash
git add proyecto/src/scripts
git commit -m "feat(proyecto): add Alpine init and carrusel data component"
```

---

## Task 4: Layouts y componentes compartidos

**Files:**
- Create: `proyecto/src/layouts/BaseLayout.astro`
- Create: `proyecto/src/layouts/LeccionLayout.astro`
- Create: `proyecto/src/components/CursoCard.astro`
- Create: `proyecto/src/components/ModuloCard.astro`
- Create: `proyecto/src/components/EjercicioCard.astro`
- Create: `proyecto/src/components/BtnDescarga.astro`
- Create: `proyecto/src/components/Carrusel.astro`
- Create: `proyecto/src/components/juegos/Vidas.astro`
- Create: `proyecto/src/components/juegos/Contador.astro`
- Create: `proyecto/src/components/juegos/MensajeExito.astro`
- Create: `proyecto/src/components/juegos/MensajePerdiste.astro`
- Create: `proyecto/src/pages/_sanity.astro` (temporal, se borra en el Step de verificación)

**Interfaces:**
- Consumes: `alpine-init.js` (Task 3), estilos globales (Task 2).
- Produces: `BaseLayout` (prop `title`), `LeccionLayout` (props `title`, `tituloPagina`, `volverHref`), `Carrusel` (props `carpeta: string`, `archivos: string[]`), `CursoCard`/`ModuloCard`/`EjercicioCard` (props `href`, `icono`, `variante`, `titulo?`, slot = texto), `BtnDescarga` (prop `href`, slot = texto), `Vidas` (prop `array: string` = nombre de la variable Alpine con el array de estados), `Contador` (prop `expresion: string` = expresión Alpine para `x-text`), `MensajeExito`/`MensajePerdiste` (prop `show: string` = expresión Alpine para `x-show`, slot = texto del mensaje).

- [ ] **Step 1: Crear `proyecto/src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/base.css';
import '../styles/carrusel.css';
import '../styles/ejercicios.css';
import '../styles/juegos.css';

interface Props {
  title: string;
}

const { title } = Astro.props;
---
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
</head>
<body>
  <slot />
  <script>
    import '../scripts/alpine-init.js';
  </script>
</body>
</html>
```

- [ ] **Step 2: Crear `proyecto/src/layouts/LeccionLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
  tituloPagina: string;
  volverHref: string;
}

const { title, tituloPagina, volverHref } = Astro.props;
---
<BaseLayout title={title}>
  <div class="header-pagina">
    <a class="volver" href={volverHref}>&larr; Volver</a>
    <h1>{tituloPagina}</h1>
  </div>
  <slot />
</BaseLayout>
```

- [ ] **Step 3: Crear `proyecto/src/components/CursoCard.astro`**

```astro
---
interface Props {
  href: string;
  icono: string;
  variante: 1 | 2;
}

const { href, icono, variante } = Astro.props;
---
<a class={`curso-card curso-card--${variante}`} href={href}>
  <span class="icono">{icono}</span>
  <slot />
</a>
```

- [ ] **Step 4: Crear `proyecto/src/components/ModuloCard.astro`**

```astro
---
interface Props {
  href: string;
  icono: string;
  variante: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

const { href, icono, variante } = Astro.props;
---
<a class={`modulo-card modulo-card--${variante}`} href={href}>
  <span class="icono">{icono}</span>
  <slot />
</a>
```

- [ ] **Step 5: Crear `proyecto/src/components/EjercicioCard.astro`**

```astro
---
interface Props {
  href: string;
  icono: string;
  variante: 1 | 2 | 3;
  titulo: string;
}

const { href, icono, variante, titulo } = Astro.props;
---
<a class={`ejercicio-card ejercicio-card--${variante}`} href={href}>
  <span class="icono">{icono}</span>
  <h3>{titulo}</h3>
  <p><slot /></p>
</a>
```

- [ ] **Step 6: Crear `proyecto/src/components/BtnDescarga.astro`**

```astro
---
interface Props {
  href: string;
}

const { href } = Astro.props;
---
<a class="btn-descarga" href={href} download><slot /></a>
```

- [ ] **Step 7: Crear `proyecto/src/components/Carrusel.astro`**

```astro
---
interface Props {
  carpeta: string;
  archivos: string[];
}

const { carpeta, archivos } = Astro.props;
const archivosJson = JSON.stringify(archivos);
---
<div class="carrusel" x-data={`carrusel('${carpeta}', ${archivosJson})`}>
  <img class="carrusel__img" :src="src" :alt="alt">
  <div class="carrusel__controles">
    <button type="button" @click="anterior()">&larr; Anterior</button>
    <span class="carrusel__contador" x-text="contador"></span>
    <button type="button" @click="siguiente()">Siguiente &rarr;</button>
  </div>
</div>
```

- [ ] **Step 8: Crear `proyecto/src/components/juegos/Vidas.astro`**

```astro
---
interface Props {
  array: string;
}

const { array } = Astro.props;
---
<div class="vidas">
  <template x-for={`(v, i) in ${array}`} :key="i">
    <span
      class="corazon"
      :class="{ rota: v === 'rota' || v === 'perdida', perdida: v === 'perdida' }"
      x-text="v === 'entera' ? '❤️' : '💔'"
    ></span>
  </template>
</div>
```

- [ ] **Step 9: Crear `proyecto/src/components/juegos/Contador.astro`**

```astro
---
interface Props {
  expresion: string;
}

const { expresion } = Astro.props;
---
<p class="contador-clic" x-text={expresion}></p>
```

- [ ] **Step 10: Crear `proyecto/src/components/juegos/MensajeExito.astro`**

```astro
---
interface Props {
  show: string;
}

const { show } = Astro.props;
---
<p class="mensaje-exito" x-show={show} x-cloak><slot /></p>
```

- [ ] **Step 11: Crear `proyecto/src/components/juegos/MensajePerdiste.astro`**

```astro
---
interface Props {
  show: string;
}

const { show } = Astro.props;
---
<p class="mensaje-perdiste" x-show={show} x-cloak><slot /></p>
```

- [ ] **Step 12: Verificación visual temporal**

Crear `proyecto/src/pages/_sanity.astro`:

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Carrusel from '../components/Carrusel.astro';
---
<LeccionLayout title="Sanity" tituloPagina="Prueba de layout" volverHref="/">
  <div class="leccion">
    <Carrusel carpeta="clase1" archivos={["slide1.png","slide2.png","slide3.jpg","slide4.png","slide5.png","slide6.png","slide7.png","slide8.png"]} />
  </div>
</LeccionLayout>
```

Run: `npm run dev` (desde `proyecto/`) y abrir `http://localhost:4321/_sanity`.
Expected: se ve el header azul/violeta con "Volver" y "Prueba de layout", y debajo el carrusel navegable con los botones Anterior/Siguiente funcionando y el contador actualizándose. Confirmar visualmente, luego detener el servidor y borrar `proyecto/src/pages/_sanity.astro`.

- [ ] **Step 13: Commit**

```bash
git add proyecto/src/layouts proyecto/src/components
git commit -m "feat(proyecto): add shared layouts and presentational components"
```

---

## Task 5: `index.astro` + `curso1.astro`

**Files:**
- Create: `proyecto/src/pages/index.astro`
- Create: `proyecto/src/pages/curso1.astro`

**Interfaces:**
- Consumes: `BaseLayout`, `LeccionLayout`, `CursoCard`, `ModuloCard` (Task 4).

- [ ] **Step 1: Crear `proyecto/src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import CursoCard from '../components/CursoCard.astro';
---
<BaseLayout title="Proyecto">
  <div class="header-pagina">
    <h1>Aprende computacion</h1>
  </div>

  <div class="cursos">
    <CursoCard href="/curso1" icono="🖥️" variante={1}>Curso 1 de Computacion</CursoCard>
    <CursoCard href="/curso2" icono="💻" variante={2}>Curso 2 de Computacion</CursoCard>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Crear `proyecto/src/pages/curso1.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import ModuloCard from '../components/ModuloCard.astro';
---
<LeccionLayout title="Curso 1 de Computacion" tituloPagina="Curso 1 de Computacion" volverHref="/">
  <div class="modulos-grid">
    <ModuloCard href="/modulo1" icono="🖱️" variante={1}>Modulo 1 - Introduccion - Mouse Basico</ModuloCard>
    <ModuloCard href="/modulo2" icono="🎯" variante={2}>Modulo 2 - Mouse Medio</ModuloCard>
    <ModuloCard href="/modulo3" icono="⌨️" variante={3}>Modulo 3 - Teclado</ModuloCard>
    <ModuloCard href="/modulo4" icono="🖥️" variante={4}>Modulo 4 - Escritorio</ModuloCard>
    <ModuloCard href="/modulo5" icono="🗂️" variante={5}>Modulo 5 - Ventanas y Explorador</ModuloCard>
    <ModuloCard href="/modulo6" icono="📝" variante={6}>Modulo 6 - Word Basico</ModuloCard>
    <ModuloCard href="/modulo7" icono="🌐" variante={7}>Modulo 7 - Internet</ModuloCard>
    <ModuloCard href="/modulo8" icono="🔒" variante={8}>Modulo 8 - Seguridad Informatica</ModuloCard>
  </div>
</LeccionLayout>
```

Nota: los links a `/modulo6`, `/modulo7`, `/modulo8` no tienen página destino todavía (tampoco la tenían en el sitio original — son módulos futuros fuera de alcance de esta migración).

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/` y `/curso1`.
Expected: `/` muestra las 2 tarjetas de curso con gradientes azul/naranja; `/curso1` muestra las 8 tarjetas de módulo con sus 8 gradientes distintos y el link "Volver" apunta a `/`.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/pages/index.astro proyecto/src/pages/curso1.astro
git commit -m "feat(proyecto): migrate index and curso1 pages to Astro"
```

---

## Task 6: `modulo1.astro`

**Files:**
- Create: `proyecto/src/pages/modulo1.astro`

**Interfaces:**
- Consumes: `LeccionLayout`, `Carrusel`, `BtnDescarga`, `EjercicioCard` (Task 4).

- [ ] **Step 1: Crear `proyecto/src/pages/modulo1.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Carrusel from '../components/Carrusel.astro';
import BtnDescarga from '../components/BtnDescarga.astro';
import EjercicioCard from '../components/EjercicioCard.astro';
---
<LeccionLayout title="Modulo 1 - Raton Basico" tituloPagina="Modulo 1 - Introduccion - Mouse Basico" volverHref="/curso1">
  <div class="leccion">
    <Carrusel carpeta="clase1" archivos={["slide1.png", "slide2.png", "slide3.jpg", "slide4.png", "slide5.png", "slide6.png", "slide7.png", "slide8.png"]} />
    <BtnDescarga href="/assets/descargas/clase1.pdf">Descargar PDF de la clase</BtnDescarga>
  </div>

  <div class="leccion ejercicios">
    <h2>Ejercicios Practicos</h2>
    <div class="juegos-grid">
      <EjercicioCard href="/modulo1-ejercicio1" icono="🖱️" variante={1} titulo="Mover la Flechita">Pasa el mouse por encima de los 8 iconos, sin hacer clic.</EjercicioCard>
      <EjercicioCard href="/modulo1-ejercicio2" icono="🎯" variante={2} titulo="Apuntar y Quedarse Quieto">Poné el mouse sobre el circulo y no lo muevas por 15 segundos.</EjercicioCard>
      <EjercicioCard href="/modulo1-ejercicio3" icono="👆" variante={3} titulo="Apuntar y Hacer Clic">Buscá y hacele clic a 30 carpetas, una por una.</EjercicioCard>
    </div>
  </div>

  <div class="leccion ejercicios">
    <h2>Mas Ejercicios</h2>
    <div class="juegos-grid">
      <EjercicioCard href="/modulo1-ejercicio4" icono="↔️" variante={1} titulo="Practicar el Pulso">Mové el cuadrado de izquierda a derecha dentro de la franja, sin salirte.</EjercicioCard>
      <EjercicioCard href="/modulo1-ejercicio5" icono="🔴" variante={2} titulo="Hacer Puntos Rojos">Hacé clic izquierdo en la hoja para dejar 20 puntos rojos.</EjercicioCard>
      <EjercicioCard href="/modulo1-ejercicio6" icono="🍎" variante={3} titulo="Colocar Manzanas al Arbolito">Hacé clic en las hojas verdes de los 3 arboles para poner manzanas, sin salirte del verde.</EjercicioCard>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 2: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo1`.
Expected: carrusel de 8 diapositivas (la 3ra es la `.jpg`, confirmar que carga igual que las `.png`), botón de descarga de PDF funcional, y las 6 tarjetas de ejercicio en dos filas de 3, con los links correctos (aunque las páginas de ejercicio todavía no existen — eso es esperado hasta las Tasks 7–12).

- [ ] **Step 3: Commit**

```bash
git add proyecto/src/pages/modulo1.astro
git commit -m "feat(proyecto): migrate modulo1 page to Astro"
```

---

## Task 7: `modulo1-ejercicio1` — hover en 8 iconos

**Files:**
- Modify: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/pages/modulo1-ejercicio1.astro`

**Interfaces:**
- Consumes: `estadoVidasInicial`/`romperVida` no se usan acá; `LeccionLayout`, `juegos/MensajeExito` (Task 4).
- Produces: `Alpine.data('hoverIconos', ...)`.

- [ ] **Step 1: Agregar el factory `hoverIconos` a `alpine-components.js`**

Agregar esta función antes de `registerComponents`, y agregar `Alpine.data('hoverIconos', hoverIconos);` dentro de `registerComponents`:

```js
function hoverIconos() {
  return {
    iconos: ['📁', '🖼️', '🎵', '📄', '🗑️', '📷', '🎬', '📚'],
    marcados: [],
    completado: false,
    marcar(i) {
      if (!this.marcados.includes(i)) this.marcados.push(i);
      this.completado = this.marcados.length === this.iconos.length;
    },
    reiniciar() {
      this.marcados = [];
      this.completado = false;
    }
  };
}
```

- [ ] **Step 2: Crear `proyecto/src/pages/modulo1-ejercicio1.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import MensajeExito from '../components/juegos/MensajeExito.astro';
---
<LeccionLayout title="Ejercicio 1 - Mover la Flechita" tituloPagina="Mover la Flechita" volverHref="/modulo1">
  <div class="leccion">
    <div class="juego-card juego-mover juego-card--solo" x-data="hoverIconos()">
      <p>Pasa el mouse por encima de los 8 iconos, sin hacer clic.</p>
      <div class="iconos">
        <template x-for="(icono, i) in iconos" :key="i">
          <span class="icono" :class="{ marcado: marcados.includes(i) }" @mouseenter="marcar(i)" x-text="icono"></span>
        </template>
      </div>
      <MensajeExito show="completado">✅ ¡Completado! Pasaste por los 8 iconos.</MensajeExito>
      <button type="button" class="btn-reintentar" @click="reiniciar()">Reiniciar</button>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo1-ejercicio1`.
Expected: pasar el mouse por los 8 círculos los marca en verde uno a uno; al pasar por los 8, aparece el mensaje de éxito; "Reiniciar" limpia las marcas y oculta el mensaje.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/scripts/alpine-components.js proyecto/src/pages/modulo1-ejercicio1.astro
git commit -m "feat(proyecto): migrate modulo1-ejercicio1 (hover icons game)"
```

---

## Task 8: `modulo1-ejercicio2` — apuntar y quedarse quieto

**Files:**
- Modify: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/pages/modulo1-ejercicio2.astro`

**Interfaces:**
- Produces: `Alpine.data('apuntarQuieto', ...)`, recibe `duracionMs: number`.

- [ ] **Step 1: Agregar el factory `apuntarQuieto` a `alpine-components.js`**

```js
function apuntarQuieto(duracionMs) {
  return {
    duracion: duracionMs,
    progreso: 0,
    intervalo: null,
    completado: false,
    get porcentaje() {
      return Math.min(100, Math.round((this.progreso / this.duracion) * 100));
    },
    entrar() {
      if (this.progreso >= this.duracion) return;
      this.intervalo = setInterval(() => {
        this.progreso += 100;
        if (this.progreso >= this.duracion) {
          clearInterval(this.intervalo);
          this.completado = true;
        }
      }, 100);
    },
    salir() {
      clearInterval(this.intervalo);
      if (this.progreso < this.duracion) {
        this.progreso = 0;
      }
    },
    reiniciar() {
      clearInterval(this.intervalo);
      this.progreso = 0;
      this.completado = false;
    }
  };
}
```

Agregar `Alpine.data('apuntarQuieto', apuntarQuieto);` a `registerComponents`.

- [ ] **Step 2: Crear `proyecto/src/pages/modulo1-ejercicio2.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import MensajeExito from '../components/juegos/MensajeExito.astro';
---
<LeccionLayout title="Ejercicio 2 - Apuntar y Quedarse Quieto" tituloPagina="Apuntar y Quedarse Quieto" volverHref="/modulo1">
  <div class="leccion">
    <div class="juego-card juego-quieto juego-card--solo" x-data="apuntarQuieto(15000)">
      <p>Poné el mouse sobre el circulo y no lo muevas por 15 segundos.</p>
      <div class="objetivo" :style="`--progreso:${porcentaje}`" @mouseenter="entrar()" @mouseleave="salir()" x-text="`${porcentaje}%`"></div>
      <MensajeExito show="completado">✅ ¡Completado! Te quedaste quieto 15 segundos.</MensajeExito>
      <button type="button" class="btn-reintentar" @click="reiniciar()">Reiniciar</button>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo1-ejercicio2`.
Expected: al poner el mouse sobre el círculo, el relleno verde avanza y el porcentaje sube cada 100ms; al sacar el mouse antes de 15s, se resetea a 0%; al completar 15s, aparece el mensaje de éxito.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/scripts/alpine-components.js proyecto/src/pages/modulo1-ejercicio2.astro
git commit -m "feat(proyecto): migrate modulo1-ejercicio2 (stay-still game)"
```

---

## Task 9: `modulo1-ejercicio3` — apuntar y hacer clic

**Files:**
- Modify: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/pages/modulo1-ejercicio3.astro`

**Interfaces:**
- Produces: `Alpine.data('apuntarClic', ...)`, recibe `total: number`.

- [ ] **Step 1: Agregar el factory `apuntarClic` a `alpine-components.js`**

```js
function apuntarClic(total) {
  return {
    total,
    iconos: ['📁', '🗑️', '⚽', '🖥️', '🖱️', '⌨️', '📷', '🎵', '📄', '🎬'],
    clics: 0,
    x: 0,
    y: 0,
    icono: '📁',
    visible: false,
    completado: false,
    init() {
      this.mover();
    },
    mover() {
      const area = this.$refs.area;
      const maxX = Math.max(area.clientWidth - 120, 0);
      const maxY = Math.max(area.clientHeight - 120, 0);
      this.x = Math.random() * maxX;
      this.y = Math.random() * maxY;
      this.icono = this.iconos[Math.floor(Math.random() * this.iconos.length)];
      this.visible = true;
    },
    clic() {
      this.clics++;
      if (this.clics >= this.total) {
        this.completado = true;
        this.visible = false;
      } else {
        this.mover();
      }
    },
    reiniciar() {
      this.clics = 0;
      this.completado = false;
      this.mover();
    }
  };
}
```

Agregar `Alpine.data('apuntarClic', apuntarClic);` a `registerComponents`.

- [ ] **Step 2: Crear `proyecto/src/pages/modulo1-ejercicio3.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Contador from '../components/juegos/Contador.astro';
import MensajeExito from '../components/juegos/MensajeExito.astro';
---
<LeccionLayout title="Ejercicio 3 - Apuntar y Hacer Clic" tituloPagina="Apuntar y Hacer Clic" volverHref="/modulo1">
  <div class="leccion">
    <div class="juego-card juego-clic juego-card--solo" x-data="apuntarClic(30)">
      <p>Buscá el icono y hacele clic. Cada vez que le acertás, aparece otro distinto en otro lugar.</p>
      <Contador expresion="`${clics} / ${total}`" />
      <div class="area" x-ref="area">
        <button type="button" class="carpeta" x-show="visible" :style="`left:${x}px; top:${y}px`" x-text="icono" @click="clic()"></button>
      </div>
      <MensajeExito show="completado">✅ ¡Completado! Hiciste clic en los 30 iconos.</MensajeExito>
      <button type="button" class="btn-reintentar" @click="reiniciar()">Jugar de nuevo</button>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo1-ejercicio3`.
Expected: el icono cambia de posición e imagen en cada clic, el contador sube, y al llegar a 30/30 aparece el mensaje de éxito y el icono desaparece.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/scripts/alpine-components.js proyecto/src/pages/modulo1-ejercicio3.astro
git commit -m "feat(proyecto): migrate modulo1-ejercicio3 (point and click game)"
```

---

## Task 10: `modulo1-ejercicio4` — practicar el pulso

**Files:**
- Modify: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/pages/modulo1-ejercicio4.astro`

**Interfaces:**
- Consumes: `estadoVidasInicial`, `romperVida` (Task 3).
- Produces: `Alpine.data('pulso', ...)`, recibe `(totalPasadas, vidasIniciales, anchoZona)`.

- [ ] **Step 1: Agregar el factory `pulso` a `alpine-components.js`**

```js
function pulso(totalPasadas, vidasIniciales, anchoZona) {
  return {
    total: totalPasadas,
    vidas: estadoVidasInicial(vidasIniciales),
    vidasRestantes: vidasIniciales,
    pasadas: 0,
    enCamino: false,
    terminado: false,
    completado: false,
    mostrarCuadrado: false,
    cx: 0,
    cy: 0,
    mensajePerdiste: false,
    textoBoton: 'Reiniciar',
    mover(evento) {
      if (this.terminado) return;
      const zona = this.$refs.zona;
      const pista = this.$refs.pista;
      const zonaRect = zona.getBoundingClientRect();
      const pistaRect = pista.getBoundingClientRect();
      const mx = evento.clientX - zonaRect.left;
      const my = evento.clientY - zonaRect.top;

      this.mostrarCuadrado = true;
      this.cx = mx - 24;
      this.cy = my - 24;

      const pistaLeft = pistaRect.left - zonaRect.left;
      const pistaRight = pistaRect.right - zonaRect.left;
      const pistaTop = pistaRect.top - zonaRect.top;
      const pistaBottom = pistaRect.bottom - zonaRect.top;

      const dentro = mx >= pistaLeft && mx <= pistaRight && my >= pistaTop && my <= pistaBottom;
      const enSalida = dentro && mx <= pistaLeft + anchoZona;
      const enMeta = dentro && mx >= pistaRight - anchoZona;

      if (enMeta && this.enCamino) {
        this.completarPasada();
      } else if (dentro) {
        if (enSalida) this.enCamino = true;
      } else if (this.enCamino) {
        this.perderVida();
      }
    },
    completarPasada() {
      this.pasadas++;
      this.enCamino = false;
      if (this.pasadas >= this.total) {
        this.terminado = true;
        this.completado = true;
      }
    },
    perderVida() {
      this.vidasRestantes--;
      romperVida(this.vidas);
      this.enCamino = false;
      if (this.vidasRestantes <= 0) {
        this.terminado = true;
        setTimeout(() => {
          this.mensajePerdiste = true;
          this.textoBoton = 'Empezar de Nuevo';
        }, 400);
      }
    },
    reiniciar() {
      this.vidas = estadoVidasInicial(vidasIniciales);
      this.vidasRestantes = vidasIniciales;
      this.pasadas = 0;
      this.enCamino = false;
      this.terminado = false;
      this.completado = false;
      this.mensajePerdiste = false;
      this.textoBoton = 'Reiniciar';
      this.mostrarCuadrado = false;
    }
  };
}
```

Agregar `Alpine.data('pulso', pulso);` a `registerComponents`.

- [ ] **Step 2: Crear `proyecto/src/pages/modulo1-ejercicio4.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Vidas from '../components/juegos/Vidas.astro';
import Contador from '../components/juegos/Contador.astro';
import MensajeExito from '../components/juegos/MensajeExito.astro';
import MensajePerdiste from '../components/juegos/MensajePerdiste.astro';
---
<LeccionLayout title="Ejercicio 4 - Practicar el Pulso" tituloPagina="Practicar el Pulso" volverHref="/modulo1">
  <div class="leccion">
    <div class="juego-card juego-pulso juego-card--solo" x-data="pulso(10, 3, 90)">
      <p>Mové el mouse de "Salida" hasta "Meta" sin que el cuadrado se salga del rectángulo. Hay que completar 10 pasadas.</p>
      <Vidas array="vidas" />
      <Contador expresion="`Pasada ${pasadas} / ${total}`" />
      <div class="pulso-zona" x-ref="zona" @mousemove="mover($event)">
        <div class="pulso-pista" x-ref="pista">
          <span class="pulso-etiqueta pulso-etiqueta--salida">Salida</span>
          <span class="pulso-etiqueta pulso-etiqueta--meta">Meta</span>
        </div>
        <div class="pulso-cuadrado" x-show="mostrarCuadrado" :style="`left:${cx}px; top:${cy}px`"></div>
      </div>
      <MensajeExito show="completado">✅ ¡Completado! Hiciste las 10 pasadas.</MensajeExito>
      <MensajePerdiste show="mensajePerdiste">💔 ¡Te quedaste sin vidas!<br>Empezar de Nuevo</MensajePerdiste>
      <button type="button" class="btn-reintentar" @click="reiniciar()" x-text="textoBoton"></button>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo1-ejercicio4`.
Expected: el cuadrado azul sigue al mouse solo dentro de la pista; entrar por "Salida" y llegar a "Meta" sin salirse suma una pasada; salirse del rectángulo habiendo empezado el recorrido rompe un corazón (con la animación); perder los 3 corazones muestra el mensaje de derrota tras ~400ms y cambia el texto del botón; completar 10 pasadas muestra el mensaje de éxito.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/scripts/alpine-components.js proyecto/src/pages/modulo1-ejercicio4.astro
git commit -m "feat(proyecto): migrate modulo1-ejercicio4 (pulse/steadiness game)"
```

---

## Task 11: `modulo1-ejercicio5` — puntos rojos

**Files:**
- Modify: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/pages/modulo1-ejercicio5.astro`

**Interfaces:**
- Produces: `Alpine.data('puntosRojos', ...)`, recibe `total: number`.

- [ ] **Step 1: Agregar el factory `puntosRojos` a `alpine-components.js`**

```js
function puntosRojos(total) {
  return {
    total,
    puntos: [],
    selloVisible: false,
    sx: 0,
    sy: 0,
    presionado: false,
    mover(evento) {
      const rect = this.$refs.hoja.getBoundingClientRect();
      this.sx = evento.clientX - rect.left;
      this.sy = evento.clientY - rect.top;
      this.selloVisible = true;
    },
    salir() {
      this.selloVisible = false;
    },
    clic(evento) {
      this.presionado = true;
      setTimeout(() => {
        this.presionado = false;
      }, 150);
      if (this.puntos.length >= this.total) return;
      const rect = this.$refs.hoja.getBoundingClientRect();
      this.puntos.push({
        x: evento.clientX - rect.left,
        y: evento.clientY - rect.top
      });
    },
    reiniciar() {
      this.puntos = [];
    }
  };
}
```

Agregar `Alpine.data('puntosRojos', puntosRojos);` a `registerComponents`.

- [ ] **Step 2: Crear `proyecto/src/pages/modulo1-ejercicio5.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Contador from '../components/juegos/Contador.astro';
import MensajeExito from '../components/juegos/MensajeExito.astro';
---
<LeccionLayout title="Ejercicio 5 - Hacer Puntos Rojos" tituloPagina="Hacer Puntos Rojos" volverHref="/modulo1">
  <div class="leccion">
    <div class="juego-card juego-puntos juego-card--solo" x-data="puntosRojos(20)">
      <p>Hacé clic con el boton izquierdo del mouse en cualquier parte de la hoja para dejar un punto rojo.</p>
      <Contador expresion="`${puntos.length} / ${total}`" />
      <div class="hoja" x-ref="hoja" @mousemove="mover($event)" @mouseleave="salir()" @click="clic($event)">
        <template x-for="(p, i) in puntos" :key="i">
          <div class="punto-rojo" :style="`left:${p.x}px; top:${p.y}px`"></div>
        </template>
        <div class="sello-cursor" x-show="selloVisible" :class="{ 'sello-cursor--presionado': presionado }" :style="`left:${sx}px; top:${sy}px`">
          <div class="sello-cursor__cuerpo"></div>
          <div class="sello-cursor__base"></div>
        </div>
      </div>
      <MensajeExito show="puntos.length >= total">✅ ¡Completado! Hiciste los 20 puntos.</MensajeExito>
      <button type="button" class="btn-reintentar" @click="reiniciar()">Borrar y Reiniciar</button>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo1-ejercicio5`.
Expected: un sello sigue al mouse dentro de la hoja; cada clic izquierdo deja un punto rojo fijo y anima el sello (achicándose brevemente); al llegar a 20 puntos aparece el mensaje de éxito; "Borrar y Reiniciar" borra todos los puntos.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/scripts/alpine-components.js proyecto/src/pages/modulo1-ejercicio5.astro
git commit -m "feat(proyecto): migrate modulo1-ejercicio5 (red dots game)"
```

---

## Task 12: `modulo1-ejercicio6` — colocar manzanas al arbolito

**Files:**
- Modify: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/pages/modulo1-ejercicio6.astro`

**Interfaces:**
- Consumes: `estadoVidasInicial`, `romperVida` (Task 3).
- Produces: `Alpine.data('manzanas', ...)`, recibe `(metaPorArbol, vidasIniciales, distanciaMinima, radioManzana)`.

- [ ] **Step 1: Agregar el factory `manzanas` a `alpine-components.js`**

```js
function manzanas(metaPorArbol, vidasIniciales, distanciaMinima, radioManzana) {
  return {
    meta: metaPorArbol,
    radio: radioManzana,
    vidas: estadoVidasInicial(vidasIniciales),
    vidasRestantes: vidasIniciales,
    conteoPorArbol: [0, 0, 0],
    manzanasColocadas: [],
    terminado: false,
    completado: false,
    mensajePerdiste: false,
    textoBoton: 'Reiniciar',
    cursorVisible: false,
    presionado: false,
    cx: 0,
    cy: 0,
    mover(evento) {
      const rect = this.$refs.escena.getBoundingClientRect();
      this.cursorVisible = true;
      this.cx = evento.clientX - rect.left;
      this.cy = evento.clientY - rect.top;
    },
    salir() {
      this.cursorVisible = false;
    },
    buscarArbolEnPunto(x, y, escenaRect) {
      const arboles = this.$refs.escena.querySelectorAll('.arbol');
      for (const arbol of arboles) {
        const indice = Number(arbol.dataset.arbol);
        const copas = arbol.querySelectorAll('.hoja-copa');
        for (const copa of copas) {
          const rect = copa.getBoundingClientRect();
          const cx = rect.left + rect.width / 2 - escenaRect.left;
          const cy = rect.top + rect.height / 2 - escenaRect.top;
          const radio = rect.width / 2;
          const distancia = Math.hypot(x - cx, y - cy);
          if (distancia <= radio * 0.95) return indice;
        }
      }
      return -1;
    },
    demasiadoCerca(x, y) {
      return this.manzanasColocadas.some((m) => Math.hypot(m.x - x, m.y - y) < distanciaMinima);
    },
    clic(evento) {
      this.presionado = true;
      setTimeout(() => {
        this.presionado = false;
      }, 150);
      if (this.terminado) return;

      const rect = this.$refs.escena.getBoundingClientRect();
      const x = evento.clientX - rect.left;
      const y = evento.clientY - rect.top;
      const indiceArbol = this.buscarArbolEnPunto(x, y, rect);

      if (indiceArbol === -1) {
        this.perderVida();
        return;
      }
      if (this.demasiadoCerca(x, y)) {
        this.perderVida();
        return;
      }
      if (this.conteoPorArbol[indiceArbol] >= this.meta) return;

      this.manzanasColocadas.push({ x, y });
      this.conteoPorArbol[indiceArbol]++;

      const completo = this.conteoPorArbol.every((c) => c >= this.meta);
      if (completo) {
        this.terminado = true;
        this.completado = true;
      }
    },
    perderVida() {
      this.vidasRestantes--;
      romperVida(this.vidas);
      if (this.vidasRestantes <= 0) {
        this.terminado = true;
        setTimeout(() => {
          this.mensajePerdiste = true;
          this.textoBoton = 'Empezar de Nuevo';
        }, 400);
      }
    },
    reiniciar() {
      this.vidas = estadoVidasInicial(vidasIniciales);
      this.vidasRestantes = vidasIniciales;
      this.conteoPorArbol = [0, 0, 0];
      this.manzanasColocadas = [];
      this.terminado = false;
      this.completado = false;
      this.mensajePerdiste = false;
      this.textoBoton = 'Reiniciar';
      this.cursorVisible = false;
    }
  };
}
```

Agregar `Alpine.data('manzanas', manzanas);` a `registerComponents`.

- [ ] **Step 2: Crear `proyecto/src/pages/modulo1-ejercicio6.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Vidas from '../components/juegos/Vidas.astro';
import MensajeExito from '../components/juegos/MensajeExito.astro';
import MensajePerdiste from '../components/juegos/MensajePerdiste.astro';
---
<LeccionLayout title="Ejercicio 6 - Colocar Manzanas al Arbolito" tituloPagina="Colocar Manzanas al Arbolito" volverHref="/modulo1">
  <div class="leccion">
    <div class="juego-card juego-manzanas juego-card--solo" x-data="manzanas(20, 3, 36, 13)">
      <p>Hacé clic en las hojas verdes de los 3 arboles para poner manzanas. Si el punto queda fuera del verde, o muy pegado a otra manzana, perdés una vida.</p>
      <Vidas array="vidas" />
      <div class="arboles-contadores">
        <template x-for="(c, i) in conteoPorArbol" :key="i">
          <span x-text="`Arbol ${i + 1}: ${c} / ${meta}`"></span>
        </template>
      </div>
      <div class="escena" x-ref="escena" @mousemove="mover($event)" @mouseleave="salir()" @click="clic($event)">
        <div class="sol"></div>
        <div class="arboles">
          <div class="arbol" data-arbol="0">
            <div class="hoja-copa hoja-copa--superior"></div>
            <div class="hoja-copa hoja-copa--inferior"></div>
            <div class="tronco"></div>
          </div>
          <div class="arbol" data-arbol="1">
            <div class="hoja-copa hoja-copa--superior"></div>
            <div class="hoja-copa hoja-copa--inferior"></div>
            <div class="tronco"></div>
          </div>
          <div class="arbol" data-arbol="2">
            <div class="hoja-copa hoja-copa--superior"></div>
            <div class="hoja-copa hoja-copa--inferior"></div>
            <div class="tronco"></div>
          </div>
        </div>
        <div class="suelo"></div>
        <template x-for="(m, i) in manzanasColocadas" :key="i">
          <div class="manzana" :style="`left:${m.x}px; top:${m.y}px; width:${radio * 2}px; height:${radio * 2}px`"></div>
        </template>
        <div class="manzana-cursor" x-show="cursorVisible" :class="{ 'manzana-cursor--presionado': presionado }" :style="`left:${cx}px; top:${cy}px`">
          <div class="manzana-cursor__tallo"></div>
          <div class="manzana-cursor__cuerpo"></div>
        </div>
      </div>
      <MensajeExito show="completado">✅ ¡Completado! Los 3 arboles tienen sus manzanas.</MensajeExito>
      <MensajePerdiste show="mensajePerdiste">💔 ¡Te quedaste sin vidas!<br>Empezar de Nuevo</MensajePerdiste>
      <button type="button" class="btn-reintentar" @click="reiniciar()" x-text="textoBoton"></button>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo1-ejercicio6`.
Expected: clicks dentro del verde de cualquiera de los 3 árboles agregan una manzana y suman el contador de ese árbol; clicks fuera del verde o muy cerca de otra manzana rompen un corazón; completar 20/20 en los 3 árboles muestra el mensaje de éxito; perder las 3 vidas muestra el mensaje de derrota.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/scripts/alpine-components.js proyecto/src/pages/modulo1-ejercicio6.astro
git commit -m "feat(proyecto): migrate modulo1-ejercicio6 (apple tree game)"
```

---

## Task 13: `modulo2.astro`

**Files:**
- Create: `proyecto/src/pages/modulo2.astro`

**Interfaces:**
- Consumes: `LeccionLayout`, `Carrusel`, `BtnDescarga`, `EjercicioCard` (Task 4).

- [ ] **Step 1: Crear `proyecto/src/pages/modulo2.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Carrusel from '../components/Carrusel.astro';
import BtnDescarga from '../components/BtnDescarga.astro';
import EjercicioCard from '../components/EjercicioCard.astro';

const slidesClase2 = ['slide1.png', 'slide2.png', 'slide3.png', 'slide4.png', 'slide5.png', 'slide6.png', 'slide7.png', 'slide8.png', 'slide9.png', 'slide10.png', 'slide11.png', 'slide12.png'];
const slidesCarpetas = ['slide1.png', 'slide2.png', 'slide3.png', 'slide4.png', 'slide5.png', 'slide6.png', 'slide7.png', 'slide8.png', 'slide9.png'];
---
<LeccionLayout title="Modulo 2 - Mouse Medio" tituloPagina="Modulo 2 - Mouse Medio" volverHref="/curso1">
  <div class="leccion">
    <Carrusel carpeta="clase2" archivos={slidesClase2} />
    <BtnDescarga href="/assets/descargas/clase2.pdf">Descargar PDF de la clase</BtnDescarga>
  </div>

  <div class="leccion ejercicios">
    <h2>Ejercicios Practicos</h2>
    <div class="juegos-grid">
      <EjercicioCard href="/modulo2-ejercicio1" icono="🖱️" variante={1} titulo="Doble Clic">Hacele doble clic a la carpeta para abrirla, 10 veces.</EjercicioCard>
      <EjercicioCard href="/modulo2-ejercicio2" icono="📄" variante={2} titulo="Arrastrar y Soltar">Arrastrá el archivo hasta la carpeta, 8 veces.</EjercicioCard>
      <EjercicioCard href="/modulo2-ejercicio3" icono="🖱️" variante={3} titulo="Clic Derecho">Hacele clic derecho a la carpeta y elegí una opcion del menu, 10 veces.</EjercicioCard>
    </div>
  </div>

  <div class="leccion">
    <h2>Carpetas y Clic Derecho</h2>
    <Carrusel carpeta="clase2-carpetas" archivos={slidesCarpetas} />
    <div class="descargas-multiples">
      <BtnDescarga href="/assets/descargas/clase2-carpetas.pdf">Descargar Practica de Carpetas</BtnDescarga>
      <BtnDescarga href="/assets/descargas/manual-carpetas.pdf">Descargar Manual de Carpetas</BtnDescarga>
      <BtnDescarga href="/assets/descargas/deberes-carpetas.pdf">Descargar Deberes</BtnDescarga>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 2: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo2`.
Expected: dos carruseles independientes (12 y 9 diapositivas) navegan por separado sin interferirse entre sí; 3 tarjetas de ejercicio; 3 botones de descarga en la sección de carpetas.

- [ ] **Step 3: Commit**

```bash
git add proyecto/src/pages/modulo2.astro
git commit -m "feat(proyecto): migrate modulo2 page to Astro"
```

---

## Task 14: `modulo2-ejercicio1` — doble clic

**Files:**
- Modify: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/pages/modulo2-ejercicio1.astro`

**Interfaces:**
- Produces: `Alpine.data('dobleClic', ...)`, recibe `total: number`.

- [ ] **Step 1: Agregar el factory `dobleClic` a `alpine-components.js`**

```js
function dobleClic(total) {
  return {
    total,
    completados: 0,
    x: 0,
    y: 0,
    visible: true,
    abierta: false,
    icono: '📁',
    terminado: false,
    init() {
      this.mover();
    },
    mover() {
      const area = this.$refs.area;
      const maxX = Math.max(area.clientWidth - 120, 0);
      const maxY = Math.max(area.clientHeight - 120, 0);
      this.x = Math.random() * maxX;
      this.y = Math.random() * maxY;
      this.visible = true;
    },
    dobleClic() {
      this.icono = '📂';
      this.abierta = true;
      this.completados++;
      setTimeout(() => {
        this.abierta = false;
        this.icono = '📁';
        if (this.completados >= this.total) {
          this.terminado = true;
          this.visible = false;
        } else {
          this.mover();
        }
      }, 450);
    },
    reiniciar() {
      this.completados = 0;
      this.terminado = false;
      this.abierta = false;
      this.icono = '📁';
      this.mover();
    }
  };
}
```

Agregar `Alpine.data('dobleClic', dobleClic);` a `registerComponents`.

- [ ] **Step 2: Crear `proyecto/src/pages/modulo2-ejercicio1.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Contador from '../components/juegos/Contador.astro';
import MensajeExito from '../components/juegos/MensajeExito.astro';
---
<LeccionLayout title="Ejercicio 1 - Doble Clic" tituloPagina="Doble Clic" volverHref="/modulo2">
  <div class="leccion">
    <div class="juego-card juego-clic juego-card--solo" x-data="dobleClic(10)">
      <p>Hacele doble clic a la carpeta para abrirla. Cada vez que la abrís, aparece otra en otro lugar.</p>
      <Contador expresion="`${completados} / ${total}`" />
      <div class="area" x-ref="area">
        <button type="button" class="carpeta" :class="{ 'carpeta--abierta': abierta }" x-show="visible" :style="`left:${x}px; top:${y}px`" x-text="icono" @dblclick="dobleClic()"></button>
      </div>
      <MensajeExito show="terminado">✅ ¡Completado! Abriste las 10 carpetas.</MensajeExito>
      <button type="button" class="btn-reintentar" @click="reiniciar()">Jugar de nuevo</button>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo2-ejercicio1`.
Expected: doble clic en la carpeta la anima (abrir-carpeta), suma el contador y la reposiciona; al llegar a 10/10 aparece el mensaje de éxito.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/scripts/alpine-components.js proyecto/src/pages/modulo2-ejercicio1.astro
git commit -m "feat(proyecto): migrate modulo2-ejercicio1 (double click game)"
```

---

## Task 15: `modulo2-ejercicio2` — arrastrar y soltar

**Files:**
- Modify: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/pages/modulo2-ejercicio2.astro`

**Interfaces:**
- Produces: `Alpine.data('arrastrarSoltar', ...)`, recibe `total: number`.

- [ ] **Step 1: Agregar el factory `arrastrarSoltar` a `alpine-components.js`**

```js
function arrastrarSoltar(total) {
  return {
    total,
    completados: 0,
    arrastrando: false,
    offsetX: 0,
    offsetY: 0,
    ax: 40,
    ay: 0,
    visible: true,
    zonaActiva: false,
    terminado: false,
    init() {
      this.posicionInicial();
    },
    posicionInicial() {
      this.ax = 40;
      this.ay = this.$refs.area.clientHeight / 2 - 40;
    },
    empezar(evento) {
      this.arrastrando = true;
      const rect = this.$refs.archivo.getBoundingClientRect();
      this.offsetX = evento.clientX - rect.left;
      this.offsetY = evento.clientY - rect.top;
    },
    dentroDeZona() {
      const archivoRect = this.$refs.archivo.getBoundingClientRect();
      const zonaRect = this.$refs.zona.getBoundingClientRect();
      const cx = archivoRect.left + archivoRect.width / 2;
      const cy = archivoRect.top + archivoRect.height / 2;
      return cx >= zonaRect.left && cx <= zonaRect.right && cy >= zonaRect.top && cy <= zonaRect.bottom;
    },
    mover(evento) {
      if (!this.arrastrando) return;
      const areaRect = this.$refs.area.getBoundingClientRect();
      this.ax = evento.clientX - areaRect.left - this.offsetX;
      this.ay = evento.clientY - areaRect.top - this.offsetY;
      this.zonaActiva = this.dentroDeZona();
    },
    soltar() {
      if (!this.arrastrando) return;
      this.arrastrando = false;
      const dentro = this.dentroDeZona();
      this.zonaActiva = false;
      if (dentro) {
        this.completados++;
        if (this.completados >= this.total) {
          this.terminado = true;
          this.visible = false;
          return;
        }
      }
      this.posicionInicial();
    },
    reiniciar() {
      this.completados = 0;
      this.terminado = false;
      this.visible = true;
      this.posicionInicial();
    }
  };
}
```

Agregar `Alpine.data('arrastrarSoltar', arrastrarSoltar);` a `registerComponents`.

- [ ] **Step 2: Crear `proyecto/src/pages/modulo2-ejercicio2.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Contador from '../components/juegos/Contador.astro';
import MensajeExito from '../components/juegos/MensajeExito.astro';
---
<LeccionLayout title="Ejercicio 2 - Arrastrar y Soltar" tituloPagina="Arrastrar y Soltar" volverHref="/modulo2">
  <div class="leccion">
    <div class="juego-card juego-arrastre juego-card--solo" x-data="arrastrarSoltar(8)">
      <p>Hacé clic y mantené apretado sobre el archivo, arrastralo hasta la carpeta, y soltalo ahi.</p>
      <Contador expresion="`${completados} / ${total}`" />
      <div class="area area--arrastre" x-ref="area">
        <div class="zona-destino" x-ref="zona" :class="{ 'zona-destino--activa': zonaActiva }">
          <span class="icono">📁</span>
          Soltar aqui
        </div>
        <button
          type="button"
          class="archivo-arrastrable"
          x-ref="archivo"
          x-show="visible"
          :style="`left:${ax}px; top:${ay}px`"
          @mousedown="empezar($event)"
          @mousemove.window="mover($event)"
          @mouseup.window="soltar()"
        >📄</button>
      </div>
      <MensajeExito show="terminado">✅ ¡Completado! Arrastraste los 8 archivos.</MensajeExito>
      <button type="button" class="btn-reintentar" @click="reiniciar()">Jugar de nuevo</button>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo2-ejercicio2`.
Expected: al mantener presionado el archivo y mover el mouse, este sigue al cursor; la zona destino se resalta en verde cuando el archivo está encima; soltar dentro suma el contador y reposiciona el archivo; soltar fuera solo lo reposiciona; al llegar a 8/8 aparece el mensaje de éxito.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/scripts/alpine-components.js proyecto/src/pages/modulo2-ejercicio2.astro
git commit -m "feat(proyecto): migrate modulo2-ejercicio2 (drag and drop game)"
```

---

## Task 16: `modulo2-ejercicio3` — clic derecho

**Files:**
- Modify: `proyecto/src/scripts/alpine-components.js`
- Create: `proyecto/src/pages/modulo2-ejercicio3.astro`

**Interfaces:**
- Produces: `Alpine.data('clicDerecho', ...)`, recibe `total: number`.

- [ ] **Step 1: Agregar el factory `clicDerecho` a `alpine-components.js`**

```js
function clicDerecho(total) {
  return {
    total,
    clics: 0,
    visible: true,
    menuVisible: false,
    mx: 0,
    my: 0,
    terminado: false,
    abrirMenu(evento) {
      const rect = this.$refs.area.getBoundingClientRect();
      this.mx = evento.clientX - rect.left;
      this.my = evento.clientY - rect.top;
      this.menuVisible = true;
    },
    elegirOpcion() {
      this.menuVisible = false;
      this.clics++;
      if (this.clics >= this.total) {
        this.terminado = true;
        this.visible = false;
      } else {
        this.visible = true;
      }
    },
    cerrarMenuFuera(evento) {
      if (this.menuVisible && !evento.target.closest('.menu-contextual')) {
        this.menuVisible = false;
      }
    },
    reiniciar() {
      this.clics = 0;
      this.terminado = false;
      this.menuVisible = false;
      this.visible = true;
    }
  };
}
```

Agregar `Alpine.data('clicDerecho', clicDerecho);` a `registerComponents`.

- [ ] **Step 2: Crear `proyecto/src/pages/modulo2-ejercicio3.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Contador from '../components/juegos/Contador.astro';
import MensajeExito from '../components/juegos/MensajeExito.astro';
---
<LeccionLayout title="Ejercicio 3 - Clic Derecho" tituloPagina="Clic Derecho" volverHref="/modulo2">
  <div class="leccion">
    <div class="juego-card juego-clic juego-card--solo" x-data="clicDerecho(10)" @click.window="cerrarMenuFuera($event)">
      <p>Hacele clic con el boton derecho del mouse a la carpeta y elegí cualquier opcion del menu que aparece.</p>
      <Contador expresion="`${clics} / ${total}`" />
      <div class="area area--grande" x-ref="area" @contextmenu.prevent>
        <button type="button" class="carpeta carpeta--grande carpeta--centrada" x-show="visible" @contextmenu.prevent="abrirMenu($event)">📁</button>
        <div class="menu-contextual" x-show="menuVisible" x-cloak :style="`left:${mx}px; top:${my}px`">
          <button type="button" @click="elegirOpcion()">Abrir</button>
          <button type="button" @click="elegirOpcion()">Copiar</button>
          <button type="button" @click="elegirOpcion()">Eliminar</button>
        </div>
      </div>
      <MensajeExito show="terminado">✅ ¡Completado! Hiciste clic derecho 10 veces.</MensajeExito>
      <button type="button" class="btn-reintentar" @click="reiniciar()">Jugar de nuevo</button>
    </div>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo2-ejercicio3`.
Expected: clic derecho sobre la carpeta abre el menú contextual en la posición del cursor (sin abrir el menú nativo del navegador); elegir cualquier opción suma el contador y reaparece la carpeta; clic fuera del menú lo cierra sin sumar; al llegar a 10/10 aparece el mensaje de éxito.

- [ ] **Step 4: Commit**

```bash
git add proyecto/src/scripts/alpine-components.js proyecto/src/pages/modulo2-ejercicio3.astro
git commit -m "feat(proyecto): migrate modulo2-ejercicio3 (right click game)"
```

---

## Task 17: `modulo3.astro`, `modulo4.astro`, `modulo5.astro`

**Files:**
- Create: `proyecto/src/pages/modulo3.astro`
- Create: `proyecto/src/pages/modulo4.astro`
- Create: `proyecto/src/pages/modulo5.astro`

**Interfaces:**
- Consumes: `LeccionLayout`, `Carrusel`, `BtnDescarga` (Task 4).

- [ ] **Step 1: Crear `proyecto/src/pages/modulo3.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Carrusel from '../components/Carrusel.astro';
import BtnDescarga from '../components/BtnDescarga.astro';

const slides = ['slide1.png', 'slide2.png', 'slide3.png', 'slide4.png', 'slide5.png', 'slide6.png', 'slide7.png', 'slide8.png', 'slide9.png', 'slide10.png', 'slide11.png'];
---
<LeccionLayout title="Modulo 3 - Teclado" tituloPagina="Modulo 3 - Teclado" volverHref="/curso1">
  <div class="leccion">
    <Carrusel carpeta="clase3" archivos={slides} />
    <BtnDescarga href="/assets/descargas/clase3.pdf">Descargar PDF de la clase</BtnDescarga>
  </div>
</LeccionLayout>
```

- [ ] **Step 2: Crear `proyecto/src/pages/modulo4.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Carrusel from '../components/Carrusel.astro';
import BtnDescarga from '../components/BtnDescarga.astro';

const slides = ['slide1.png', 'slide2.png', 'slide3.png', 'slide4.png', 'slide5.png', 'slide6.png', 'slide7.png', 'slide8.png', 'slide9.png'];
---
<LeccionLayout title="Modulo 4 - Escritorio" tituloPagina="Modulo 4 - Escritorio" volverHref="/curso1">
  <div class="leccion">
    <Carrusel carpeta="clase4" archivos={slides} />
    <BtnDescarga href="/assets/descargas/clase4.pdf">Descargar PDF de la clase</BtnDescarga>
  </div>
</LeccionLayout>
```

- [ ] **Step 3: Crear `proyecto/src/pages/modulo5.astro`**

```astro
---
import LeccionLayout from '../layouts/LeccionLayout.astro';
import Carrusel from '../components/Carrusel.astro';
import BtnDescarga from '../components/BtnDescarga.astro';

const slides = ['slide1.png', 'slide2.png', 'slide3.png', 'slide4.png', 'slide5.png', 'slide6.png', 'slide7.png', 'slide8.png'];
---
<LeccionLayout title="Modulo 5 - Ventanas y Explorador" tituloPagina="Modulo 5 - Ventanas y Explorador" volverHref="/curso1">
  <div class="leccion">
    <Carrusel carpeta="clase5" archivos={slides} />
    <BtnDescarga href="/assets/descargas/clase5.pdf">Descargar PDF de la clase</BtnDescarga>
  </div>
</LeccionLayout>
```

- [ ] **Step 4: Verificar visualmente**

Run: `npm run dev`, abrir `/modulo3`, `/modulo4`, `/modulo5`.
Expected: cada uno muestra su carrusel (11, 9 y 8 diapositivas respectivamente) navegable y su botón de descarga de PDF correspondiente.

- [ ] **Step 5: Commit**

```bash
git add proyecto/src/pages/modulo3.astro proyecto/src/pages/modulo4.astro proyecto/src/pages/modulo5.astro
git commit -m "feat(proyecto): migrate modulo3, modulo4, modulo5 pages to Astro"
```

---

## Task 18: Limpieza final — borrar HTML/CSS viejo y build de producción

**Files:**
- Delete: los 16 `.html` originales en `proyecto/` (`index.html`, `curso1.html`, `modulo1.html`, `modulo1-ejercicio1.html` … `modulo1-ejercicio6.html`, `modulo2.html`, `modulo2-ejercicio1.html` … `modulo2-ejercicio3.html`, `modulo3.html`, `modulo4.html`, `modulo5.html`)
- Delete: `proyecto/css/` (carpeta completa, ya migrada a `src/styles/`)

**Interfaces:**
- Consumes: todas las páginas Astro de las Tasks 5–17 deben existir y estar verificadas antes de este paso.

- [ ] **Step 1: Confirmar que las 16 páginas Astro ya existen**

Run: `ls proyecto/src/pages/*.astro | wc -l` (desde la raíz del repo)
Expected: `16` (index, curso1, modulo1..5, y los 9 ejercicios de modulo1/modulo2).

- [ ] **Step 2: Borrar los HTML y el CSS viejos**

```bash
git rm proyecto/index.html proyecto/curso1.html \
  proyecto/modulo1.html proyecto/modulo1-ejercicio1.html proyecto/modulo1-ejercicio2.html \
  proyecto/modulo1-ejercicio3.html proyecto/modulo1-ejercicio4.html proyecto/modulo1-ejercicio5.html \
  proyecto/modulo1-ejercicio6.html \
  proyecto/modulo2.html proyecto/modulo2-ejercicio1.html proyecto/modulo2-ejercicio2.html \
  proyecto/modulo2-ejercicio3.html \
  proyecto/modulo3.html proyecto/modulo4.html proyecto/modulo5.html
git rm -r proyecto/css
```

- [ ] **Step 3: Build de producción**

Run: `cd proyecto && npm run build`
Expected: termina sin errores y genera `proyecto/dist/` con las 16 páginas (`dist/index.html`, `dist/curso1/index.html`, etc.) y `dist/assets/` con los PDFs e imágenes copiados.

- [ ] **Step 4: Recorrido final de verificación**

Run: `npm run preview` (sirve `dist/` localmente) y recorrer manualmente: `/`, `/curso1`, cada módulo, y cada ejercicio de módulo 1 y 2, confirmando que todo se ve y funciona igual que antes de la migración (texto grande, botones grandes, juegos funcionando, carruseles navegando, descargas de PDF funcionando).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(proyecto): remove legacy static HTML/CSS after Astro migration"
```

---

## Self-Review Notes

- **Cobertura de la spec:** las 16 páginas listadas en la spec tienen su task (Tasks 5–17); los 10 Alpine factories de la tabla de la spec están cubiertos (Tasks 3, 7–12, 14–16); la división del CSS en 4 archivos está en Task 2; la limpieza final está en Task 18.
- **Desvíos deliberados de la spec** (documentados acá porque afectan la lista de componentes original, no porque contradigan el objetivo): no se crearon `Vidas.astro`/`Contador.astro`/`MensajeExito.astro`/`MensajePerdiste.astro` como componentes puramente presentacionales estáticos — en cambio reciben expresiones Alpine como props de tipo `string` (ver Task 4), ya que el estado vive en el `x-data` de cada página y Astro no puede pasar estado reactivo entre componentes en build time. `BtnReintentar.astro` no se creó porque el texto del botón difiere en cada ejercicio y en dos casos es dinámico (`x-text="textoBoton"`), así que no aportaba reutilización real — el botón se escribe inline en cada página.
- **Nombres consistentes:** verificado que `estadoVidasInicial`/`romperVida` (Task 3) se usan con la misma firma en `pulso` (Task 10) y `manzanas` (Task 12); que todos los factories devueltos por `Alpine.data(...)` coinciden en nombre entre su definición y su registro en `registerComponents`; que las rutas (`volverHref`, `href` de `EjercicioCard`) usan consistentemente el formato `/modulo1-ejercicioN` sin `.html`.
- **Bug preservado intencionalmente:** `romperVida` replica el comportamiento original de "romper el corazón más a la derecha que no esté ya perdido" (no necesariamente el próximo a perder en un patrón estrictamente secuencial si se pierden vidas muy rápido) — es el comportamiento del código original, no se corrige porque está fuera de alcance de una migración.
