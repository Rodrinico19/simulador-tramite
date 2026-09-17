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

export function registerComponents(Alpine) {
  Alpine.data('carrusel', carrusel);
  Alpine.data('hoverIconos', hoverIconos);
  Alpine.data('apuntarQuieto', apuntarQuieto);
  Alpine.data('apuntarClic', apuntarClic);
  Alpine.data('pulso', pulso);
  Alpine.data('puntosRojos', puntosRojos);
  Alpine.data('manzanas', manzanas);
  Alpine.data('dobleClic', dobleClic);
  Alpine.data('arrastrarSoltar', arrastrarSoltar);
  Alpine.data('clicDerecho', clicDerecho);
}
