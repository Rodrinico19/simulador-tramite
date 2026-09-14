import { Resend } from "resend";

export interface ClienteCorreo {
  enviarCodigo(correo: string, codigo: string): Promise<void>;
}

const apiKey = process.env.RESEND_API_KEY ?? "";
const remitente = process.env.EMAIL_REMITENTE ?? "onboarding@resend.dev";

let resendInstance: Resend | null = null;

function obtenerResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export const clienteResend: ClienteCorreo = {
  async enviarCodigo(correo, codigo) {
    const respuesta = await obtenerResend().emails.send({
      from: remitente,
      to: correo,
      subject: "Tu código de verificación — Trámites Fácil (simulación)",
      html: `<p>Tu código de verificación es: <strong>${codigo}</strong></p><p>Vence en 10 minutos. Esto es parte de una simulación educativa de Trámites Fácil, no es un trámite real de BPS.</p>`,
    });
    if (respuesta.error) {
      throw new Error(respuesta.error.message);
    }
  },
};
