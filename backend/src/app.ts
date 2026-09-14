import express, { type Express } from "express";
import cors from "cors";
import { crearRouterCodigo } from "./routes/codigo";
import { clienteResend, type ClienteCorreo } from "./resend";

export function crearApp(clienteCorreo: ClienteCorreo = clienteResend): Express {
  const app = express();
  app.use(cors({ origin: "http://localhost:5173" }));
  app.use(express.json());
  app.use("/api", crearRouterCodigo(clienteCorreo));
  return app;
}
