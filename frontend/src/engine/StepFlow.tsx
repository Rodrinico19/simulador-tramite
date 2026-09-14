import type { DefinicionPaso } from "./tipos";
import { useFlujo } from "./ContextoFlujo";
import { ProgressBar } from "../components/ProgressBar";
import { Banner } from "../components/Banner";
import { Button } from "../components/Button";

interface StepFlowProps<TDatos> {
  pasos: DefinicionPaso<TDatos>[];
  onSalir?: () => void;
}

export function StepFlow<TDatos>({ pasos, onSalir }: StepFlowProps<TDatos>) {
  const { pasoActual, totalPasos, datos, actualizarDatos, puedeAvanzar, errorPaso, avanzar, retroceder } =
    useFlujo<TDatos>();
  const paso = pasos[pasoActual];
  const Componente = paso.Componente;

  return (
    <div className="step-flow">
      <Banner texto="Esto es una simulación educativa. Ningún dato real de BPS se procesa aquí." />
      {onSalir && (
        <Button variante="secundario" onClick={onSalir}>
          Volver al inicio
        </Button>
      )}
      <ProgressBar pasoActual={pasoActual + 1} totalPasos={totalPasos} />
      <h2>{paso.titulo}</h2>
      <Componente datos={datos} actualizarDatos={actualizarDatos} />
      {errorPaso && (
        <p role="alert" className="error-paso">
          {errorPaso}
        </p>
      )}
      <div className="step-flow__navegacion">
        <Button variante="secundario" onClick={retroceder} disabled={pasoActual === 0}>
          Atrás
        </Button>
        {pasoActual < totalPasos - 1 && (
          <Button onClick={avanzar} disabled={!puedeAvanzar}>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
