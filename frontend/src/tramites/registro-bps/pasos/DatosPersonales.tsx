import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";

export function DatosPersonales({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>Estos datos son ficticios, solo para practicar. Podés dejarlos como están o cambiarlos.</p>
      <TextField id="nombre" etiqueta="Nombre" value={datos.nombre} onChange={(e) => actualizarDatos({ nombre: e.target.value })} />
      <TextField
        id="apellido"
        etiqueta="Apellido"
        value={datos.apellido}
        onChange={(e) => actualizarDatos({ apellido: e.target.value })}
      />
    </div>
  );
}

export function datosPersonalesValidos(datos: DatosRegistroBps): boolean {
  return datos.nombre.trim().length > 0 && datos.apellido.trim().length > 0;
}
