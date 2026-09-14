import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("muestra el paso actual y el total en texto legible", () => {
    render(<ProgressBar pasoActual={3} totalPasos={9} />);
    expect(screen.getByText("Paso 3 de 9")).toBeInTheDocument();
  });
});
