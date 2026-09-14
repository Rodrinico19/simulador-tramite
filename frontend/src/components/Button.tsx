import "./Button.css";
import type { ButtonHTMLAttributes } from "react";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario";
}

export function Button({ variante = "primario", className, ...resto }: BotonProps) {
  return <button className={`boton boton--${variante} ${className ?? ""}`.trim()} {...resto} />;
}
