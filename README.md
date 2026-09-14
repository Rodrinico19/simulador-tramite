# Trámites Fácil

Simulaciones educativas para practicar trámites paso a paso, sin tocar sistemas reales.

## Trámites disponibles

- Usuario Personal BPS: qué pasa después de pedirlo (ver `docs/tramites/bps-registro-usuario.md`)

## Desarrollo

```bash
npm install
cp backend/.env.example backend/.env  # completar RESEND_API_KEY
npm run dev
```

Frontend en http://localhost:5173, backend en http://localhost:3001.

### Nota: Limitación de Resend en desarrollo

El plan gratuito de Resend solo permite enviar emails a la dirección registrada en la cuenta. Para probar la verificación por email con otras direcciones, se requiere verificar un dominio en la cuenta de Resend (no incluido en este proyecto).

## Tests

```bash
npm run test
```
