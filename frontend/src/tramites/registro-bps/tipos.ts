export interface DatosRegistroBps {
  nombre: string;
  apellido: string;
  cedula: string;
  celular: string;
  correo: string;
  codigoCorreoEnviado: boolean;
  codigoCorreoValidado: boolean;
  codigoSmsValidado: boolean;
  terminosAceptados: boolean;
  contrasena: string;
}

export const datosIniciales: DatosRegistroBps = {
  nombre: "Ana",
  apellido: "Pérez",
  cedula: "",
  celular: "",
  correo: "",
  codigoCorreoEnviado: false,
  codigoCorreoValidado: false,
  codigoSmsValidado: false,
  terminosAceptados: false,
  contrasena: "",
};
