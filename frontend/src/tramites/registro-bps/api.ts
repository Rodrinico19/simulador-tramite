const URL_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type MotivoErrorEnvio = "limite_alcanzado" | "correo_invalido" | "error_envio";

export interface RespuestaEnviarCodigo {
  ok: boolean;
  motivo?: MotivoErrorEnvio;
}

export async function enviarCodigo(correo: string): Promise<RespuestaEnviarCodigo> {
  try {
    const respuesta = await fetch(`${URL_BASE}/api/enviar-codigo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo }),
    });
    return await respuesta.json();
  } catch {
    return { ok: false, motivo: "error_envio" };
  }
}

export async function validarCodigo(correo: string, codigo: string): Promise<{ valido: boolean }> {
  try {
    const respuesta = await fetch(`${URL_BASE}/api/validar-codigo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, codigo }),
    });
    return await respuesta.json();
  } catch {
    return { valido: false };
  }
}
