# Trámites Fácil — Simulación de Registro BPS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Trámites Fácil" project with its first trámite — a 9-step educational simulation of what happens after requesting the BPS Usuario Personal, with one real step (email verification code via Resend) and everything else simulated.

**Architecture:** A single repo with npm workspaces: `frontend/` (React + Vite + TypeScript, a generic step-flow engine plus a `registro-bps` trámite built on it) and `backend/` (Node + Express + TypeScript, two endpoints backed by an in-memory code store and the Resend SDK). Root `npm run dev` runs both concurrently. No persistence layer anywhere.

**Tech Stack:** React 18, Vite, TypeScript, Vitest, @testing-library/react, Express, Resend SDK, supertest, concurrently.

**Spec:** `docs/superpowers/specs/2026-09-14-tramites-facil-bps-registro-design.md`

## Global Constraints

- No real BPS system is ever contacted; no persistent storage of any personal data (nothing written to disk or a database).
- Only the user's real email address is sent over the network (to Resend, to deliver a verification code). Every other field (nombre, cédula, celular, contraseña) stays in the browser and is never sent to the backend.
- The backend never returns the generated code to the client; it only confirms `valido: true/false`.
- Verification code: 6 digits, expires after 10 minutes, max 3 send attempts per email, cleared from memory on successful validation or expiry.
- Tests never call the real Resend API — the email client is always injected/mocked in tests.
- Frontend: React + Vite + TypeScript. Backend: Node + Express + TypeScript. Root `npm run dev` (via `concurrently`) starts both. Everything runs locally; no deployment.
- UX rules for every trámite screen: one primary action per screen, "Paso X de Y" always visible, buttons at least 56px tall, base font size 18–20px, high contrast, no jargon, a validation error never clears already-entered data, back/forward navigation always available, a persistent but non-intrusive simulation banner.
- `npm run build` must pass with no errors in both `frontend/` and `backend/`.

---

## File Structure

```
tramites-facil/
  package.json                          root workspace + concurrently scripts
  README.md
  backend/
    package.json
    tsconfig.json
    .env.example
    src/
      codigosEnMemoria.ts                in-memory code store
      codigosEnMemoria.test.ts
      resend.ts                          ClienteCorreo interface + real Resend client
      routes/
        codigo.ts                        router factory (injectable ClienteCorreo)
        codigo.test.ts
      app.ts                             Express app factory (injectable ClienteCorreo)
      index.ts                           server entry point
  frontend/
    package.json
    tsconfig.json / vite.config.ts
    src/
      engine/
        tipos.ts                         DefinicionPaso<T>, PropsPaso<T>
        ContextoFlujo.tsx                 ProveedorFlujo, useFlujo
        StepFlow.tsx                      renders current step + nav + progress + banner
        StepFlow.test.tsx
      components/
        Button.tsx / Button.css
        TextField.tsx / TextField.css
        ProgressBar.tsx / ProgressBar.css
        Banner.tsx / Banner.css
        Card.tsx / Card.css
      tramites/
        registro-bps/
          tipos.ts                       DatosRegistroBps, datosIniciales
          api.ts                         enviarCodigo, validarCodigo (fetch wrappers)
          pasos.ts                       assembles the 9-step DefinicionPaso[] array
          RegistroBps.tsx                wires ProveedorFlujo + StepFlow for this trámite
          pasos/
            Introduccion.tsx
            DatosPersonales.tsx
            Cedula.tsx
            Contacto.tsx
            CodigoCorreo.tsx
            CodigoSms.tsx
            Terminos.tsx
            Contrasena.tsx
            Revision.tsx
            Revision.test.tsx
      pages/
        Home.tsx
      App.tsx
      main.tsx (Vite default, untouched)
      setupTests.ts
  docs/
    tramites/
      bps-registro-usuario.md            short reference sheet
```

---

### Task 1: Root workspace scaffold

**Files:**
- Create: `package.json` (root)
- Create: `.gitignore`

**Interfaces:**
- Produces: npm workspaces `frontend` and `backend`; root scripts `dev`, `build`, `test` that later tasks rely on.

- [ ] **Step 1: Verify npm is available**

Run: `npm --version`
Expected: a version number (any recent npm 9/10 works)

- [ ] **Step 2: Create the root `package.json`**

```json
{
  "name": "tramites-facil",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently -n backend,frontend -c blue,green \"npm run dev -w backend\" \"npm run dev -w frontend\"",
    "build": "npm run build -w backend && npm run build -w frontend",
    "test": "npm run test -w backend && npm run test -w frontend"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
dist/
.env
```

- [ ] **Step 4: Install root devDependencies**

Run: `npm install`
Expected: installs `concurrently`; creates `node_modules/` and `package-lock.json`. It's fine that `frontend`/`backend` don't exist as folders yet — npm workspaces tolerates missing workspace folders until they're created in later tasks.

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore package-lock.json
git commit -m "chore: scaffold tramites-facil root workspace"
```

---

### Task 2: Backend scaffold + in-memory code store

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/src/codigosEnMemoria.ts`
- Test: `backend/src/codigosEnMemoria.test.ts`

**Interfaces:**
- Produces: `generarCodigo(): string`, `guardarCodigo(correo: string, codigo: string): void`, `obtenerIntentosEnvio(correo: string): number`, `obtenerEntrada(correo: string): { codigo: string; expira: number; intentosEnvio: number } | undefined`, `borrarCodigo(correo: string): void`, `limpiarTodo(): void` — all consumed by Task 3's router.

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "backend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "lint": "eslint src"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "resend": "^4.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.0",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.0.0",
    "@types/supertest": "^6.0.2",
    "eslint": "^9.9.0",
    "supertest": "^7.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "typescript-eslint": "^8.5.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `backend/.env.example`**

```
RESEND_API_KEY=
EMAIL_REMITENTE=onboarding@resend.dev
```

- [ ] **Step 4: Create `backend/eslint.config.js`**

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  ignores: ["dist/**"],
});
```

- [ ] **Step 5: Install backend dependencies**

Run: `npm install` (from repo root)
Expected: installs Express/Resend/Vitest/etc. into the shared workspace `node_modules/`; `backend/package.json` now resolves via `npm run <script> -w backend`.

- [ ] **Step 6: Write the failing test for the in-memory store**

`backend/src/codigosEnMemoria.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generarCodigo,
  guardarCodigo,
  obtenerIntentosEnvio,
  obtenerEntrada,
  borrarCodigo,
  limpiarTodo,
} from "./codigosEnMemoria";

describe("codigosEnMemoria", () => {
  beforeEach(() => {
    limpiarTodo();
    vi.useRealTimers();
  });

  it("genera códigos de 6 dígitos", () => {
    const codigo = generarCodigo();
    expect(codigo).toMatch(/^\d{6}$/);
  });

  it("guarda un código y lo puede recuperar", () => {
    guardarCodigo("a@b.com", "123456");
    expect(obtenerEntrada("a@b.com")?.codigo).toBe("123456");
  });

  it("cuenta los intentos de envío", () => {
    guardarCodigo("a@b.com", "111111");
    guardarCodigo("a@b.com", "222222");
    expect(obtenerIntentosEnvio("a@b.com")).toBe(2);
  });

  it("expira el código después de 10 minutos", () => {
    vi.useFakeTimers();
    guardarCodigo("a@b.com", "123456");
    vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    expect(obtenerEntrada("a@b.com")).toBeUndefined();
    vi.useRealTimers();
  });

  it("borra el código", () => {
    guardarCodigo("a@b.com", "123456");
    borrarCodigo("a@b.com");
    expect(obtenerEntrada("a@b.com")).toBeUndefined();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm run test -w backend`
Expected: FAIL — `./codigosEnMemoria` has no exported members (module doesn't exist yet)

- [ ] **Step 8: Implement `backend/src/codigosEnMemoria.ts`**

```ts
export interface EntradaCodigo {
  codigo: string;
  expira: number;
  intentosEnvio: number;
}

const DURACION_MS = 10 * 60 * 1000;

const codigos = new Map<string, EntradaCodigo>();

export function generarCodigo(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function guardarCodigo(correo: string, codigo: string): void {
  const existente = codigos.get(correo);
  codigos.set(correo, {
    codigo,
    expira: Date.now() + DURACION_MS,
    intentosEnvio: (existente?.intentosEnvio ?? 0) + 1,
  });
}

export function obtenerIntentosEnvio(correo: string): number {
  return codigos.get(correo)?.intentosEnvio ?? 0;
}

export function obtenerEntrada(correo: string): EntradaCodigo | undefined {
  const entrada = codigos.get(correo);
  if (!entrada) return undefined;
  if (Date.now() > entrada.expira) {
    codigos.delete(correo);
    return undefined;
  }
  return entrada;
}

export function borrarCodigo(correo: string): void {
  codigos.delete(correo);
}

export function limpiarTodo(): void {
  codigos.clear();
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm run test -w backend`
Expected: PASS (5 tests)

- [ ] **Step 10: Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/.env.example backend/eslint.config.js backend/src/codigosEnMemoria.ts backend/src/codigosEnMemoria.test.ts package-lock.json
git commit -m "feat(backend): scaffold backend and add in-memory code store"
```

---

### Task 3: Resend client + code endpoints

**Files:**
- Create: `backend/src/resend.ts`
- Create: `backend/src/routes/codigo.ts`
- Create: `backend/src/app.ts`
- Test: `backend/src/routes/codigo.test.ts`

**Interfaces:**
- Consumes: `generarCodigo`, `guardarCodigo`, `obtenerIntentosEnvio`, `obtenerEntrada`, `borrarCodigo`, `limpiarTodo` from `../codigosEnMemoria` (Task 2).
- Produces: `ClienteCorreo` interface + `clienteResend` instance (from `resend.ts`); `crearRouterCodigo(clienteCorreo: ClienteCorreo): Router`; `crearApp(clienteCorreo?: ClienteCorreo): Express` — `crearApp` is consumed by Task 4's `index.ts` and by this task's own tests.

- [ ] **Step 1: Create `backend/src/resend.ts`**

```ts
import { Resend } from "resend";

export interface ClienteCorreo {
  enviarCodigo(correo: string, codigo: string): Promise<void>;
}

const apiKey = process.env.RESEND_API_KEY ?? "";
const remitente = process.env.EMAIL_REMITENTE ?? "onboarding@resend.dev";
const resend = new Resend(apiKey);

export const clienteResend: ClienteCorreo = {
  async enviarCodigo(correo, codigo) {
    const respuesta = await resend.emails.send({
      from: remitente,
      to: correo,
      subject: "Tu código de verificación — Trámites Fácil (simulación)",
      html: `<p>Tu código de verificación es: <strong>${codigo}</strong></p><p>Vence en 10 minutos. Esto es parte de una simulación educativa de Trámites Fácil, no es un trámite real de BPS.</p>`,
    });
    if (respuesta.error) {
      throw new Error(respuesta.error.message);
    }
  },
};
```

- [ ] **Step 2: Write the failing tests for the endpoints**

`backend/src/routes/codigo.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { crearApp } from "../app";
import { limpiarTodo } from "../codigosEnMemoria";
import type { ClienteCorreo } from "../resend";

describe("POST /api/enviar-codigo", () => {
  beforeEach(() => {
    limpiarTodo();
  });

  it("responde ok:false con motivo correo_invalido si el correo no tiene formato válido", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn() };
    const app = crearApp(clienteFalso);

    const respuesta = await request(app).post("/api/enviar-codigo").send({ correo: "no-es-correo" });

    expect(respuesta.body).toEqual({ ok: false, motivo: "correo_invalido" });
    expect(clienteFalso.enviarCodigo).not.toHaveBeenCalled();
  });

  it("envía el código y responde ok:true cuando el correo es válido", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockResolvedValue(undefined) };
    const app = crearApp(clienteFalso);

    const respuesta = await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });

    expect(respuesta.body).toEqual({ ok: true });
    expect(clienteFalso.enviarCodigo).toHaveBeenCalledWith("ana@ejemplo.com", expect.stringMatching(/^\d{6}$/));
  });

  it("responde error_envio si el cliente de correo falla", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockRejectedValue(new Error("falló")) };
    const app = crearApp(clienteFalso);

    const respuesta = await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });

    expect(respuesta.body).toEqual({ ok: false, motivo: "error_envio" });
  });

  it("responde limite_alcanzado después de 3 envíos exitosos", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockResolvedValue(undefined) };
    const app = crearApp(clienteFalso);

    for (let i = 0; i < 3; i++) {
      await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });
    }
    const respuesta = await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });

    expect(respuesta.body).toEqual({ ok: false, motivo: "limite_alcanzado" });
  });
});

describe("POST /api/validar-codigo", () => {
  beforeEach(() => {
    limpiarTodo();
  });

  it("responde valido:true con el código correcto y lo borra tras usarlo", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockResolvedValue(undefined) };
    const app = crearApp(clienteFalso);

    await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });
    const codigoEnviado = (clienteFalso.enviarCodigo as ReturnType<typeof vi.fn>).mock.calls[0][1];

    const primeraValidacion = await request(app)
      .post("/api/validar-codigo")
      .send({ correo: "ana@ejemplo.com", codigo: codigoEnviado });
    expect(primeraValidacion.body).toEqual({ valido: true });

    const segundaValidacion = await request(app)
      .post("/api/validar-codigo")
      .send({ correo: "ana@ejemplo.com", codigo: codigoEnviado });
    expect(segundaValidacion.body).toEqual({ valido: false });
  });

  it("responde valido:false con un código incorrecto", async () => {
    const clienteFalso: ClienteCorreo = { enviarCodigo: vi.fn().mockResolvedValue(undefined) };
    const app = crearApp(clienteFalso);

    await request(app).post("/api/enviar-codigo").send({ correo: "ana@ejemplo.com" });
    const respuesta = await request(app)
      .post("/api/validar-codigo")
      .send({ correo: "ana@ejemplo.com", codigo: "000000" });

    expect(respuesta.body).toEqual({ valido: false });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm run test -w backend`
Expected: FAIL — `../app` does not exist yet

- [ ] **Step 4: Implement `backend/src/routes/codigo.ts`**

```ts
import { Router } from "express";
import { generarCodigo, guardarCodigo, obtenerIntentosEnvio, obtenerEntrada, borrarCodigo } from "../codigosEnMemoria";
import type { ClienteCorreo } from "../resend";

const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITE_REENVIOS = 3;

export function crearRouterCodigo(clienteCorreo: ClienteCorreo): Router {
  const router = Router();

  router.post("/enviar-codigo", async (req, res) => {
    const correo = typeof req.body?.correo === "string" ? req.body.correo.trim() : "";

    if (!CORREO_REGEX.test(correo)) {
      return res.json({ ok: false, motivo: "correo_invalido" });
    }

    if (obtenerIntentosEnvio(correo) >= LIMITE_REENVIOS) {
      return res.json({ ok: false, motivo: "limite_alcanzado" });
    }

    const codigo = generarCodigo();

    try {
      await clienteCorreo.enviarCodigo(correo, codigo);
    } catch {
      return res.json({ ok: false, motivo: "error_envio" });
    }

    guardarCodigo(correo, codigo);
    return res.json({ ok: true });
  });

  router.post("/validar-codigo", (req, res) => {
    const correo = typeof req.body?.correo === "string" ? req.body.correo.trim() : "";
    const codigo = typeof req.body?.codigo === "string" ? req.body.codigo.trim() : "";

    const entrada = obtenerEntrada(correo);
    const valido = entrada !== undefined && entrada.codigo === codigo;

    if (valido) {
      borrarCodigo(correo);
    }

    return res.json({ valido });
  });

  return router;
}
```

- [ ] **Step 5: Implement `backend/src/app.ts`**

```ts
import express, { type Express } from "express";
import cors from "cors";
import { crearRouterCodigo } from "./routes/codigo";
import { clienteResend, type ClienteCorreo } from "./resend";

export function crearApp(clienteCorreo: ClienteCorreo = clienteResend): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", crearRouterCodigo(clienteCorreo));
  return app;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test -w backend`
Expected: PASS (all tests in `codigosEnMemoria.test.ts` and `routes/codigo.test.ts`)

- [ ] **Step 7: Commit**

```bash
git add backend/src/resend.ts backend/src/routes/codigo.ts backend/src/app.ts backend/src/routes/codigo.test.ts
git commit -m "feat(backend): add resend client and enviar-codigo/validar-codigo endpoints"
```

---

### Task 4: Backend server entry point + build verification

**Files:**
- Create: `backend/src/index.ts`

**Interfaces:**
- Consumes: `crearApp` from `./app` (Task 3).

- [ ] **Step 1: Implement `backend/src/index.ts`**

```ts
import { crearApp } from "./app";

const PUERTO = process.env.PUERTO ?? 3001;
const app = crearApp();

app.listen(PUERTO, () => {
  console.log(`Backend escuchando en el puerto ${PUERTO}`);
});
```

- [ ] **Step 2: Verify the backend builds**

Run: `npm run build -w backend`
Expected: exits 0, produces `backend/dist/`

- [ ] **Step 3: Verify the dev server starts**

Run (with a short timeout, then stop it): `npm run dev -w backend`
Expected: logs `Backend escuchando en el puerto 3001` and does not crash

- [ ] **Step 4: Verify lint passes**

Run: `npm run lint -w backend`
Expected: exits 0, no errors

- [ ] **Step 5: Commit**

```bash
git add backend/src/index.ts
git commit -m "feat(backend): add server entry point"
```

---

### Task 5: Frontend scaffold (Vite + React + TypeScript + Vitest)

**Files:**
- Create: `frontend/` (via Vite scaffold command)
- Modify: `frontend/package.json` (add test deps/scripts)
- Modify: `frontend/vite.config.ts` (add Vitest config)
- Create: `frontend/src/setupTests.ts`

**Interfaces:**
- Produces: a working `frontend/` React+TS app with `npm run dev -w frontend`, `npm run build -w frontend`, `npm run test -w frontend` all working — consumed by every later frontend task.

- [ ] **Step 1: Scaffold the Vite project**

Run: `npm create vite@latest frontend -- --template react-ts`
Expected: creates `frontend/` with the standard Vite React+TS template files (`src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `tsconfig.json`, `.eslintrc`/`eslint.config.js`, etc.)

- [ ] **Step 2: Add test dependencies to `frontend/package.json`**

Add to `devDependencies` (keep existing Vite-generated deps as-is):

```json
"@testing-library/jest-dom": "^6.5.0",
"@testing-library/react": "^16.0.1",
"jsdom": "^25.0.1",
"vitest": "^2.1.0"
```

Add to `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Add Vitest config to `frontend/vite.config.ts`**

Replace the file so it merges Vite and Vitest config:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    globals: true,
  },
});
```

- [ ] **Step 4: Create `frontend/src/setupTests.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Install dependencies**

Run: `npm install` (from repo root)
Expected: installs Vite/React/Vitest/Testing Library into the shared workspace `node_modules/`

- [ ] **Step 6: Verify the frontend builds and a placeholder test passes**

Run: `npm run build -w frontend`
Expected: exits 0

Run: `npm run test -w frontend`
Expected: PASS (Vitest reports 0 or more tests found, no config errors) — if Vitest complains there are no test files, that's fine at this point; it must not error on config.

- [ ] **Step 7: Verify lint passes**

Run: `npm run lint -w frontend`
Expected: exits 0, no errors (the Vite react-ts template ships a working `lint` script and `eslint.config.js` already)

- [ ] **Step 8: Set global base font size for the UX contrast/size rules**

Replace the contents of `frontend/src/index.css` with:

```css
:root {
  color-scheme: light;
}

body {
  margin: 0;
  font-size: 18px;
  line-height: 1.5;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #1a1a1a;
  background-color: #ffffff;
}

#root {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px;
}
```

- [ ] **Step 9: Commit**

```bash
git add frontend package-lock.json
git commit -m "chore(frontend): scaffold Vite React TS app with Vitest"
```

---

### Task 6: Base UI components

**Files:**
- Create: `frontend/src/components/Button.tsx`, `frontend/src/components/Button.css`
- Create: `frontend/src/components/TextField.tsx`, `frontend/src/components/TextField.css`
- Create: `frontend/src/components/ProgressBar.tsx`, `frontend/src/components/ProgressBar.css`
- Create: `frontend/src/components/Banner.tsx`, `frontend/src/components/Banner.css`
- Create: `frontend/src/components/Card.tsx`, `frontend/src/components/Card.css`
- Test: `frontend/src/components/ProgressBar.test.tsx`

**Interfaces:**
- Produces: `Button({ variante?, ...ButtonHTMLAttributes })`, `TextField({ etiqueta, id, error?, ...InputHTMLAttributes })`, `ProgressBar({ pasoActual: number, totalPasos: number })`, `Banner({ texto: string })`, `Card({ children })` — all consumed by Task 7 (`StepFlow`) and Task 8/9/10 (trámite step components).

- [ ] **Step 1: Write the failing test for `ProgressBar`**

`frontend/src/components/ProgressBar.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("muestra el paso actual y el total en texto legible", () => {
    render(<ProgressBar pasoActual={3} totalPasos={9} />);
    expect(screen.getByText("Paso 3 de 9")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w frontend`
Expected: FAIL — `./ProgressBar` does not exist

- [ ] **Step 3: Implement `Button`**

`frontend/src/components/Button.css`:

```css
.boton {
  min-height: 56px;
  padding: 0 24px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
}

.boton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.boton--primario {
  background-color: #1a4d8f;
  color: #ffffff;
}

.boton--secundario {
  background-color: #ffffff;
  color: #1a4d8f;
  border-color: #1a4d8f;
}
```

`frontend/src/components/Button.tsx`:

```tsx
import "./Button.css";
import type { ButtonHTMLAttributes } from "react";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario";
}

export function Button({ variante = "primario", className, ...resto }: BotonProps) {
  return <button className={`boton boton--${variante} ${className ?? ""}`.trim()} {...resto} />;
}
```

- [ ] **Step 4: Implement `TextField`**

`frontend/src/components/TextField.css`:

```css
.text-field {
  margin-bottom: 16px;
}

.text-field__etiqueta {
  display: block;
  font-size: 18px;
  margin-bottom: 4px;
}

.text-field__input {
  width: 100%;
  min-height: 48px;
  font-size: 18px;
  padding: 8px 12px;
  border: 2px solid #666;
  border-radius: 6px;
  box-sizing: border-box;
}

.text-field__error {
  color: #b00020;
  font-size: 16px;
}
```

`frontend/src/components/TextField.tsx`:

```tsx
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
```

- [ ] **Step 5: Implement `ProgressBar`**

`frontend/src/components/ProgressBar.css`:

```css
.progress-bar {
  margin-bottom: 16px;
}

.progress-bar__texto {
  font-size: 16px;
  margin: 0 0 4px;
}

.progress-bar__pista {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar__relleno {
  height: 100%;
  background-color: #1a4d8f;
  transition: width 0.2s ease;
}
```

`frontend/src/components/ProgressBar.tsx`:

```tsx
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
```

- [ ] **Step 6: Implement `Banner`**

`frontend/src/components/Banner.css`:

```css
.banner {
  background-color: #fff4d6;
  border: 1px solid #d9a300;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 16px;
  margin-bottom: 16px;
}
```

`frontend/src/components/Banner.tsx`:

```tsx
import "./Banner.css";

interface BannerProps {
  texto: string;
}

export function Banner({ texto }: BannerProps) {
  return (
    <div className="banner" role="note">
      {texto}
    </div>
  );
}
```

- [ ] **Step 7: Implement `Card`**

`frontend/src/components/Card.css`:

```css
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
```

`frontend/src/components/Card.tsx`:

```tsx
import "./Card.css";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm run test -w frontend`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components
git commit -m "feat(frontend): add base UI components"
```

---

### Task 7: Step-flow engine

**Files:**
- Create: `frontend/src/engine/tipos.ts`
- Create: `frontend/src/engine/ContextoFlujo.tsx`
- Create: `frontend/src/engine/StepFlow.tsx`
- Test: `frontend/src/engine/StepFlow.test.tsx`

**Interfaces:**
- Consumes: `Button`, `TextField`, `ProgressBar`, `Banner` from `../components/*` (Task 6).
- Produces: `PropsPaso<TDatos>`, `DefinicionPaso<TDatos>` types; `ProveedorFlujo<TDatos>({ pasos, datosIniciales, children })`; `useFlujo<TDatos>()`; `StepFlow<TDatos>({ pasos })` — all consumed by Task 8/9/10 (step components) and Task 11 (`RegistroBps.tsx`).

- [ ] **Step 1: Create `frontend/src/engine/tipos.ts`**

```ts
import type { ComponentType } from "react";

export interface PropsPaso<TDatos> {
  datos: TDatos;
  actualizarDatos: (cambios: Partial<TDatos>) => void;
}

export interface DefinicionPaso<TDatos> {
  id: string;
  titulo: string;
  Componente: ComponentType<PropsPaso<TDatos>>;
  esValido: (datos: TDatos) => boolean;
}
```

- [ ] **Step 2: Write the failing test for the engine**

`frontend/src/engine/StepFlow.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProveedorFlujo } from "./ContextoFlujo";
import { StepFlow } from "./StepFlow";
import type { DefinicionPaso, PropsPaso } from "./tipos";

interface DatosPrueba {
  texto: string;
}

function PasoUno({ datos, actualizarDatos }: PropsPaso<DatosPrueba>) {
  return (
    <input aria-label="texto" value={datos.texto} onChange={(e) => actualizarDatos({ texto: e.target.value })} />
  );
}

function PasoDos() {
  return <p>Segundo paso</p>;
}

const pasosPrueba: DefinicionPaso<DatosPrueba>[] = [
  { id: "uno", titulo: "Paso uno", Componente: PasoUno, esValido: (d) => d.texto.length > 0 },
  { id: "dos", titulo: "Paso dos", Componente: PasoDos, esValido: () => true },
];

function renderFlujo() {
  return render(
    <ProveedorFlujo pasos={pasosPrueba} datosIniciales={{ texto: "" }}>
      <StepFlow pasos={pasosPrueba} />
    </ProveedorFlujo>,
  );
}

describe("StepFlow", () => {
  it("muestra el paso actual y el total", () => {
    renderFlujo();
    expect(screen.getByText("Paso 1 de 2")).toBeInTheDocument();
  });

  it("no permite avanzar si el paso no es válido", () => {
    renderFlujo();
    expect(screen.getByText("Siguiente")).toBeDisabled();
  });

  it("permite avanzar cuando el paso es válido y conserva los datos al volver", () => {
    renderFlujo();
    fireEvent.change(screen.getByLabelText("texto"), { target: { value: "hola" } });
    fireEvent.click(screen.getByText("Siguiente"));
    expect(screen.getByText("Segundo paso")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Atrás"));
    expect(screen.getByLabelText("texto")).toHaveValue("hola");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -w frontend`
Expected: FAIL — `./ContextoFlujo` and `./StepFlow` don't exist

- [ ] **Step 4: Implement `frontend/src/engine/ContextoFlujo.tsx`**

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import type { DefinicionPaso } from "./tipos";

interface EstadoFlujo<TDatos> {
  pasoActual: number;
  totalPasos: number;
  datos: TDatos;
  puedeAvanzar: boolean;
  errorPaso: string | null;
  actualizarDatos: (cambios: Partial<TDatos>) => void;
  avanzar: () => void;
  retroceder: () => void;
  establecerError: (mensaje: string | null) => void;
}

const ContextoFlujo = createContext<EstadoFlujo<unknown> | null>(null);

interface ProveedorFlujoProps<TDatos> {
  pasos: DefinicionPaso<TDatos>[];
  datosIniciales: TDatos;
  children: ReactNode;
}

export function ProveedorFlujo<TDatos>({ pasos, datosIniciales, children }: ProveedorFlujoProps<TDatos>) {
  const [pasoActual, setPasoActual] = useState(0);
  const [datos, setDatos] = useState<TDatos>(datosIniciales);
  const [errorPaso, setErrorPaso] = useState<string | null>(null);

  const actualizarDatos = (cambios: Partial<TDatos>) => {
    setDatos((anteriores) => ({ ...anteriores, ...cambios }));
  };

  const puedeAvanzar = pasos[pasoActual].esValido(datos);

  const avanzar = () => {
    if (!puedeAvanzar) return;
    setErrorPaso(null);
    setPasoActual((actual) => Math.min(actual + 1, pasos.length - 1));
  };

  const retroceder = () => {
    setErrorPaso(null);
    setPasoActual((actual) => Math.max(actual - 1, 0));
  };

  const valor: EstadoFlujo<TDatos> = {
    pasoActual,
    totalPasos: pasos.length,
    datos,
    puedeAvanzar,
    errorPaso,
    actualizarDatos,
    avanzar,
    retroceder,
    establecerError: setErrorPaso,
  };

  return <ContextoFlujo.Provider value={valor as EstadoFlujo<unknown>}>{children}</ContextoFlujo.Provider>;
}

export function useFlujo<TDatos>(): EstadoFlujo<TDatos> {
  const contexto = useContext(ContextoFlujo);
  if (!contexto) {
    throw new Error("useFlujo debe usarse dentro de ProveedorFlujo");
  }
  return contexto as EstadoFlujo<TDatos>;
}
```

- [ ] **Step 5: Implement `frontend/src/engine/StepFlow.tsx`**

```tsx
import type { DefinicionPaso } from "./tipos";
import { useFlujo } from "./ContextoFlujo";
import { ProgressBar } from "../components/ProgressBar";
import { Banner } from "../components/Banner";
import { Button } from "../components/Button";

interface StepFlowProps<TDatos> {
  pasos: DefinicionPaso<TDatos>[];
}

export function StepFlow<TDatos>({ pasos }: StepFlowProps<TDatos>) {
  const { pasoActual, totalPasos, datos, actualizarDatos, puedeAvanzar, errorPaso, avanzar, retroceder } =
    useFlujo<TDatos>();
  const paso = pasos[pasoActual];
  const Componente = paso.Componente;

  return (
    <div className="step-flow">
      <Banner texto="Esto es una simulación educativa. Ningún dato real de BPS se procesa aquí." />
      <ProgressBar pasoActual={pasoActual + 1} totalPasos={totalPasos} />
      <h2>{paso.titulo}</h2>
      <Componente datos={datos} actualizarDatos={actualizarDatos} />
      {errorPaso && (
        <p role="alert" className="error-paso">
          {errorPaso}
        </p>
      )}
      <div className="step-flow__navegacion">
        <Button variante="secundario" onClick={retroceder} disabled={pasoActual === 0}>
          Atrás
        </Button>
        <Button onClick={avanzar} disabled={!puedeAvanzar}>
          {pasoActual === totalPasos - 1 ? "Finalizar" : "Siguiente"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -w frontend`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/src/engine
git commit -m "feat(frontend): add generic step-flow engine"
```

---

### Task 8: Registro BPS — steps 1-4 (Introducción, Datos personales, Cédula, Contacto)

**Files:**
- Create: `frontend/src/tramites/registro-bps/tipos.ts`
- Create: `frontend/src/tramites/registro-bps/pasos/Introduccion.tsx`
- Create: `frontend/src/tramites/registro-bps/pasos/DatosPersonales.tsx`
- Create: `frontend/src/tramites/registro-bps/pasos/Cedula.tsx`
- Create: `frontend/src/tramites/registro-bps/pasos/Contacto.tsx`

**Interfaces:**
- Consumes: `PropsPaso<TDatos>` from `../../../engine/tipos` (Task 7); `TextField`, `Card` from `../../../components/*` (Task 6).
- Produces: `DatosRegistroBps` type, `datosIniciales` value (consumed by Task 9, 10, 11); `Introduccion`/`introduccionValida`, `DatosPersonales`/`datosPersonalesValidos`, `Cedula`/`cedulaValida`, `Contacto`/`contactoValido` (consumed by Task 11's `pasos.ts`).

- [ ] **Step 1: Create `frontend/src/tramites/registro-bps/tipos.ts`**

```ts
export interface DatosRegistroBps {
  nombre: string;
  apellido: string;
  cedula: string;
  celular: string;
  correo: string;
  codigoCorreoEnviado: boolean;
  codigoCorreoValidado: boolean;
  codigoSmsValidado: boolean;
  terminosAceptados: boolean;
  contrasena: string;
}

export const datosIniciales: DatosRegistroBps = {
  nombre: "Ana",
  apellido: "Pérez",
  cedula: "",
  celular: "",
  correo: "",
  codigoCorreoEnviado: false,
  codigoCorreoValidado: false,
  codigoSmsValidado: false,
  terminosAceptados: false,
  contrasena: "",
};
```

- [ ] **Step 2: Create `frontend/src/tramites/registro-bps/pasos/Introduccion.tsx`**

```tsx
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { Card } from "../../../components/Card";

export function Introduccion(_props: PropsPaso<DatosRegistroBps>) {
  return (
    <Card>
      <p>
        Vas a practicar, paso a paso, qué pasa después de pedir tu Usuario Personal BPS. Todo lo que vas a hacer acá
        es una simulación: no se conecta con ningún sistema real de BPS.
      </p>
      <p>
        El pedido real del Usuario Personal BPS se hace <strong>en persona</strong> (Abitab, RedPagos, Correo
        Uruguayo, El Dorado o una oficina de BPS), llevando tu cédula vigente. Esta práctica empieza después de ese
        paso.
      </p>
    </Card>
  );
}

export function introduccionValida(): boolean {
  return true;
}
```

- [ ] **Step 3: Create `frontend/src/tramites/registro-bps/pasos/DatosPersonales.tsx`**

```tsx
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";

export function DatosPersonales({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>Estos datos son ficticios, solo para practicar. Podés dejarlos como están o cambiarlos.</p>
      <TextField id="nombre" etiqueta="Nombre" value={datos.nombre} onChange={(e) => actualizarDatos({ nombre: e.target.value })} />
      <TextField
        id="apellido"
        etiqueta="Apellido"
        value={datos.apellido}
        onChange={(e) => actualizarDatos({ apellido: e.target.value })}
      />
    </div>
  );
}

export function datosPersonalesValidos(datos: DatosRegistroBps): boolean {
  return datos.nombre.trim().length > 0 && datos.apellido.trim().length > 0;
}
```

- [ ] **Step 4: Create `frontend/src/tramites/registro-bps/pasos/Cedula.tsx`**

```tsx
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";

const FORMATO_CEDULA = /^\d\.\d{3}\.\d{3}-\d$/;

export function Cedula({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>
        En el trámite real te van a pedir tu cédula vigente en persona. Acá anotá una cédula ficticia, con el
        formato de ejemplo, solo para practicar.
      </p>
      <TextField
        id="cedula"
        etiqueta="Cédula (formato X.XXX.XXX-X)"
        placeholder="1.234.567-8"
        value={datos.cedula}
        onChange={(e) => actualizarDatos({ cedula: e.target.value })}
      />
    </div>
  );
}

export function cedulaValida(datos: DatosRegistroBps): boolean {
  return FORMATO_CEDULA.test(datos.cedula.trim());
}
```

- [ ] **Step 5: Create `frontend/src/tramites/registro-bps/pasos/Contacto.tsx`**

```tsx
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contacto({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>El celular es ficticio, como los datos anteriores.</p>
      <TextField
        id="celular"
        etiqueta="Celular"
        placeholder="099 123 456"
        value={datos.celular}
        onChange={(e) => actualizarDatos({ celular: e.target.value })}
      />
      <p>
        <strong>Este correo sí es real.</strong> En el próximo paso te vamos a mandar un código real para que
        practiques cómo se valida. No lo vamos a guardar.
      </p>
      <TextField
        id="correo"
        etiqueta="Tu correo real"
        type="email"
        placeholder="tu-correo@ejemplo.com"
        value={datos.correo}
        onChange={(e) => actualizarDatos({ correo: e.target.value })}
      />
    </div>
  );
}

export function contactoValido(datos: DatosRegistroBps): boolean {
  return datos.celular.trim().length > 0 && FORMATO_CORREO.test(datos.correo.trim());
}
```

- [ ] **Step 6: Verify the frontend still builds and tests pass**

Run: `npm run test -w frontend && npm run build -w frontend`
Expected: PASS / exit 0 (these files aren't wired into `App.tsx` yet, but TypeScript must still type-check them)

- [ ] **Step 7: Commit**

```bash
git add frontend/src/tramites/registro-bps/tipos.ts frontend/src/tramites/registro-bps/pasos/Introduccion.tsx frontend/src/tramites/registro-bps/pasos/DatosPersonales.tsx frontend/src/tramites/registro-bps/pasos/Cedula.tsx frontend/src/tramites/registro-bps/pasos/Contacto.tsx
git commit -m "feat(frontend): add registro-bps steps 1-4"
```

---

### Task 9: Registro BPS — steps 5-6 (Código por correo real, Código SMS simulado)

**Files:**
- Create: `frontend/src/tramites/registro-bps/api.ts`
- Create: `frontend/src/tramites/registro-bps/pasos/CodigoCorreo.tsx`
- Create: `frontend/src/tramites/registro-bps/pasos/CodigoSms.tsx`

**Interfaces:**
- Consumes: `DatosRegistroBps` from `../tipos` (Task 8); `PropsPaso` from `../../../engine/tipos` (Task 7); `TextField`, `Button` from `../../../components/*` (Task 6).
- Produces: `enviarCodigo(correo): Promise<{ok, motivo?}>`, `validarCodigo(correo, codigo): Promise<{valido}>` (calling the backend from Task 3/4); `CodigoCorreo`/`codigoCorreoValido`, `CodigoSms`/`codigoSmsValido` (consumed by Task 11's `pasos.ts`).

- [ ] **Step 1: Create `frontend/src/tramites/registro-bps/api.ts`**

```ts
const URL_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type MotivoErrorEnvio = "limite_alcanzado" | "correo_invalido" | "error_envio";

export interface RespuestaEnviarCodigo {
  ok: boolean;
  motivo?: MotivoErrorEnvio;
}

export async function enviarCodigo(correo: string): Promise<RespuestaEnviarCodigo> {
  try {
    const respuesta = await fetch(`${URL_BASE}/api/enviar-codigo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo }),
    });
    return await respuesta.json();
  } catch {
    return { ok: false, motivo: "error_envio" };
  }
}

export async function validarCodigo(correo: string, codigo: string): Promise<{ valido: boolean }> {
  try {
    const respuesta = await fetch(`${URL_BASE}/api/validar-codigo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, codigo }),
    });
    return await respuesta.json();
  } catch {
    return { valido: false };
  }
}
```

- [ ] **Step 2: Create `frontend/src/tramites/registro-bps/pasos/CodigoCorreo.tsx`**

```tsx
import { useState } from "react";
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";
import { Button } from "../../../components/Button";
import { enviarCodigo, validarCodigo } from "../api";

export function CodigoCorreo({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [validando, setValidando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleEnviar = async () => {
    setEnviando(true);
    setMensaje(null);
    const respuesta = await enviarCodigo(datos.correo);
    setEnviando(false);
    if (respuesta.ok) {
      actualizarDatos({ codigoCorreoEnviado: true });
      setMensaje("Te enviamos un código a tu correo. Puede tardar unos minutos.");
    } else if (respuesta.motivo === "limite_alcanzado") {
      setMensaje("Ya pediste el código muchas veces. Esperá antes de volver a intentar.");
    } else if (respuesta.motivo === "correo_invalido") {
      setMensaje("Ese correo no parece válido. Volvé al paso anterior y revisalo.");
    } else {
      setMensaje("No pudimos enviar el código ahora. Probá de nuevo en un momento.");
    }
  };

  const handleValidar = async () => {
    setValidando(true);
    setMensaje(null);
    const { valido } = await validarCodigo(datos.correo, codigoIngresado);
    setValidando(false);
    if (valido) {
      actualizarDatos({ codigoCorreoValidado: true });
      setMensaje("¡Código correcto!");
    } else {
      setMensaje("Ese código no es correcto o venció. Podés pedir uno nuevo.");
    }
  };

  return (
    <div>
      <p>Vamos a mandarte un código real a tu correo para que practiques cómo se valida — no vamos a guardar tu correo.</p>
      <Button onClick={handleEnviar} disabled={enviando}>
        {enviando ? "Enviando…" : "Enviarme el código"}
      </Button>
      {datos.codigoCorreoEnviado && (
        <>
          <TextField
            id="codigo-correo"
            etiqueta="Código que recibiste por correo"
            value={codigoIngresado}
            onChange={(e) => setCodigoIngresado(e.target.value)}
          />
          <Button onClick={handleValidar} disabled={validando || codigoIngresado.trim().length === 0}>
            {validando ? "Validando…" : "Validar"}
          </Button>
        </>
      )}
      {mensaje && <p role="status">{mensaje}</p>}
      {datos.codigoCorreoValidado && <p role="status">Código validado correctamente.</p>}
    </div>
  );
}

export function codigoCorreoValido(datos: DatosRegistroBps): boolean {
  return datos.codigoCorreoValidado;
}
```

- [ ] **Step 3: Create `frontend/src/tramites/registro-bps/pasos/CodigoSms.tsx`**

```tsx
import { useState } from "react";
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";
import { Button } from "../../../components/Button";

const CODIGO_SIMULADO = "123456";

export function CodigoSms({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleValidar = () => {
    if (codigoIngresado.trim() === CODIGO_SIMULADO) {
      actualizarDatos({ codigoSmsValidado: true });
      setMensaje("¡Código correcto!");
    } else {
      setMensaje("Ese código no es correcto. Probá otra vez.");
    }
  };

  return (
    <div>
      <p>En el trámite real te llega un SMS con un código. Acá, para practicar sin gastos, el código siempre es este:</p>
      <p className="codigo-simulado">{CODIGO_SIMULADO}</p>
      <TextField
        id="codigo-sms"
        etiqueta="Ingresá el código"
        value={codigoIngresado}
        onChange={(e) => setCodigoIngresado(e.target.value)}
      />
      <Button onClick={handleValidar} disabled={datos.codigoSmsValidado}>
        Validar
      </Button>
      {mensaje && <p role="status">{mensaje}</p>}
    </div>
  );
}

export function codigoSmsValido(datos: DatosRegistroBps): boolean {
  return datos.codigoSmsValidado;
}
```

- [ ] **Step 4: Verify the frontend still builds**

Run: `npm run build -w frontend`
Expected: exit 0

- [ ] **Step 5: Commit**

```bash
git add frontend/src/tramites/registro-bps/api.ts frontend/src/tramites/registro-bps/pasos/CodigoCorreo.tsx frontend/src/tramites/registro-bps/pasos/CodigoSms.tsx
git commit -m "feat(frontend): add registro-bps email code (real) and SMS code (simulated) steps"
```

---

### Task 10: Registro BPS — steps 7-9 (Términos, Contraseña, Revisión/Confirmación/Resultado)

**Files:**
- Create: `frontend/src/tramites/registro-bps/pasos/Terminos.tsx`
- Create: `frontend/src/tramites/registro-bps/pasos/Contrasena.tsx`
- Create: `frontend/src/tramites/registro-bps/pasos/Revision.tsx`
- Test: `frontend/src/tramites/registro-bps/pasos/Revision.test.tsx`

**Interfaces:**
- Consumes: `DatosRegistroBps`, `datosIniciales` from `../tipos` (Task 8); `PropsPaso` from `../../../engine/tipos` (Task 7); `Button`, `Card` from `../../../components/*` (Task 6).
- Produces: `Terminos`/`terminosValidos`, `Contrasena`/`contrasenaValida`, `Revision`/`revisionValida` (consumed by Task 11's `pasos.ts`).

- [ ] **Step 1: Write the failing test for the review screen**

`frontend/src/tramites/registro-bps/pasos/Revision.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Revision } from "./Revision";
import { datosIniciales } from "../tipos";

describe("Revision", () => {
  it("muestra los datos ingresados", () => {
    const datos = {
      ...datosIniciales,
      nombre: "Ana",
      apellido: "Gómez",
      cedula: "1.234.567-8",
      celular: "099111222",
      correo: "ana@ejemplo.com",
    };
    render(<Revision datos={datos} actualizarDatos={() => {}} />);
    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
    expect(screen.getByText("1.234.567-8")).toBeInTheDocument();
  });

  it("muestra el resultado y los aprendizajes tras confirmar", () => {
    render(<Revision datos={datosIniciales} actualizarDatos={() => {}} />);
    fireEvent.click(screen.getByText("Confirmar"));
    expect(screen.getByText("¡Listo! Practicaste todo el proceso.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w frontend`
Expected: FAIL — `./Revision` does not exist

- [ ] **Step 3: Create `frontend/src/tramites/registro-bps/pasos/Terminos.tsx`**

```tsx
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";

export function Terminos({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>
        <em>Texto de ejemplo, no es el texto real de BPS:</em>
      </p>
      <p>
        Al aceptar, confirmás que los datos que ingresaste son correctos y que vas a usar tu Usuario Personal para
        trámites en línea de forma responsable.
      </p>
      <label className="checkbox-grande">
        <input
          type="checkbox"
          checked={datos.terminosAceptados}
          onChange={(e) => actualizarDatos({ terminosAceptados: e.target.checked })}
        />
        Acepto los términos y condiciones (simulados)
      </label>
    </div>
  );
}

export function terminosValidos(datos: DatosRegistroBps): boolean {
  return datos.terminosAceptados;
}
```

- [ ] **Step 4: Create `frontend/src/tramites/registro-bps/pasos/Contrasena.tsx`**

```tsx
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { TextField } from "../../../components/TextField";

const LARGO_MINIMO = 6;

export function Contrasena({ datos, actualizarDatos }: PropsPaso<DatosRegistroBps>) {
  return (
    <div>
      <p>Esta es una contraseña de práctica. No la vamos a guardar ni usar para nada real.</p>
      <TextField
        id="contrasena"
        etiqueta={`Contraseña de práctica (mínimo ${LARGO_MINIMO} caracteres)`}
        type="password"
        value={datos.contrasena}
        onChange={(e) => actualizarDatos({ contrasena: e.target.value })}
      />
    </div>
  );
}

export function contrasenaValida(datos: DatosRegistroBps): boolean {
  return datos.contrasena.trim().length >= LARGO_MINIMO;
}
```

- [ ] **Step 5: Create `frontend/src/tramites/registro-bps/pasos/Revision.tsx`**

```tsx
import { useState } from "react";
import type { PropsPaso } from "../../../engine/tipos";
import type { DatosRegistroBps } from "../tipos";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";

const APRENDIZAJES = [
  "El alta del Usuario Personal BPS se pide en persona, no online.",
  "Después de pedirlo, llega un correo con un enlace de activación.",
  "Ese enlace pide un código por SMS para confirmar tu celular.",
  "Tenés que aceptar términos y condiciones antes de seguir.",
  "Un segundo correo te deja crear tu contraseña definitiva.",
];

export function Revision({ datos }: PropsPaso<DatosRegistroBps>) {
  const [confirmado, setConfirmado] = useState(false);

  if (confirmado) {
    return (
      <Card>
        <h3>¡Listo! Practicaste todo el proceso.</h3>
        <p>¿Qué aprendiste?</p>
        <ul>
          {APRENDIZAJES.map((punto) => (
            <li key={punto}>{punto}</li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <Card>
      <p>Revisá los datos antes de confirmar:</p>
      <dl className="revision-lista">
        <dt>Nombre</dt>
        <dd>
          {datos.nombre} {datos.apellido}
        </dd>
        <dt>Cédula</dt>
        <dd>{datos.cedula}</dd>
        <dt>Celular</dt>
        <dd>{datos.celular}</dd>
        <dt>Correo</dt>
        <dd>{datos.correo}</dd>
      </dl>
      <Button onClick={() => setConfirmado(true)}>Confirmar</Button>
    </Card>
  );
}

export function revisionValida(): boolean {
  return true;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -w frontend`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/src/tramites/registro-bps/pasos/Terminos.tsx frontend/src/tramites/registro-bps/pasos/Contrasena.tsx frontend/src/tramites/registro-bps/pasos/Revision.tsx frontend/src/tramites/registro-bps/pasos/Revision.test.tsx
git commit -m "feat(frontend): add registro-bps terms, password, and review/result steps"
```

---

### Task 11: Wire the trámite and the Home page into the app

**Files:**
- Create: `frontend/src/tramites/registro-bps/pasos.ts`
- Create: `frontend/src/tramites/registro-bps/RegistroBps.tsx`
- Create: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: every step component + validator from Tasks 8-10; `datosIniciales` from Task 8; `ProveedorFlujo`, `StepFlow` from Task 7; `Button`, `Card` from Task 6.
- Produces: `pasosRegistroBps: DefinicionPaso<DatosRegistroBps>[]`; `RegistroBps()` component; updated `App()` that switches between `Home` and `RegistroBps`.

- [ ] **Step 1: Create `frontend/src/tramites/registro-bps/pasos.ts`**

```ts
import type { DefinicionPaso } from "../../engine/tipos";
import type { DatosRegistroBps } from "./tipos";
import { Introduccion, introduccionValida } from "./pasos/Introduccion";
import { DatosPersonales, datosPersonalesValidos } from "./pasos/DatosPersonales";
import { Cedula, cedulaValida } from "./pasos/Cedula";
import { Contacto, contactoValido } from "./pasos/Contacto";
import { CodigoCorreo, codigoCorreoValido } from "./pasos/CodigoCorreo";
import { CodigoSms, codigoSmsValido } from "./pasos/CodigoSms";
import { Terminos, terminosValidos } from "./pasos/Terminos";
import { Contrasena, contrasenaValida } from "./pasos/Contrasena";
import { Revision, revisionValida } from "./pasos/Revision";

export const pasosRegistroBps: DefinicionPaso<DatosRegistroBps>[] = [
  { id: "introduccion", titulo: "Antes de empezar", Componente: Introduccion, esValido: introduccionValida },
  { id: "datos-personales", titulo: "Datos personales", Componente: DatosPersonales, esValido: datosPersonalesValidos },
  { id: "cedula", titulo: "Cédula", Componente: Cedula, esValido: cedulaValida },
  { id: "contacto", titulo: "Datos de contacto", Componente: Contacto, esValido: contactoValido },
  { id: "codigo-correo", titulo: "Código por correo", Componente: CodigoCorreo, esValido: codigoCorreoValido },
  { id: "codigo-sms", titulo: "Código por SMS (simulado)", Componente: CodigoSms, esValido: codigoSmsValido },
  { id: "terminos", titulo: "Términos y condiciones", Componente: Terminos, esValido: terminosValidos },
  { id: "contrasena", titulo: "Crear contraseña", Componente: Contrasena, esValido: contrasenaValida },
  { id: "revision", titulo: "Revisión y confirmación", Componente: Revision, esValido: revisionValida },
];
```

- [ ] **Step 2: Create `frontend/src/tramites/registro-bps/RegistroBps.tsx`**

```tsx
import { ProveedorFlujo } from "../../engine/ContextoFlujo";
import { StepFlow } from "../../engine/StepFlow";
import { pasosRegistroBps } from "./pasos";
import { datosIniciales } from "./tipos";

export function RegistroBps() {
  return (
    <ProveedorFlujo pasos={pasosRegistroBps} datosIniciales={datosIniciales}>
      <StepFlow pasos={pasosRegistroBps} />
    </ProveedorFlujo>
  );
}
```

- [ ] **Step 3: Create `frontend/src/pages/Home.tsx`**

```tsx
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
```

- [ ] **Step 4: Replace `frontend/src/App.tsx`**

```tsx
import { useState } from "react";
import { Home } from "./pages/Home";
import { RegistroBps } from "./tramites/registro-bps/RegistroBps";

export function App() {
  const [tramiteActivo, setTramiteActivo] = useState<string | null>(null);

  if (tramiteActivo === "registro-bps") {
    return <RegistroBps />;
  }

  return <Home onSeleccionarTramite={setTramiteActivo} />;
}

export default App;
```

- [ ] **Step 5: Verify everything builds and all frontend tests pass**

Run: `npm run test -w frontend && npm run build -w frontend`
Expected: PASS / exit 0

- [ ] **Step 6: Manual smoke test with both servers running**

Run: `npm run dev` (from repo root)
Expected: backend logs "Backend escuchando en el puerto 3001"; frontend serves on `http://localhost:5173`. Open it in a browser, click "Empezar", click through to "Datos de contacto", enter a real email you control, click "Enviarme el código" on the "Código por correo" step, and confirm an email arrives (requires `backend/.env` to have a valid `RESEND_API_KEY`, copied from `.env.example`). Stop both servers after checking (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/tramites/registro-bps/pasos.ts frontend/src/tramites/registro-bps/RegistroBps.tsx frontend/src/pages/Home.tsx frontend/src/App.tsx
git commit -m "feat(frontend): wire registro-bps trámite and Home page into the app"
```

---

### Task 12: Reference doc + root README

**Files:**
- Create: `docs/tramites/bps-registro-usuario.md`
- Create: `README.md` (root)

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Create `docs/tramites/bps-registro-usuario.md`**

```md
# Usuario Personal BPS — qué pasa después de pedirlo

Fecha de investigación: 2026-09-14

Fuentes oficiales:
- https://www.bps.gub.uy/11444/solicitar-usuario-personal-bps.html
- https://www.bps.gub.uy/18292/luego-de-solicitar-el-usuario-personal-bps-que-pasos-debo-seguir.html

## Qué es real

- El alta se pide en persona (Abitab, RedPagos, Anda, Correo Uruguayo, El Dorado o sucursal BPS).
- Llega un correo con un enlace de activación (30 días).
- El enlace pide un código SMS (10 días, hasta 3 reenvíos), solo celulares uruguayos.
- Se aceptan términos y condiciones.
- Un segundo correo permite crear la contraseña.

## Qué se simula en esta app y por qué

- El código SMS: se muestra un código fijo (123456) en pantalla, sin enviar SMS reales.
- El enlace de activación real: se reemplaza por pantallas de práctica dentro de la app.
- El correo con el código de verificación SÍ es real (enviado por Resend), por decisión explícita del
  dueño del proyecto — ver la sección 3 de
  `docs/superpowers/specs/2026-09-14-tramites-facil-bps-registro-design.md`.
- Términos y condiciones y contraseña: textos y campos de práctica, no los reales de BPS.

## Actualizar esta ficha

Si el proceso real de BPS cambia, actualizar esta ficha y el spec de diseño referenciado arriba.
```

- [ ] **Step 2: Create root `README.md`**

```md
# Trámites Fácil

Simulaciones educativas para practicar trámites paso a paso, sin tocar sistemas reales.

## Trámites disponibles

- Usuario Personal BPS: qué pasa después de pedirlo (ver `docs/tramites/bps-registro-usuario.md`)

## Desarrollo

\`\`\`bash
npm install
cp backend/.env.example backend/.env  # completar RESEND_API_KEY
npm run dev
\`\`\`

Frontend en http://localhost:5173, backend en http://localhost:3001.

## Tests

\`\`\`bash
npm run test
\`\`\`
```

- [ ] **Step 3: Commit**

```bash
git add docs/tramites/bps-registro-usuario.md README.md
git commit -m "docs: add bps-registro-usuario reference sheet and root README"
```
