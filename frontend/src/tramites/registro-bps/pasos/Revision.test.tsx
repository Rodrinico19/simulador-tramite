import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Revision } from "./Revision";
import { datosIniciales } from "../tipos";

describe("Revision", () => {
  it("muestra los datos ingresados", () => {
    const datos = {
      ...datosIniciales,
      nombre: "Ana",
      apellido: "Gómez",
      cedula: "1.234.567-8",
      celular: "099111222",
      correo: "ana@ejemplo.com",
    };
    render(<Revision datos={datos} actualizarDatos={() => {}} />);
    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
    expect(screen.getByText("1.234.567-8")).toBeInTheDocument();
  });

  it("muestra el resultado y los aprendizajes tras confirmar", () => {
    render(<Revision datos={datosIniciales} actualizarDatos={() => {}} />);
    fireEvent.click(screen.getByText("Confirmar"));
    expect(screen.getByText("¡Listo! Practicaste todo el proceso.")).toBeInTheDocument();
  });
});
