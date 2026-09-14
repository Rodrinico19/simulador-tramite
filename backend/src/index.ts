import { crearApp } from "./app";

const PUERTO = process.env.PUERTO ?? 3001;
const app = crearApp();

app.listen(PUERTO, () => {
  console.log(`Backend escuchando en el puerto ${PUERTO}`);
});
