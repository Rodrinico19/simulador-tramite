import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";

const FORMATO_CEDULA = /^\d\.\d{3}\.\d{3}-\d$/;

export function Cedula({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>
        En el trámite real te van a pedir tu cédula vigente en persona. Acá anotá una cédula ficticia, con el
        formato de ejemplo, solo para practicar.
      </p>
      <TextField
        id="cedula"
        etiqueta="Cédula (formato X.XXX.XXX-X)"
        placeholder="1.234.567-8"
        value={datos.cedula}
        onChange={(e) => actualizarDatos({ cedula: e.target.value })}
      />
    </div>
  );
}

export function cedulaValida(datos: DatosRegistroBps): boolean {
  return FORMATO_CEDULA.test(datos.cedula.trim());
}
