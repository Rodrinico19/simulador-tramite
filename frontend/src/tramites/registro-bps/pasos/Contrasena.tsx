import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";

const LARGO_MINIMO = 6;

export function Contrasena({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>Esta es una contraseña de práctica. No la vamos a guardar ni usar para nada real.</p>
      <TextField
        id="contrasena"
        etiqueta={`Contraseña de práctica (mínimo ${LARGO_MINIMO} caracteres)`}
        type="password"
        value={datos.contrasena}
        onChange={(e) => actualizarDatos({ contrasena: e.target.value })}
      />
    </div>
  );
}

export function contrasenaValida(datos: DatosRegistroBps): boolean {
  return datos.contrasena.trim().length >= LARGO_MINIMO;
}
