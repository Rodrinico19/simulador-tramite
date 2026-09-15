import { describe, it, expect } from "vitest";
import { identificacionValida } from "./Identificacion";
import { datosIniciales } from "../tipos";

describe("identificacionValida", () => {
  it("rechaza cuando falta el número de documento", () => {
    const datos = { ...datosIniciales, numeroDocumento: "", codigoInvitacion: "1234-5678" };
    expect(identificacionValida(datos)).toBe(false);
  });

  it("rechaza un número de documento con letras o formato inválido", () => {
    const datos = { ...datosIniciales, numeroDocumento: "abc123", codigoInvitacion: "1234-5678" };
    expect(identificacionValida(datos)).toBe(false);
  });

  it("rechaza cuando el código de invitación no coincide con el simulado", () => {
    const datos = { ...datosIniciales, numeroDocumento: "1234567", codigoInvitacion: "0000-0000" };
    expect(identificacionValida(datos)).toBe(false);
  });

  it("acepta un número de documento válido con el código de invitación simulado", () => {
    const datos = { ...datosIniciales, numeroDocumento: "1234567", codigoInvitacion: "1234-5678" };
    expect(identificacionValida(datos)).toBe(true);
  });

  it("acepta el código de invitación sin el guión", () => {
    const datos = { ...datosIniciales, numeroDocumento: "1234567", codigoInvitacion: "12345678" };
    expect(identificacionValida(datos)).toBe(true);
  });

  it("rechaza un código de invitación con dígitos de más aunque tenga guión", () => {
    const datos = { ...datosIniciales, numeroDocumento: "1234567", codigoInvitacion: "1234-55678" };
    expect(identificacionValida(datos)).toBe(false);
  });
});
