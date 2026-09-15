import { useState } from "react";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { RegistroBps } from "./tramites/registro-bps/RegistroBps";
import { RegistroBrou } from "./tramites/registro-brou/RegistroBrou";

export function App() {
  const [tramiteActivo, setTramiteActivo] = useState<string | null>(null);
  const onSalir = () => setTramiteActivo(null);

  if (tramiteActivo === "registro-brou") {
    return <RegistroBrou onSalir={onSalir} />;
  }

  return (
    <>
      <Header />
      {tramiteActivo === "registro-bps" ? <RegistroBps onSalir={onSalir} /> : <Home onSeleccionarTramite={setTramiteActivo} />}
    </>
  );
}

export default App;
