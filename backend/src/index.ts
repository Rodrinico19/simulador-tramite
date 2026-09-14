import "dotenv/config";
import { crearApp } from "./app";

if (!process.env.RESEND_API_KEY) {
  console.warn("Falta RESEND_API_KEY en backend/.env — el paso de código por correo no va a funcionar.");
}

const PUERTO = process.env.PUERTO ?? 3001;
const app = crearApp();

app.listen(PUERTO, () => {
  console.log(`Backend escuchando en el puerto ${PUERTO}`);
});
