import { createContext, useContext, useState, type ReactNode } from "react";
import type { DefinicionPaso } from "./tipos";

interface EstadoFlujo<TDatos> {
  pasoActual: number;
  totalPasos: number;
  datos: TDatos;
  puedeAvanzar: boolean;
  errorPaso: string | null;
  actualizarDatos: (cambios: Partial<TDatos>) => void;
  avanzar: () => void;
  retroceder: () => void;
  establecerError: (mensaje: string | null) => void;
}

const ContextoFlujo = createContext<EstadoFlujo<unknown> | null>(null);

interface ProveedorFlujoProps<TDatos> {
  pasos: DefinicionPaso<TDatos>[];
  datosIniciales: TDatos;
  children: ReactNode;
}

export function ProveedorFlujo<TDatos>({ pasos, datosIniciales, children }: ProveedorFlujoProps<TDatos>) {
  const [pasoActual, setPasoActual] = useState(0);
  const [datos, setDatos] = useState<TDatos>(datosIniciales);
  const [errorPaso, setErrorPaso] = useState<string | null>(null);

  const actualizarDatos = (cambios: Partial<TDatos>) => {
    setDatos((anteriores) => ({ ...anteriores, ...cambios }));
  };

  const puedeAvanzar = pasos[pasoActual].esValido(datos);

  const avanzar = () => {
    if (!puedeAvanzar) return;
    setErrorPaso(null);
    setPasoActual((actual) => Math.min(actual + 1, pasos.length - 1));
  };

  const retroceder = () => {
    setErrorPaso(null);
    setPasoActual((actual) => Math.max(actual - 1, 0));
  };

  const valor: EstadoFlujo<TDatos> = {
    pasoActual,
    totalPasos: pasos.length,
    datos,
    puedeAvanzar,
    errorPaso,
    actualizarDatos,
    avanzar,
    retroceder,
    establecerError: setErrorPaso,
  };

  return <ContextoFlujo.Provider value={valor as EstadoFlujo<unknown>}>{children}</ContextoFlujo.Provider>;
}

export function useFlujo<TDatos>(): EstadoFlujo<TDatos> {
  const contexto = useContext(ContextoFlujo);
  if (!contexto) {
    throw new Error("useFlujo debe usarse dentro de ProveedorFlujo");
  }
  return contexto as EstadoFlujo<TDatos>;
}
