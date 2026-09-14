import { useState } from "react";
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";
import { Button } from "../../../components/Button";
import { enviarCodigo, validarCodigo } from "../api";

export function CodigoCorreo({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [validando, setValidando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleEnviar = async () => {
    setEnviando(true);
    setMensaje(null);
    const respuesta = await enviarCodigo(datos.correo);
    setEnviando(false);
    if (respuesta.ok) {
      actualizarDatos({ codigoCorreoEnviado: true });
      setMensaje("Te enviamos un código a tu correo. Puede tardar unos minutos.");
    } else if (respuesta.motivo === "limite_alcanzado") {
      setMensaje("Ya pediste el código muchas veces. Esperá antes de volver a intentar.");
    } else if (respuesta.motivo === "correo_invalido") {
      setMensaje("Ese correo no parece válido. Volvé al paso anterior y revisalo.");
    } else {
      setMensaje("No pudimos enviar el código ahora. Probá de nuevo en un momento.");
    }
  };

  const handleValidar = async () => {
    setValidando(true);
    setMensaje(null);
    const { valido } = await validarCodigo(datos.correo, codigoIngresado);
    setValidando(false);
    if (valido) {
      actualizarDatos({ codigoCorreoValidado: true });
      setMensaje("¡Código correcto!");
    } else {
      setMensaje("Ese código no es correcto o venció. Podés pedir uno nuevo.");
    }
  };

  return (
    <div>
      <p>Vamos a mandarte un código real a tu correo para que practiques cómo se valida — no vamos a guardar tu correo.</p>
      <Button onClick={handleEnviar} disabled={enviando}>
        {enviando ? "Enviando…" : "Enviarme el código"}
      </Button>
      {datos.codigoCorreoEnviado && (
        <>
          <TextField
            id="codigo-correo"
            etiqueta="Código que recibiste por correo"
            value={codigoIngresado}
            onChange={(e) => setCodigoIngresado(e.target.value)}
          />
          <Button onClick={handleValidar} disabled={validando || codigoIngresado.trim().length === 0}>
            {validando ? "Validando…" : "Validar"}
          </Button>
        </>
      )}
      {mensaje && <p role="status">{mensaje}</p>}
      {datos.codigoCorreoValidado && <p role="status">Código validado correctamente.</p>}
    </div>
  );
}

export function codigoCorreoValido(datos: DatosRegistroBps): boolean {
  return datos.codigoCorreoValidado;
}
