# Trámites Fácil — Simulación de Registro de Usuario BPS

Fecha: 2026-09-14

## 1. Objetivo

Crear el proyecto "Trámites Fácil" (no existía en esta máquina) con su primer
trámite: una simulación educativa para que personas de 65+ practiquen cómo es
el proceso digital posterior a solicitar el Usuario Personal BPS, sin tocar
ningún sistema real del BPS y sin procesar datos personales reales, salvo un
correo electrónico real y voluntario del propio usuario, usado únicamente
para practicar la recepción de un código de verificación (ver sección 3).

## 2. Investigación — real vs. simulado

Fuentes oficiales consultadas (2026-09-14):

- https://www.bps.gub.uy/11444/solicitar-usuario-personal-bps.html
- https://www.bps.gub.uy/18292/luego-de-solicitar-el-usuario-personal-bps-que-pasos-debo-seguir.html

Proceso real actual:

1. La solicitud del Usuario Personal BPS es **presencial** (Abitab, RedPagos,
   Anda, Correo Uruguayo, El Dorado o sucursal BPS). No existe alta online.
   Se pide cédula vigente, un correo sin uso previo y un celular.
2. Llega un correo con un **enlace de activación** (válido 30 días).
3. En ese enlace se pide un **código SMS** (botón "Solicitar", válido 10
   días, hasta 3 reenvíos) y se valida (botón "Validar"). Solo aplica a
   celulares uruguayos.
4. Se **aceptan términos y condiciones** (checkbox + botón "Aceptar").
5. Llega un **segundo correo** con enlace para **crear la contraseña**.

Qué se simula y por qué:

| Paso real | En la simulación | Motivo |
|---|---|---|
| Entrega de cédula en persona | Se explica que es presencial; se completan cédula/nombre ficticios como práctica de "qué te van a pedir" | No se puede simular un trámite presencial en una app; se enseña la expectativa |
| Correo con enlace de activación | Pantalla "te llegó un correo (simulado)" | Recrear un enlace de activación real de un dominio ajeno no es seguro ni posible |
| Código SMS | Código fijo `123456` mostrado en pantalla | Enviar SMS reales tiene costo y requiere un proveedor de mensajería; fuera de alcance |
| Código por correo (paso nuevo, decisión del usuario) | **Correo real** enviado por Resend a la casilla que el usuario ingresa, con un código real de un solo uso | Decisión explícita del dueño del proyecto: quiere que esta parte sea real. Ver sección 3 para las salvaguardas |
| Términos y condiciones | Checkbox + texto de ejemplo breve, claramente marcado como simulado | El texto real de BPS no se reproduce textualmente para no aparentar ser el sitio oficial |
| Contraseña | Campo de práctica con reglas simples | Nunca se debe pedir ni almacenar una contraseña real |

## 3. Excepción: correo real con código de verificación

Decisión explícita del usuario dueño del proyecto (no una desviación
espontánea): el paso de "código por correo" va a enviar un código real a la
casilla que la persona ingrese, usando Resend.

Salvaguardas:

- El correo ingresado se usa **únicamente** para enviar y validar ese código
  durante la sesión activa. No se guarda en disco, no se loguea, no se
  reutiliza.
- El código (6 dígitos) vive en memoria del proceso backend, con vencimiento
  (10 minutos) y límite de reenvíos (3 veces), y se borra al validarse o
  expirar.
- El backend nunca devuelve el código al cliente; solo confirma
  válido/inválido.
- La pantalla dice explícitamente: "Vamos a mandarte un código real a tu
  correo para que practiques cómo se valida — no vamos a guardar tu correo."
- Ningún otro dato (cédula, nombre, teléfono, contraseña) sale del navegador.
- Limitación conocida de Resend: en el plan gratuito sin dominio verificado,
  solo se puede enviar a la casilla dueña de la cuenta de Resend. Para uso
  con múltiples personas reales hace falta verificar un dominio propio (fuera
  del alcance de esta implementación; queda documentado como paso manual
  pendiente del usuario).

## 4. Flujo (9 pasos)

1. **Introducción** — aviso permanente de simulación + aclaración de que el
   alta real empieza en persona.
2. **Datos personales** — nombre y apellido ficticios (prellenados,
   editables).
3. **Cédula** — cédula ficticia, formato `X.XXX.XXX-X`.
4. **Datos de contacto** — celular ficticio + **correo real** (se aclara por
   qué este campo es distinto a los demás).
5. **Código por correo** — botón "Enviarme el código", se llama al backend,
   la persona revisa su casilla e ingresa el código; botón "Validar".
6. **Código SMS (simulado)** — se muestra `123456` en pantalla, se ingresa,
   botón "Validar".
7. **Términos y condiciones (simulados)** — checkbox + botón "Aceptar".
8. **Crear contraseña (práctica)** — campo ficticio con reglas simples.
9. **Revisión → Confirmación → Resultado** — resumen de los datos, botón
   "Confirmar", pantalla de éxito con "¿Qué aprendiste?" (4-5 puntos).

Reglas de UX transversales: una acción principal por pantalla, "Paso X de 9"
visible, botones grandes (alto mínimo 56px), tipografía grande (mínimo 18-20px
base), alto contraste, sin tecnicismos, error amable que nunca borra lo ya
cargado, navegación atrás/adelante siempre disponible, aviso de simulación
visible pero no intrusivo en cada pantalla.

## 5. Arquitectura

```
tramites-facil/
  frontend/                 React + Vite + TypeScript
    src/
      engine/                StepFlow genérico (progreso, validación,
                              navegación, banner persistente, estado en
                              memoria vía Context)
      components/             Button, TextField, ProgressBar, Banner, Card
      tramites/
        registro-bps/          Definición de los 9 pasos + componentes propios
      pages/Home.tsx            Lista de trámites (hoy: 1 tarjeta)
      App.tsx                   Home ↔ trámite activo
  backend/                  Node + Express + TypeScript, solo local
    src/
      routes/codigo.ts        POST /api/enviar-codigo, POST /api/validar-codigo
      resend.ts                Cliente de Resend
      codigosEnMemoria.ts      Map<correo, {codigo, expira, intentosEnvio}>
    .env.example              RESEND_API_KEY=, EMAIL_REMITENTE=
  docs/tramites/bps-registro-usuario.md   Ficha corta de referencia (fecha,
                                            fuentes, qué se simula/simplifica)
```

Contrato de API:

- `POST /api/enviar-codigo` — body `{ correo: string }`. Valida formato de
  correo, chequea límite de reenvíos, genera código de 6 dígitos, lo guarda
  en memoria con vencimiento de 10 min, envía el correo vía Resend. Responde
  `{ ok: true }` o `{ ok: false, motivo: "limite_alcanzado" | "correo_invalido" | "error_envio" }`.
- `POST /api/validar-codigo` — body `{ correo: string, codigo: string }`.
  Compara contra memoria (y vencimiento). Responde `{ valido: boolean }`. Si
  es válido, borra la entrada.

Ejecución: `npm run dev` en la raíz levanta frontend (Vite) y backend
(ts-node/tsx + nodemon o similar) en paralelo vía `concurrently`. Todo local,
sin despliegue.

## 6. Testing

- Backend: pruebas del endpoint de códigos (generación, expiración, límite de
  3 reenvíos, validación correcta/incorrecta) con un cliente de Resend
  mockeado — nunca se llama a Resend real en los tests.
- Frontend: Vitest + Testing Library sobre el motor de pasos (navegación,
  "Paso X de Y", validación por paso, que un error no borre datos ya
  cargados) y sobre la pantalla de revisión (muestra los datos ingresados).
- Lint: ESLint (config del scaffold de Vite) en frontend y backend.
- Build: `npm run build` en ambos paquetes debe pasar sin errores.

## 7. Fuera de alcance

- SMS real, autenticación real, conexión a cualquier sistema de BPS,
  almacenamiento persistente de cualquier dato, despliegue en internet,
  verificación de dominio en Resend (queda como paso manual del usuario si
  más adelante lo necesita).

## 8. Referencia interna a mantener actualizada

`docs/tramites/bps-registro-usuario.md` — ficha corta (no un documento
extenso) con: fecha de investigación, fuentes oficiales, qué parte del
proceso real se simula, y qué partes fueron simplificadas por motivos
educativos. Se actualiza si el proceso real del BPS cambia.
