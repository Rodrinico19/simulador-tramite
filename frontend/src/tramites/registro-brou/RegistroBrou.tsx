import "./registro-brou.css";
import { ProveedorFlujo } from "../../engine/ContextoFlujo";
import { StepFlow } from "../../engine/StepFlow";
import { pasosRegistroBrou } from "./pasos";
import { datosIniciales } from "./tipos";

interface RegistroBrouProps {
  onSalir: () => void;
}

export function RegistroBrou({ onSalir }: RegistroBrouProps) {
  return (
    <ProveedorFlujo pasos={pasosRegistroBrou} datosIniciales={datosIniciales}>
      <div className="brou-pagina">
        <header className="brou-pagina__header">
          <span className="brou-pagina__marca">BROU</span>
          <button type="button" className="brou-pagina__salir" onClick={onSalir}>
            <svg
              className="brou-pagina__salir-icono"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="M11 18l-6-6 6-6" />
            </svg>
            Volver al inicio
          </button>
        </header>
        <div className="brou-pagina__contenido">
          <StepFlow
            pasos={pasosRegistroBrou}
            textoBanner="Esto es una simulación educativa. Ningún dato real del BROU se procesa aquí."
          />
        </div>
        <footer className="brou-pagina__footer">
          <span className="brou-pagina__footer-marca">BANCO REPÚBLICA</span>
          <span className="brou-pagina__footer-links">
            Portal BROU · Seguridad · Gestión de Reclamos · © 2026 Banco República — Simulación educativa, no
            oficial
          </span>
        </footer>
      </div>
    </ProveedorFlujo>
  );
}
