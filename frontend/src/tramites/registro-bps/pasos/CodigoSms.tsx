import { useState } from "react";
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";
import { Button } from "../../../components/Button";

const CODIGO_SIMULADO = "123456";

export function CodigoSms({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleValidar = () => {
    if (codigoIngresado.trim() === CODIGO_SIMULADO) {
      actualizarDatos({ codigoSmsValidado: true });
      setMensaje("¡Código correcto!");
    } else {
      setMensaje("Ese código no es correcto. Probá otra vez.");
    }
  };

  return (
    <div>
      <p>En el trámite real te llega un SMS con un código. Acá, para practicar sin gastos, el código siempre es este:</p>
      <p className="codigo-simulado">{CODIGO_SIMULADO}</p>
      <TextField
        id="codigo-sms"
        etiqueta="Ingresá el código"
        value={codigoIngresado}
        onChange={(e) => setCodigoIngresado(e.target.value)}
      />
      <Button onClick={handleValidar} disabled={datos.codigoSmsValidado}>
        Validar
      </Button>
      {mensaje && <p role="status">{mensaje}</p>}
    </div>
  );
}

export function codigoSmsValido(datos: DatosRegistroBps): boolean {
  return datos.codigoSmsValidado;
}
