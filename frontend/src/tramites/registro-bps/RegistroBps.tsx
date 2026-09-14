import { ProveedorFlujo } from "../../engine/ContextoFlujo";
import { StepFlow } from "../../engine/StepFlow";
import { pasosRegistroBps } from "./pasos";
import { datosIniciales } from "./tipos";

export function RegistroBps() {
  return (
    <ProveedorFlujo pasos={pasosRegistroBps} datosIniciales={datosIniciales}>
      <StepFlow pasos={pasosRegistroBps} />
    </ProveedorFlujo>
  );
}
