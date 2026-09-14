export interface EntradaCodigo {
  codigo: string;
  expira: number;
  intentosEnvio: number;
}

const DURACION_MS = 10 * 60 * 1000;

const codigos = new Map<string, EntradaCodigo>();

export function generarCodigo(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function guardarCodigo(correo: string, codigo: string): void {
  const existente = codigos.get(correo);
  codigos.set(correo, {
    codigo,
    expira: Date.now() + DURACION_MS,
    intentosEnvio: (existente?.intentosEnvio ?? 0) + 1,
  });
}

export function obtenerEntrada(correo: string): EntradaCodigo | undefined {
  const entrada = codigos.get(correo);
  if (!entrada) return undefined;
  if (Date.now() > entrada.expira) {
    codigos.delete(correo);
    return undefined;
  }
  return entrada;
}

export function obtenerIntentosEnvio(correo: string): number {
  return obtenerEntrada(correo)?.intentosEnvio ?? 0;
}

export function borrarCodigo(correo: string): void {
  codigos.delete(correo);
}

export function limpiarTodo(): void {
  codigos.clear();
}
