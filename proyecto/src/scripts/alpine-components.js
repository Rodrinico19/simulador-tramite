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

export function registerComponents(Alpine) {
  Alpine.data('carrusel', carrusel);
  Alpine.data('hoverIconos', hoverIconos);
  Alpine.data('apuntarQuieto', apuntarQuieto);
  Alpine.data('apuntarClic', apuntarClic);
  Alpine.data('pulso', pulso);
}
