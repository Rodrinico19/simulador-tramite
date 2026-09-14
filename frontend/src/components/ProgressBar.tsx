import "./ProgressBar.css";

interface ProgressBarProps {
  pasoActual: number;
  totalPasos: number;
}

export function ProgressBar({ pasoActual, totalPasos }: ProgressBarProps) {
  const porcentaje = (pasoActual / totalPasos) * 100;
  return (
    <div className="progress-bar">
      <p className="progress-bar__texto">
        Paso {pasoActual} de {totalPasos}
      </p>
      <div className="progress-bar__pista">
        <div className="progress-bar__relleno" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}
