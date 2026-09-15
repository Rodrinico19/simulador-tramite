import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Revision } from "./Revision";
import { datosIniciales } from "../tipos";

describe("Revision", () => {
  it("muestra los datos ingresados", () => {
    const datos = {
      ...datosIniciales,
      numeroDocumento: "1234567",
    };
    render(<Revision datos={datos} actualizarDatos={() => {}} />);
    expect(screen.getByText("1234567")).toBeInTheDocument();
  });

  it("muestra el resultado y los aprendizajes tras confirmar", () => {
    render(<Revision datos={datosIniciales} actualizarDatos={() => {}} />);
    fireEvent.click(screen.getByText("Confirmar"));
    expect(screen.getByText("¡Listo! Practicaste todo el proceso.")).toBeInTheDocument();
  });
});
