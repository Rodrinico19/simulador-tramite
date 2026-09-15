import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBrou } from "../tipos";
import { TextField } from "../../../components/TextField";

const LARGO_MINIMO = 10;
const LARGO_MAXIMO = 30;
const TIPOS_MINIMOS = 3;

function contarTipos(contrasena: string): number {
  const tipos = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/];
  return tipos.filter((tipo) => tipo.test(contrasena)).length;
}

export function Contrasena({ datos, actualizarDatos }: PropsPaso<DatosRegistroBrou>) {
  return (
    <div>
      <p>Esta es una contraseña de práctica. No la vamos a guardar ni usar para nada real.</p>
      <p>
        La contraseña real de eBROU debe tener entre {LARGO_MINIMO} y {LARGO_MAXIMO} caracteres, incluir al menos{" "}
        {TIPOS_MINIMOS} de estos 4 tipos: mayúscula, minúscula, número o símbolo, y no puede contener los caracteres{" "}
        <code>&lt;</code> ni <code>&gt;</code>.
      </p>
      <TextField
        id="contrasena"
        etiqueta="Contraseña de práctica"
        type="password"
        value={datos.contrasena}
        onChange={(e) => actualizarDatos({ contrasena: e.target.value })}
      />
    </div>
  );
}

export function contrasenaValida(datos: DatosRegistroBrou): boolean {
  const contrasena = datos.contrasena;
  if (contrasena.length < LARGO_MINIMO || contrasena.length > LARGO_MAXIMO) return false;
  if (contrasena.includes("<") || contrasena.includes(">")) return false;
  return contarTipos(contrasena) >= TIPOS_MINIMOS;
}
