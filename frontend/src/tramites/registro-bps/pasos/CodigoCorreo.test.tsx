import { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CodigoCorreo } from "./CodigoCorreo";
import { datosIniciales, type DatosRegistroBps } from "../tipos";
import { enviarCodigo, validarCodigo } from "../api";

vi.mock("../api");

const enviarCodigoMock = vi.mocked(enviarCodigo);
const validarCodigoMock = vi.mocked(validarCodigo);

function ContenedorDePrueba({ datosIniciales: iniciales }: { datosIniciales: DatosRegistroBps }) {
  const [datos, setDatos] = useState(iniciales);
  const actualizarDatos = (cambios: Partial<DatosRegistroBps>) => {
    setDatos((anteriores) => ({ ...anteriores, ...cambios }));
  };
  return <CodigoCorreo datos={datos} actualizarDatos={actualizarDatos} />;
}

describe("CodigoCorreo", () => {
  beforeEach(() => {
    enviarCodigoMock.mockReset();
    validarCodigoMock.mockReset();
  });

  it("muestra el campo de código y un mensaje de éxito cuando el envío responde ok:true", async () => {
    enviarCodigoMock.mockResolvedValue({ ok: true });
    const datos = { ...datosIniciales, correo: "ana@ejemplo.com" };

    render(<ContenedorDePrueba datosIniciales={datos} />);
    fireEvent.click(screen.getByText("Enviarme el código"));

    await waitFor(() => {
      expect(screen.getByLabelText("Código que recibiste por correo")).toBeInTheDocument();
    });
    expect(screen.getByText(/Te enviamos un código a tu correo/)).toBeInTheDocument();
  });

  it("muestra el mensaje de límite alcanzado sin mostrar el campo de código", async () => {
    enviarCodigoMock.mockResolvedValue({ ok: false, motivo: "limite_alcanzado" });
    const datos = { ...datosIniciales, correo: "ana@ejemplo.com" };

    render(<ContenedorDePrueba datosIniciales={datos} />);
    fireEvent.click(screen.getByText("Enviarme el código"));

    await waitFor(() => {
      expect(screen.getByText(/Ya pediste el código muchas veces/)).toBeInTheDocument();
    });
    expect(screen.queryByLabelText("Código que recibiste por correo")).not.toBeInTheDocument();
  });

  it("muestra 'Código validado correctamente.' y deshabilita Validar cuando el código es correcto", async () => {
    const datos = { ...datosIniciales, correo: "ana@ejemplo.com", codigoCorreoEnviado: true };
    validarCodigoMock.mockResolvedValue({ valido: true });

    render(<ContenedorDePrueba datosIniciales={datos} />);

    fireEvent.change(screen.getByLabelText("Código que recibiste por correo"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByText("Validar"));

    await waitFor(() => {
      expect(screen.getByText("Código validado correctamente.")).toBeInTheDocument();
    });
    expect(screen.getByText("Validar")).toBeDisabled();
  });

  it("muestra el mensaje de código incorrecto y mantiene el botón Validar habilitado", async () => {
    const datos = { ...datosIniciales, correo: "ana@ejemplo.com", codigoCorreoEnviado: true };
    validarCodigoMock.mockResolvedValue({ valido: false });

    render(<ContenedorDePrueba datosIniciales={datos} />);

    fireEvent.change(screen.getByLabelText("Código que recibiste por correo"), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByText("Validar"));

    await waitFor(() => {
      expect(screen.getByText(/no es correcto o venció/)).toBeInTheDocument();
    });
    expect(screen.getByText("Validar")).not.toBeDisabled();
  });
});
