import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { crearApp } from "../app";
import { limpiarTodo } from "../codigosEnMemoria";
import type { ClienteCorreo } from "../resend";

describe("POST /api/enviar-codigo", () => {
  beforeEach(() => {
    limpiarTodo();
  });

  it("responde ok:false con motivo correo_invalido si el correo no tiene formato válido", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn() };
    const app = crearApp(clienteFalso);

    const respuesta = await request(app).post("/api/enviar-codigo").send({ correo: "no-es-correo" });

    expect(respuesta.body).toEqual({ ok: false, motivo: "correo_invalido" });
    expect(clienteFalso.enviarCodigo).not.toHaveBeenCalled();
  });

  it("envía el código y responde ok:true cuando el correo es válido", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockResolvedValue(undefined) };
    const app = crearApp(clienteFalso);

    const respuesta = await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });

    expect(respuesta.body).toEqual({ ok: true });
    expect(clienteFalso.enviarCodigo).toHaveBeenCalledWith("ana@ejemplo.com", expect.stringMatching(/^\d{6}$/));
  });

  it("responde error_envio si el cliente de correo falla", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockRejectedValue(new Error("falló")) };
    const app = crearApp(clienteFalso);

    const respuesta = await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });

    expect(respuesta.body).toEqual({ ok: false, motivo: "error_envio" });
  });

  it("responde limite_alcanzado después de 3 envíos exitosos", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockResolvedValue(undefined) };
    const app = crearApp(clienteFalso);

    for (let i = 0; i < 3; i++) {
      await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });
    }
    const respuesta = await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });

    expect(respuesta.body).toEqual({ ok: false, motivo: "limite_alcanzado" });
  });
});

describe("POST /api/validar-codigo", () => {
  beforeEach(() => {
    limpiarTodo();
  });

  it("responde valido:true con el código correcto y lo borra tras usarlo", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockResolvedValue(undefined) };
    const app = crearApp(clienteFalso);

    await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });
    const codigoEnviado = (clienteFalso.enviarCodigo as ReturnType<typeof vi.fn>).mock.calls[0][1];

    const primeraValidacion = await request(app)
      .post("/api/validar-codigo")
      .send({ correo: "ana@ejemplo.com", codigo: codigoEnviado });
    expect(primeraValidacion.body).toEqual({ valido: true });

    const segundaValidacion = await request(app)
      .post("/api/validar-codigo")
      .send({ correo: "ana@ejemplo.com", codigo: codigoEnviado });
    expect(segundaValidacion.body).toEqual({ valido: false });
  });

  it("responde valido:false con un código incorrecto", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockResolvedValue(undefined) };
    const app = crearApp(clienteFalso);

    await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });
    const respuesta = await request(app)
      .post("/api/validar-codigo")
      .send({ correo: "ana@ejemplo.com", codigo: "000000" });

    expect(respuesta.body).toEqual({ valido: false });
  });
});
