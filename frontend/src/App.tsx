import { useState } from "react";
import { Home } from "./pages/Home";
import { RegistroBps } from "./tramites/registro-bps/RegistroBps";

export function App() {
  const [tramiteActivo, setTramiteActivo] = useState<string | null>(null);

  if (tramiteActivo === "registro-bps") {
    return <RegistroBps onSalir={() => setTramiteActivo(null)} />;
  }

  return <Home onSeleccionarTramite={setTramiteActivo} />;
}

export default App;
