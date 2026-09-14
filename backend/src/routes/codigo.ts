import { Router } from "express";
import { generarCodigo, guardarCodigo, obtenerIntentosEnvio, obtenerEntrada, borrarCodigo } from "../codigosEnMemoria";
import type { ClienteCorreo } from "../resend";

const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITE_REENVIOS = 3;

export function crearRouterCodigo(clienteCorreo: ClienteCorreo): Router {
  const router = Router();

  router.post("/enviar-codigo", async (req, res) => {
    const correo = typeof req.body?.correo === "string" ? req.body.correo.trim() : "";

    if (!CORREO_REGEX.test(correo)) {
      return res.json({ ok: false, motivo: "correo_invalido" });
    }

    if (obtenerIntentosEnvio(correo) >= LIMITE_REENVIOS) {
      return res.json({ ok: false, motivo: "limite_alcanzado" });
    }

    const codigo = generarCodigo();

    try {
      await clienteCorreo.enviarCodigo(correo, codigo);
    } catch (error) {
      console.error("Error al enviar código:", error);
      return res.json({ ok: false, motivo: "error_envio" });
    }

    guardarCodigo(correo, codigo);
    return res.json({ ok: true });
  });

  router.post("/validar-codigo", (req, res) => {
    const correo = typeof req.body?.correo === "string" ? req.body.correo.trim() : "";
    const codigo = typeof req.body?.codigo === "string" ? req.body.codigo.trim() : "";

    const entrada = obtenerEntrada(correo);
    const valido = entrada !== undefined && entrada.codigo === codigo;

    if (valido) {
      borrarCodigo(correo);
    }

    return res.json({ valido });
  });

  return router;
}
