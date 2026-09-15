# Usuario eBROU — registro paso a paso

Fecha de investigación: 2026-09-15
Actualizado: 2026-09-15, con una captura de pantalla real del formulario de registro (aportada por el dueño
del proyecto) del formulario "Regístrese con su código de invitación" en https://ebanking.brou.com.uy.

Fuentes:
- https://www.brou.com.uy/personas/servicios/instructivo-de-adhesion-a-e-brou-en-cajeros-automaticos
- https://www.telenoche.com.uy/empresariales/ebrou-como-solicitar-clave-simples-pasos-n5361310
- https://tramitesyconsultas.org/como-acceder-a-ebrou-guia-paso-a-paso/
- Captura de pantalla real del formulario de registro de eBROU (aportada directamente, no un enlace público)

## Qué es real

- El alta de eBROU se inicia **en persona**: cajero RedBROU (con tarjeta de débito y PIN), Terminal de
  Autoservicio (TAS) o sucursal (con cédula vigente).
- Ese paso genera un **código de invitación** (formato `XXXX-XXXX`), mostrado en pantalla e impreso en el
  ticket.
- El código de invitación es válido por **5 días** para completar el registro en el sitio web.
- La pantalla real de registro se llama "Regístrese con su código de invitación" y pide: País (fijo
  Uruguay), Tipo de documento (C.I.), Número de documento y Código de invitación, con botones "Continuar" /
  "Cancelar".
- La contraseña definitiva debe tener **entre 10 y 30 caracteres**, incluir al menos **3 de 4 tipos**
  (mayúscula, minúscula, número, símbolo) y no puede contener `<` ni `>`.
- A diferencia del alta de BPS, el registro de eBROU **no usa un código de verificación por correo o SMS**.
- Diseño real: fondo azul institucional a pantalla completa, con el formulario en una tarjeta blanca
  centrada, header con el logo eBROU y footer con enlaces (Portal BROU, Seguridad, Gestión de Reclamos).

## Qué se simula en esta app y por qué

- El paso presencial (cajero/TAS/sucursal) no se puede simular: la app arranca donde arranca la parte web.
- El código de invitación: se muestra un valor fijo (`1234-5678`) en pantalla, como si fuera el ticket del
  cajero, sin ninguna operación bancaria real.
- El número de documento: campo de práctica, no se valida contra ningún padrón real.
- La contraseña: se valida en vivo contra la política real (largo y tipos de caracteres), pero no se guarda
  ni se usa para nada.
- El diseño visual (colores, tarjeta blanca, header/footer) imita al real para que la práctica se sienta
  parecida, pero **sin los logos oficiales** (isotipo eBROU y sello de Banco República): se usa un wordmark
  de texto propio para evitar reproducir marcas registradas de terceros. Se mantiene visible el aviso de
  "simulación educativa, no oficial" para que quede claro que no es el sitio real.

## Actualizar esta ficha

Si el proceso real de eBROU cambia, actualizar esta ficha.
