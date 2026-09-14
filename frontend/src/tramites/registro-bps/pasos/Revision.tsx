import { useState } from "react";
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";

const APRENDIZAJES = [
  "El alta del Usuario Personal BPS se pide en persona, no online.",
  "Después de pedirlo, llega un correo con un enlace de activación.",
  "Ese enlace pide un código por SMS para confirmar tu celular.",
  "Tenés que aceptar términos y condiciones antes de seguir.",
  "Un segundo correo te deja crear tu contraseña definitiva.",
];

export function Revision({ datos }: PropsPaso<DatosRegistroBps>) {
  const [confirmado, setConfirmado] = useState(false);

  if (confirmado) {
    return (
      <Card>
        <h3>¡Listo! Practicaste todo el proceso.</h3>
        <p>¿Qué aprendiste?</p>
        <ul>
          {APRENDIZAJES.map((punto) => (
            <li key={punto}>{punto}</li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <Card>
      <p>Revisá los datos antes de confirmar:</p>
      <dl className="revision-lista">
        <dt>Nombre</dt>
        <dd>
          {datos.nombre} {datos.apellido}
        </dd>
        <dt>Cédula</dt>
        <dd>{datos.cedula}</dd>
        <dt>Celular</dt>
        <dd>{datos.celular}</dd>
        <dt>Correo</dt>
        <dd>{datos.correo}</dd>
      </dl>
      <Button onClick={() => setConfirmado(true)}>Confirmar</Button>
    </Card>
  );
}

export function revisionValida(): boolean {
  return true;
}
