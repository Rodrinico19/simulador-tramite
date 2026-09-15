export function Introduccion() {
  return (
    <div>
      <p>
        Vas a practicar, paso a paso, cómo se registra un Usuario eBROU. Todo lo que vas a hacer acá es una
        simulación: no se conecta con ningún sistema real del BROU.
      </p>
      <p>
        El trámite real empieza <strong>en persona</strong>: en un cajero RedBROU, una Terminal de Autoservicio (TAS)
        o una sucursal, con tu tarjeta de débito y PIN (o tu cédula en sucursal). Ahí se genera un{" "}
        <strong>código de invitación</strong>, válido por 5 días. Esta práctica empieza después de ese paso, en la
        parte que se hace en el sitio web.
      </p>
    </div>
  );
}

export function introduccionValida(): boolean {
  return true;
}
