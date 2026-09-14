import { Card } from "../../../components/Card";

export function Introduccion() {
  return (
    <Card>
      <p>
        Vas a practicar, paso a paso, qué pasa después de pedir tu Usuario Personal BPS. Todo lo que vas a hacer acá
        es una simulación: no se conecta con ningún sistema real de BPS.
      </p>
      <p>
        El pedido real del Usuario Personal BPS se hace <strong>en persona</strong> (Abitab, RedPagos, Correo
        Uruguayo, El Dorado o una oficina de BPS), llevando tu cédula vigente. Esta práctica empieza después de ese
        paso.
      </p>
    </Card>
  );
}

export function introduccionValida(): boolean {
  return true;
}
