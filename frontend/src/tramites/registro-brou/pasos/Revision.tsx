import { useState } from "react";
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBrou } from "../tipos";
import { Button } from "../../../components/Button";

const APRENDIZAJES = [
  "El alta de eBROU se inicia en persona: un cajero RedBROU, una TAS o una sucursal del banco.",
  "Ahí se genera un código de invitación, válido por 5 días.",
  "Con tu número de documento y ese código entrás a eBROU y te registrás.",
  "La contraseña definitiva debe tener entre 10 y 30 caracteres y al menos 3 de 4 tipos de caracteres.",
];

export function Revision({ datos }: PropsPaso<DatosRegistroBrou>) {
  const [confirmado, setConfirmado] = useState(false);

  if (confirmado) {
    return (
      <div>
        <h3>¡Listo! Practicaste todo el proceso.</h3>
        <p>¿Qué aprendiste?</p>
        <ul>
          {APRENDIZAJES.map((punto) => (
            <li key={punto}>{punto}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <p>Revisá los datos antes de confirmar:</p>
      <dl className="revision-lista">
        <dt>Número de documento</dt>
        <dd>{datos.numeroDocumento}</dd>
      </dl>
      <Button onClick={() => setConfirmado(true)}>Confirmar</Button>
    </div>
  );
}

export function revisionValida(): boolean {
  return true;
}
