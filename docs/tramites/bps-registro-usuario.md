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
