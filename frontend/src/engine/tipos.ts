import type { ComponentType } from "react";

export interface PropsPaso<TDatos> {
  datos: TDatos;
  actualizarDatos: (cambios: Partial<TDatos>) => void;
}

export interface DefinicionPaso<TDatos> {
  id: string;
  titulo: string;
  Componente: ComponentType<PropsPaso<TDatos>>;
  esValido: (datos: TDatos) => boolean;
}
