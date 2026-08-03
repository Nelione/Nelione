# Checklist de producción — Nelione

## Seguridad
- [ ] Registro público desactivado en Supabase Auth (solo usuarios creados a mano).
- [ ] Tu usuario tiene rol `admin` en `public.profiles`.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` y `STRIPE_SECRET_KEY` **solo** en variables de
      servidor de Vercel (nunca con prefijo `NEXT_PUBLIC_`, nunca en el repo).
- [ ] `.env.local` está en `.gitignore` (lo está) y no se ha subido nunca.
- [ ] RLS activado en todas las tablas (lo activa la migración; verifícalo en
      Supabase → Authentication → Policies).
- [ ] Webhook de Stripe en modo **live** con su propio `whsec_…`.
- [ ] Headers de seguridad activos (HSTS, X-Frame-Options): comprueba en
      https://securityheaders.com tras desplegar.

## Pagos
- [ ] Cuenta de Stripe activada (datos fiscales y cuenta bancaria).
- [ ] Claves *live* configuradas en Vercel y redeploy hecho.
- [ ] Compra de prueba real (importe pequeño) completada de principio a fin.
- [ ] El pedido aparece como **Pagado** en el panel y el stock se decrementó.
- [ ] Países de envío de `shipping_address_collection` revisados (checkout.ts).
- [ ] Tarifa de envío (1500 = 15 €) ajustada a tu logística real (checkout.ts).

## Contenido
- [ ] `/public/entrada.mp4` + `entrada-poster.jpg` (vídeo de inicio).
- [ ] `/public/retrato.jpg` (foto del artista).
- [ ] `/public/og-image.jpg` (1200×630) y `/src/app/icon.png` (favicon 512×512).
- [ ] Biografía y trayectoria reales en `sobre-el-artista/page.tsx`
      (sustituir los marcadores `[…]`).
- [ ] Carta de presentación real en `galerias/page.tsx`.
- [ ] Al menos una obra publicada por categoría, con imágenes y `alt_text`.

## SEO
- [ ] `NEXT_PUBLIC_SITE_URL=https://nelione.com` en Vercel.
- [ ] `https://nelione.com/sitemap.xml` responde y lista las obras.
- [ ] `https://nelione.com/robots.txt` responde y excluye `/admin`, `/carrito`,
      `/checkout`, `/api`.
- [ ] Sitio verificado en Google Search Console y sitemap enviado.
- [ ] Datos estructurados validados en https://validator.schema.org
      (una ficha de obra + la home).
- [ ] Open Graph comprobado (comparte una URL en WhatsApp/LinkedIn y revisa la
      tarjeta).

## Rendimiento y calidad
- [ ] `npm run build` sin errores en local.
- [ ] Lighthouse ≥ 90 en Performance/SEO/Accessibility (móvil) en la home y una
      ficha de obra.
- [ ] Imágenes subidas en formato razonable (≤ 4 MB; el sitio sirve AVIF/WebP).
- [ ] Probado en móvil real (menú, carrito, checkout).

## Legal (según tu jurisdicción)
- [ ] Aviso legal, política de privacidad y de cookies (RGPD si vendes en UE).
- [ ] Condiciones de venta y política de devoluciones enlazadas en el footer.
- [ ] Texto de consentimiento en el formulario de contacto si procede.
