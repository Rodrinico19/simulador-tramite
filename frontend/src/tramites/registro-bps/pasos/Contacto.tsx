import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contacto({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>El celular es ficticio, como los datos anteriores.</p>
      <TextField
        id="celular"
        etiqueta="Celular"
        placeholder="099 123 456"
        value={datos.celular}
        onChange={(e) => actualizarDatos({ celular: e.target.value })}
      />
      <p>
        <strong>Este correo sí es real.</strong> En el próximo paso te vamos a mandar un código real para que
        practiques cómo se valida. No lo vamos a guardar.
      </p>
      <TextField
        id="correo"
        etiqueta="Tu correo real"
        type="email"
        placeholder="tu-correo@ejemplo.com"
        value={datos.correo}
        onChange={(e) => actualizarDatos({ correo: e.target.value })}
      />
    </div>
  );
}

export function contactoValido(datos: DatosRegistroBps): boolean {
  return datos.celular.trim().length > 0 && FORMATO_CORREO.test(datos.correo.trim());
}
