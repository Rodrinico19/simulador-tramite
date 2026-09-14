import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProveedorFlujo } from "./ContextoFlujo";
import { StepFlow } from "./StepFlow";
import type { DefinicionPaso, PropsPaso } from "./tipos";

interface DatosPrueba {
  texto: string;
}

function PasoUno({ datos, actualizarDatos }: PropsPaso<DatosPrueba>) {
  return (
    <input aria-label="texto" value={datos.texto} onChange={(e) => actualizarDatos({ texto: e.target.value })} />
  );
}

function PasoDos() {
  return <p>Segundo paso</p>;
}

const pasosPrueba: DefinicionPaso<DatosPrueba>[] = [
  { id: "uno", titulo: "Paso uno", Componente: PasoUno, esValido: (d) => d.texto.length > 0 },
  { id: "dos", titulo: "Paso dos", Componente: PasoDos, esValido: () => true },
];

function renderFlujo() {
  return render(
    <ProveedorFlujo pasos={pasosPrueba} datosIniciales={{ texto: "" }}>
      <StepFlow pasos={pasosPrueba} />
    </ProveedorFlujo>,
  );
}

describe("StepFlow", () => {
  it("muestra el paso actual y el total", () => {
    renderFlujo();
    expect(screen.getByText("Paso 1 de 2")).toBeInTheDocument();
  });

  it("no permite avanzar si el paso no es válido", () => {
    renderFlujo();
    expect(screen.getByText("Siguiente")).toBeDisabled();
  });

  it("permite avanzar cuando el paso es válido y conserva los datos al volver", () => {
    renderFlujo();
    fireEvent.change(screen.getByLabelText("texto"), { target: { value: "hola" } });
    fireEvent.click(screen.getByText("Siguiente"));
    expect(screen.getByText("Segundo paso")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Atrás"));
    expect(screen.getByLabelText("texto")).toHaveValue("hola");
  });
});
