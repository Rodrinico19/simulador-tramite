import "./Select.css";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string;
  id: string;
}

export function Select({ etiqueta, id, children, ...resto }: SelectProps) {
  return (
    <div className="select-campo">
      <label htmlFor={id} className="select-campo__etiqueta">
        {etiqueta}
      </label>
      <select id={id} className="select-campo__control" {...resto}>
        {children}
      </select>
    </div>
  );
}
