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

export function registerComponents(Alpine) {
  Alpine.data('carrusel', carrusel);
  Alpine.data('hoverIconos', hoverIconos);
  Alpine.data('apuntarQuieto', apuntarQuieto);
}
