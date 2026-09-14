import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";

export function Terminos({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>
        <em>Texto de ejemplo, no es el texto real de BPS:</em>
      </p>
      <p>
        Al aceptar, confirmás que los datos que ingresaste son correctos y que vas a usar tu Usuario Personal para
        trámites en línea de forma responsable.
      </p>
      <label className="checkbox-grande">
        <input
          type="checkbox"
          checked={datos.terminosAceptados}
          onChange={(e) => actualizarDatos({ terminosAceptados: e.target.checked })}
        />
        Acepto los términos y condiciones (simulados)
      </label>
    </div>
  );
}

export function terminosValidos(datos: DatosRegistroBps): boolean {
  return datos.terminosAceptados;
}
