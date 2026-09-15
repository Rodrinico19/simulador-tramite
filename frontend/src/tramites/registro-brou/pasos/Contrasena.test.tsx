import { describe, it, expect } from "vitest";
import { contrasenaValida } from "./Contrasena";
import { datosIniciales } from "../tipos";

function conContrasena(contrasena: string) {
  return { ...datosIniciales, contrasena };
}

describe("contrasenaValida", () => {
  it("rechaza contraseñas de menos de 10 caracteres", () => {
    expect(contrasenaValida(conContrasena("Ab1!ab1"))).toBe(false);
  });

  it("rechaza contraseñas de más de 30 caracteres", () => {
    expect(contrasenaValida(conContrasena("Ab1!" + "a".repeat(28)))).toBe(false);
  });

  it("rechaza contraseñas con menos de 3 de los 4 tipos de caracteres", () => {
    expect(contrasenaValida(conContrasena("abcdefghijkl"))).toBe(false);
    expect(contrasenaValida(conContrasena("abcdefghij12"))).toBe(false);
  });

  it("acepta contraseñas con al menos 3 de los 4 tipos y largo válido", () => {
    expect(contrasenaValida(conContrasena("Abcdefghij1"))).toBe(true);
    expect(contrasenaValida(conContrasena("abcdefghij1!"))).toBe(true);
  });

  it("rechaza contraseñas que contienen < o >", () => {
    expect(contrasenaValida(conContrasena("Abcdefghij1<"))).toBe(false);
    expect(contrasenaValida(conContrasena("Abcdefghij1>"))).toBe(false);
  });
});
