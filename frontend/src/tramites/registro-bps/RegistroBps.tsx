import { ProveedorFlujo } from "../../engine/ContextoFlujo";
import { StepFlow } from "../../engine/StepFlow";
import { pasosRegistroBps } from "./pasos";
import { datosIniciales } from "./tipos";

interface RegistroBpsProps {
  onSalir: () => void;
}

export function RegistroBps({ onSalir }: RegistroBpsProps) {
  return (
    <ProveedorFlujo pasos={pasosRegistroBps} datosIniciales={datosIniciales}>
      <StepFlow pasos={pasosRegistroBps} onSalir={onSalir} />
    </ProveedorFlujo>
  );
}
