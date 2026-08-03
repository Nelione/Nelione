# Nelione

Plataforma ecommerce para el artista contemporáneo **Nelione**. Catálogo de
obra original, láminas y escultura, con checkout vía Stripe y panel de
administración.

Estética tipo galería contemporánea (Hauser & Wirth / Gagosian / Zwirner):
mucho espacio en blanco, tipografía condensada, fotografía a gran tamaño, modo
claro.

## Stack

Next.js 16 (App Router, RSC) · React 19 · TypeScript estricto · Tailwind CSS v4 ·
shadcn/ui · Supabase (BBDD + Auth + Storage, RLS) · Stripe Checkout · Biome ·
Vercel.

## Arranque rápido

```bash
npm install
cp .env.example .env.local   # rellena las variables
npm run dev                  # http://localhost:3000
```

Para Stripe en local:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copia el whsec_… que imprime a STRIPE_WEBHOOK_SECRET en .env.local
```

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Biome (lint) |
| `npm run lint:fix` | Biome con autofix |
| `npm run typecheck` | `tsc --noEmit` |

## Documentación

| Documento | Contenido |
|---|---|
| `docs/ARQUITECTURA.md` | Estructura, capas, modelo de seguridad y stock |
| `docs/DESPLIEGUE.md` | Despliegue paso a paso (Supabase, Stripe, Vercel) |
| `docs/DOMINIO.md` | Conectar nelione.com (DNS exactos) |
| `docs/CHECKLIST-PRODUCCION.md` | Verificación antes de lanzar |
| `docs/SEO-ESTRATEGIA.md` | SEO para artistas contemporáneos |
| `docs/CAPTACION-GALERIAS.md` | Captación de galerías y coleccionistas |

## Estructura

```
src/
├── app/            # Rutas (RSC por defecto)
│   ├── (público)   # inicio, colección, obras, sobre-el-artista, galerías
│   ├── carrito/ checkout/
│   ├── admin/      # área privada (login, panel, productos, categorías)
│   └── api/webhooks/stripe/
├── components/     # ui (shadcn), layout, catalog, cart, contact, admin, seo
├── lib/
│   ├── data/       # consultas RSC (solo lectura)
│   ├── actions/    # Server Actions (mutaciones)
│   ├── validation/ # esquemas Zod
│   ├── supabase/   # clientes browser/server/admin/static
│   └── stripe.ts
└── types/database.ts

supabase/migrations/   # esquema SQL (ejecutar en orden)
```

## Assets requeridos

Coloca en `/public` (ver `public/README-assets.md`):
`entrada.mp4`, `entrada-poster.jpg`, `retrato.jpg`, `og-image.jpg`, y
`icon.png` en `/src/app`.

## Notas de seguridad

- Tres clientes Supabase con privilegios crecientes; el de service role está
  marcado `server-only` y solo se usa en el webhook y acciones admin tras
  verificar rol.
- RLS en todas las tablas. Los pedidos solo se escriben desde el servidor.
- Los precios se leen siempre de la BBDD; el carrito (cookie httpOnly) solo
  guarda ids y cantidades.
- El estado `paid` lo escribe únicamente el webhook firmado de Stripe.
