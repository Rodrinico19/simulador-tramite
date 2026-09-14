import { Card } from "../components/Card";
import { Button } from "../components/Button";

interface HomeProps {
  onSeleccionarTramite: (id: string) => void;
}

export function Home({ onSeleccionarTramite }: HomeProps) {
  return (
    <div className="home">
      <h1>Trámites Fácil</h1>
      <p>Practicá trámites paso a paso, sin riesgo, antes de hacerlos de verdad.</p>
      <Card>
        <h2>Usuario Personal BPS: qué pasa después de pedirlo</h2>
        <p>Practicá el proceso digital posterior a solicitar tu Usuario Personal BPS.</p>
        <Button onClick={() => onSeleccionarTramite("registro-bps")}>Empezar</Button>
      </Card>
    </div>
  );
}
