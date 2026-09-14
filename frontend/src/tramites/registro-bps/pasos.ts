import type { DefinicionPaso } from "../../engine/tipos";
import type { DatosRegistroBps } from "./tipos";
import { Introduccion, introduccionValida } from "./pasos/Introduccion";
import { DatosPersonales, datosPersonalesValidos } from "./pasos/DatosPersonales";
import { Cedula, cedulaValida } from "./pasos/Cedula";
import { Contacto, contactoValido } from "./pasos/Contacto";
import { CodigoCorreo, codigoCorreoValido } from "./pasos/CodigoCorreo";
import { CodigoSms, codigoSmsValido } from "./pasos/CodigoSms";
import { Terminos, terminosValidos } from "./pasos/Terminos";
import { Contrasena, contrasenaValida } from "./pasos/Contrasena";
import { Revision, revisionValida } from "./pasos/Revision";

export const pasosRegistroBps: DefinicionPaso<DatosRegistroBps>[] = [
  { id: "introduccion", titulo: "Antes de empezar", Componente: Introduccion, esValido: introduccionValida },
  { id: "datos-personales", titulo: "Datos personales", Componente: DatosPersonales, esValido: datosPersonalesValidos },
  { id: "cedula", titulo: "Cédula", Componente: Cedula, esValido: cedulaValida },
  { id: "contacto", titulo: "Datos de contacto", Componente: Contacto, esValido: contactoValido },
  { id: "codigo-correo", titulo: "Código por correo", Componente: CodigoCorreo, esValido: codigoCorreoValido },
  { id: "codigo-sms", titulo: "Código por SMS (simulado)", Componente: CodigoSms, esValido: codigoSmsValido },
  { id: "terminos", titulo: "Términos y condiciones", Componente: Terminos, esValido: terminosValidos },
  { id: "contrasena", titulo: "Crear contraseña", Componente: Contrasena, esValido: contrasenaValida },
  { id: "revision", titulo: "Revisión y confirmación", Componente: Revision, esValido: revisionValida },
];
