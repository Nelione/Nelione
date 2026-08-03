# Conectar el dominio nelione.com

## 1. Añadir el dominio en Vercel

**Vercel → tu proyecto → Settings → Domains → Add** → escribe `nelione.com`.
Añade también `www.nelione.com` (Vercel ofrece redirigir uno a otro: elige
`nelione.com` como principal y `www` como redirección, o al revés según
prefieras).

Vercel te mostrará los registros DNS que debes crear. Serán uno de estos dos
casos según dónde gestiones el DNS:

## 2a. Si usas los nameservers de tu registrador (caso habitual)

En el panel DNS de tu registrador (donde compraste el dominio) crea:

| Tipo | Nombre/Host | Valor | TTL |
|---|---|---|---|
| `A` | `@` | `76.76.21.21` | Auto |
| `CNAME` | `www` | `cname.vercel-dns.com.` | Auto |

> El valor `A` (`76.76.21.21`) es la IP que indica Vercel; **usa siempre el
> valor exacto que te muestre tu panel de Vercel** por si cambia.

## 2b. Si prefieres delegar el DNS a Vercel

Cambia los **nameservers** del dominio en tu registrador por los de Vercel
(te los muestra el panel, normalmente `ns1.vercel-dns.com` y
`ns2.vercel-dns.com`). La propagación puede tardar hasta 48 h.

## 3. Verificación y HTTPS

- La propagación DNS suele tardar de minutos a unas horas.
- Vercel emite el certificado **SSL/TLS automáticamente** (Let's Encrypt) en
  cuanto detecta los registros. No tienes que hacer nada.
- Cuando el dominio aparezca como **Valid Configuration** en Vercel, visita
  `https://nelione.com`.

## 4. Después de conectar el dominio

1. Confirma que `NEXT_PUBLIC_SITE_URL=https://nelione.com` está en Vercel y
   haz **redeploy** (afecta a canonicals, sitemap, Open Graph y URLs de
   Stripe).
2. Actualiza la **URL del webhook de Stripe** a
   `https://nelione.com/api/webhooks/stripe` si la habías creado con la URL
   `.vercel.app`.
3. Da de alta el sitio en **Google Search Console** (propiedad de dominio,
   se verifica con un registro `TXT`) y envía `https://nelione.com/sitemap.xml`.

## 5. Correo del dominio (opcional pero recomendado)

Para recibir mensajes en `hola@nelione.com` necesitas un proveedor de correo
(Google Workspace, Zoho, Fastmail…) y añadir sus registros `MX` + `TXT (SPF)`
+ `DKIM`. No interfiere con los registros `A`/`CNAME` del sitio web.
