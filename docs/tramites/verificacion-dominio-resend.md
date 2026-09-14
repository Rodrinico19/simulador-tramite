# Verificar el dominio `globalassist.com.uy` en Resend

Fecha: 2026-09-14

## Por qué hace falta esto

El paso "Código por correo" del trámite Registro BPS manda un correo real con
un código de verificación, usando el servicio **Resend**.

En el plan gratuito, sin un dominio verificado, Resend **solo permite enviar
correos a la casilla dueña de la cuenta de Resend** (en este caso,
`soporte@globalassist.com.uy`). Cualquier otro destinatario es rechazado con
un error como:

```
You can only send testing emails to your own email address
(soporte@globalassist.com.uy). To send emails to other recipients,
please verify a domain at resend.com/domains, and change the `from`
address to an email using this domain.
```

Para que **cualquier persona** pueda ingresar su propio correo y recibir el
código (el objetivo real del proyecto), hace falta verificar que
`globalassist.com.uy` es nuestro, agregando registros DNS que lo demuestren.

## Qué es un registro DNS (en criollo)

El DNS es la configuración pública de un dominio (qué servidor de correo usa,
qué sitios apuntan a él, etc.). Agregar un "registro" ahí es como dejar una
notita pública que dice "Resend tiene permiso de mandar correos en nombre de
este dominio". Se carga en el panel de control de donde está contratado el
dominio (el mismo lugar donde se compró o donde se administra el hosting).

## Estado actual

- Dominio registrado en Resend el 2026-09-14, `id`
  `43ec448e-6843-4a68-976e-ecab9b033354`, status inicial `not_started`.
- Región: `us-east-1`.
- Pendiente: cargar los 4 registros DNS de abajo y esperar a que Resend los
  detecte (propagación: de minutos a un par de horas).

## Registros DNS a cargar

| Tipo  | Nombre               | Valor                                                                                                                                                                                                                           | Prioridad |
| ----- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| TXT   | `resend._domainkey`  | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDBHGkdLFD5XLgYjnCrRNaU8/Ly/c32ldeJ+1DYG0jIxJRlHrYfwhBjs0JX856nSrtHA7WIau16YW4gPs9YqbFTyMMZNQRK/+yA1OXG1Syj22KnmwWnaV/DAIGe/MkqgnVfsdIIVCWaTmeeUL2ZEBsh45UpHdcCxNxIAzqzwZiVuwIDAQAB` | —         |
| MX    | `send`                | `feedback-smtp.us-east-1.amazonses.com`                                                                                                                                                                                       | 10        |
| TXT   | `send`                | `v=spf1 include:amazonses.com ~all`                                                                                                                                                                                            | —         |
| CNAME | `rsend`               | `send.forge.rmta.net`                                                                                                                                                                                                          | —         |

Notas:
- El "Nombre" es un subdominio relativo — según el panel DNS puede pedirse
  como `send.globalassist.com.uy` completo, o solo `send` (el panel agrega el
  dominio automáticamente). Si un registro ya existe para ese nombre, hay que
  reemplazarlo, no duplicarlo.
- El valor DKIM (TXT) es largo — copiarlo completo, sin cortar.

## Pasos

1. Entrar al panel de administración DNS donde está `globalassist.com.uy`
   (el proveedor donde se compró el dominio o donde se administra el
   hosting).
2. Cargar los 4 registros de la tabla, exactamente con esos tipos, nombres y
   valores.
3. Guardar los cambios y esperar la propagación (minutos a un par de horas).
4. Verificar el estado desde la API de Resend:

   ```bash
   curl -s https://api.resend.com/domains/43ec448e-6843-4a68-976e-ecab9b033354 \
     -H "Authorization: Bearer $RESEND_API_KEY"
   ```

   El campo `"status"` pasa de `not_started` a `verified` cuando está listo.
   También se puede ver en el dashboard de Resend, en Domains.

## Después de verificar

Una vez que el dominio esté `verified`, cambiar en `backend/.env`:

```
EMAIL_REMITENTE=algo@globalassist.com.uy
```

(por ejemplo `notificaciones@globalassist.com.uy` o
`tramites@globalassist.com.uy` — cualquier casilla de ese dominio, no hace
falta que exista de verdad como buzón). A partir de ahí, el paso "Código por
correo" va a poder enviar a **cualquier destinatario**, no solo a la cuenta
de Resend.

## Fuera de alcance / no hecho todavía

- No se cargaron los registros DNS (paso manual pendiente del dueño del
  dominio).
- No se cambió `EMAIL_REMITENTE` en `backend/.env` (depende de que el
  dominio esté verificado primero).
