import "./TextField.css";
import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  id: string;
  error?: string;
}

export function TextField({ etiqueta, id, error, ...resto }: TextFieldProps) {
  return (
    <div className="text-field">
      <label htmlFor={id} className="text-field__etiqueta">
        {etiqueta}
      </label>
      <input id={id} className="text-field__input" {...resto} />
      {error && (
        <p role="alert" className="text-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
