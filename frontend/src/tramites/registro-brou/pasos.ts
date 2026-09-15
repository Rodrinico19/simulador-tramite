import type { DefinicionPaso } from "../../engine/tipos";
import type { DatosRegistroBrou } from "./tipos";
import { Introduccion, introduccionValida } from "./pasos/Introduccion";
import { Identificacion, identificacionValida } from "./pasos/Identificacion";
import { Contrasena, contrasenaValida } from "./pasos/Contrasena";
import { Revision, revisionValida } from "./pasos/Revision";

export const pasosRegistroBrou: DefinicionPaso<DatosRegistroBrou>[] = [
  { id: "introduccion", titulo: "Antes de empezar", Componente: Introduccion, esValido: introduccionValida },
  {
    id: "identificacion",
    titulo: "Regístrese con su código de invitación",
    Componente: Identificacion,
    esValido: identificacionValida,
  },
  { id: "contrasena", titulo: "Crear contraseña", Componente: Contrasena, esValido: contrasenaValida },
  { id: "revision", titulo: "Revisión y confirmación", Componente: Revision, esValido: revisionValida },
];
