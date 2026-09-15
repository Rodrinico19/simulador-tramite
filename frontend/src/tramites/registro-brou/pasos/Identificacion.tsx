import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBrou } from "../tipos";
import { TextField } from "../../../components/TextField";
import { Select } from "../../../components/Select";

const FORMATO_DOCUMENTO = /^\d{6,8}$/;
const CODIGO_INVITACION_SIMULADO = "1234-5678";
const soloDigitos = (valor: string) => valor.replace(/\D/g, "");
const CODIGO_INVITACION_DIGITOS = soloDigitos(CODIGO_INVITACION_SIMULADO);

const PAISES = [
  "Uruguay",
  "Argentina",
  "Brasil",
  "Chile",
  "Paraguay",
  "Bolivia",
  "Perú",
  "Colombia",
  "España",
  "Estados Unidos",
  "Otro",
];

const TIPOS_DOCUMENTO = ["C.I.", "Pasaporte", "Otro documento"];

export function Identificacion({ datos, actualizarDatos }: PropsPaso<DatosRegistroBrou>) {
  const numeroDocumentoError =
    datos.numeroDocumento.trim().length > 0 && !FORMATO_DOCUMENTO.test(datos.numeroDocumento.trim())
      ? "Ingresá solo números, entre 6 y 8 dígitos."
      : undefined;

  const codigoInvitacionError =
    datos.codigoInvitacion.trim().length > 0 && soloDigitos(datos.codigoInvitacion) !== CODIGO_INVITACION_DIGITOS
      ? `Ese código no coincide con el de práctica (${CODIGO_INVITACION_SIMULADO}).`
      : undefined;

  return (
    <div>
      <p>
        Si usted tiene un código de invitación, ingréselo a continuación para continuar con el proceso de registro.
      </p>
      <Select id="pais" etiqueta="País" defaultValue="Uruguay">
        {PAISES.map((pais) => (
          <option key={pais}>{pais}</option>
        ))}
      </Select>
      <Select id="tipo-documento" etiqueta="Tipo de documento" defaultValue="C.I.">
        {TIPOS_DOCUMENTO.map((tipo) => (
          <option key={tipo}>{tipo}</option>
        ))}
      </Select>
      <TextField
        id="numero-documento"
        etiqueta="Número de documento"
        placeholder="Cédula ficticia, solo para practicar"
        value={datos.numeroDocumento}
        onChange={(e) => actualizarDatos({ numeroDocumento: e.target.value })}
        error={numeroDocumentoError}
      />
      <p>
        En el trámite real, este código lo entrega un cajero RedBROU, una TAS o una sucursal (válido 5 días). Para
        practicar, el código siempre es este:
      </p>
      <p className="codigo-simulado">{CODIGO_INVITACION_SIMULADO}</p>
      <TextField
        id="codigo-invitacion"
        etiqueta="Código de invitación"
        placeholder="XXXX-XXXX"
        value={datos.codigoInvitacion}
        onChange={(e) => actualizarDatos({ codigoInvitacion: e.target.value })}
        error={codigoInvitacionError}
      />
    </div>
  );
}

export function identificacionValida(datos: DatosRegistroBrou): boolean {
  return (
    FORMATO_DOCUMENTO.test(datos.numeroDocumento.trim()) &&
    soloDigitos(datos.codigoInvitacion) === CODIGO_INVITACION_DIGITOS
  );
}
