import { Card } from "../components/Card";
import { Button } from "../components/Button";

interface Tramite {
  id: string;
  logoSrc: string;
  logoAlt: string;
  titulo: string;
  descripcion: string;
}

const tramites: Tramite[] = [
  {
    id: "registro-bps",
    logoSrc: "/bps-logo.svg",
    logoAlt: "Logo de BPS (Banco de Previsión Social)",
    titulo: "Usuario Personal BPS: qué pasa después de pedirlo",
    descripcion: "Practicá el proceso digital posterior a solicitar tu Usuario Personal BPS.",
  },
  {
    id: "registro-brou",
    logoSrc: "/brou-logo.svg",
    logoAlt: "Logo de BROU (Banco República)",
    titulo: "Usuario eBROU: registrate paso a paso",
    descripcion: "Practicá cómo se registra un Usuario eBROU con tu código de invitación.",
  },
];

interface HomeProps {
  onSeleccionarTramite: (id: string) => void;
}

export function Home({ onSeleccionarTramite }: HomeProps) {
  return (
    <div className="home">
      <h1>Simuladores de Trámites</h1>
      <p>Practicá trámites paso a paso, sin riesgo, antes de hacerlos de verdad.</p>
      <div className="tramites-lista">
        {tramites.map((tramite) => (
          <Card key={tramite.id}>
            <div className="tramite-item">
              <img className="tramite-item__logo" src={tramite.logoSrc} alt={tramite.logoAlt} />
              <div className="tramite-item__contenido">
                <h2>{tramite.titulo}</h2>
                <p>{tramite.descripcion}</p>
                <Button onClick={() => onSeleccionarTramite(tramite.id)}>Empezar</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
