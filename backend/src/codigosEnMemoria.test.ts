import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generarCodigo,
  guardarCodigo,
  obtenerIntentosEnvio,
  obtenerEntrada,
  borrarCodigo,
  limpiarTodo,
} from "./codigosEnMemoria";

describe("codigosEnMemoria", () => {
  beforeEach(() => {
    limpiarTodo();
    vi.useRealTimers();
  });

  it("genera códigos de 6 dígitos", () => {
    const codigo = generarCodigo();
    expect(codigo).toMatch(/^\d{6}$/);
  });

  it("guarda un código y lo puede recuperar", () => {
    guardarCodigo("a@b.com", "123456");
    expect(obtenerEntrada("a@b.com")?.codigo).toBe("123456");
  });

  it("cuenta los intentos de envío", () => {
    guardarCodigo("a@b.com", "111111");
    guardarCodigo("a@b.com", "222222");
    expect(obtenerIntentosEnvio("a@b.com")).toBe(2);
  });

  it("expira el código después de 10 minutos", () => {
    vi.useFakeTimers();
    guardarCodigo("a@b.com", "123456");
    vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    expect(obtenerEntrada("a@b.com")).toBeUndefined();
    vi.useRealTimers();
  });

  it("borra el código", () => {
    guardarCodigo("a@b.com", "123456");
    borrarCodigo("a@b.com");
    expect(obtenerEntrada("a@b.com")).toBeUndefined();
  });
});
