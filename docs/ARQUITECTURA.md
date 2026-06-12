# Nelione — Arquitectura del proyecto

## 1. Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Framework | Next.js 16 (App Router) | RSC por defecto, Server Actions |
| UI | React 19 + shadcn/ui + Tailwind CSS v4 | Theme en CSS (`@theme`), sin `tailwind.config` |
| Lenguaje | TypeScript estricto | `noUncheckedIndexedAccess` activado |
| Lint/Format | Biome | Sustituye ESLint + Prettier |
| BBDD + Auth + Storage | Supabase | RLS como frontera de seguridad |
| Pagos | Stripe Checkout (hosted) | Webhook firma los pedidos |
| Hosting | Vercel | Dominio: nelione.com |

## 2. Estructura de carpetas

```
nelione/
├── biome.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── .env.example
├── supabase/
│   └── migrations/
│       └── 00000000000000_initial_schema.sql
├── docs/
│   ├── ARQUITECTURA.md          ← este archivo
│   ├── DESPLIEGUE.md            (Fase 5)
│   ├── CHECKLIST-PRODUCCION.md  (Fase 5)
│   ├── SEO-ESTRATEGIA.md        (Fase 5)
│   └── CAPTACION-GALERIAS.md    (Fase 5)
└── src/
    ├── middleware.ts             # Refresco de sesión + guard /admin
    ├── app/
    │   ├── globals.css           # Tailwind v4 @theme — tokens de diseño
    │   ├── layout.tsx            # Root layout (fuentes, metadata base)
    │   ├── page.tsx              # 1. Inicio (vídeo de entrada)
    │   ├── sitemap.ts            # Sitemap dinámico
    │   ├── robots.ts             # robots.txt
    │   ├── coleccion/page.tsx    # 2. Colección actual
    │   ├── obras/                # 3-5. Catálogo por categoría
    │   │   ├── page.tsx          #    Todas las obras
    │   │   ├── [category]/page.tsx
    │   │   └── [category]/[slug]/page.tsx  # Detalle de obra
    │   ├── sobre-el-artista/page.tsx       # 6. Bio + statement
    │   ├── galerias/page.tsx     # Carta de presentación + contacto
    │   ├── carrito/page.tsx      # 10. Carrito
    │   ├── checkout/
    │   │   ├── exito/page.tsx    # 11. Confirmación de compra
    │   │   └── cancelado/page.tsx
    │   ├── admin/                # Área privada
    │   │   ├── layout.tsx        # Verificación de rol staff
    │   │   ├── login/page.tsx
    │   │   ├── page.tsx          # Dashboard
    │   │   ├── productos/...     # CRUD productos
    │   │   └── categorias/...    # CRUD categorías
    │   └── api/
    │       └── webhooks/
    │           └── stripe/route.ts
    ├── components/
    │   ├── ui/                   # shadcn/ui (button, dialog, input…)
    │   ├── layout/               # Nav, Footer
    │   ├── catalog/              # ProductCard, ProductGrid, Filters
    │   ├── cart/                 # CartPanel, AddToCartButton
    │   └── admin/                # Formularios del dashboard
    ├── lib/
    │   ├── utils.ts              # cn, formatPrice, slugify…
    │   ├── stripe.ts             # Cliente Stripe (server-only)
    │   ├── supabase/
    │   │   ├── client.ts         # Browser (anon, RLS)
    │   │   ├── server.ts         # RSC/Actions (anon + sesión, RLS)
    │   │   └── admin.ts          # Service Role (server-only, sin RLS)
    │   ├── data/                 # Capa de acceso a datos (queries RSC)
    │   │   ├── products.ts
    │   │   ├── categories.ts
    │   │   └── orders.ts
    │   ├── actions/              # Server Actions (mutaciones)
    │   │   ├── cart.ts
    │   │   ├── checkout.ts
    │   │   ├── contact.ts
    │   │   └── admin/
    │   │       ├── products.ts
    │   │       └── categories.ts
    │   └── validation/           # Esquemas Zod compartidos
    │       ├── product.ts
    │       └── contact.ts
    └── types/
        └── database.ts           # Tipos de la BBDD
```

## 3. Principios aplicados (SOLID / Clean Architecture)

**Separación por capas, dirección de dependencias hacia el dominio:**

```
UI (RSC/components) → actions/ + data/ → lib/supabase, lib/stripe → infraestructura
```

- **`lib/data/`** — *solo lectura*. Funciones puras de consulta usadas por Server
  Components. Devuelven tipos del dominio (`ProductWithRelations`), nunca
  exponen el cliente Supabase hacia arriba. (Dependency Inversion: la UI
  depende de funciones, no de Supabase.)
- **`lib/actions/`** — *mutaciones*. Server Actions con validación Zod en la
  frontera, autorización explícita y `revalidatePath`/`revalidateTag`.
  (Single Responsibility: una acción = un caso de uso.)
- **`lib/validation/`** — esquemas Zod compartidos entre formularios y
  acciones. Una sola fuente de verdad para las reglas de entrada.
- **Open/Closed en el catálogo**: añadir una categoría nueva no requiere tocar
  código — es una fila en `categories`; las rutas `[category]` la sirven.

## 4. Modelo de seguridad (defensa en profundidad)

1. **RLS como última línea**: aunque el código del servidor tenga un bug, la
   base de datos solo expone productos `published` al público y restringe
   escrituras a `is_staff()`.
2. **Tres clientes Supabase con privilegios crecientes**:
   - `client.ts` (browser, anon) → mínimo necesario.
   - `server.ts` (sesión) → operaciones del usuario autenticado, bajo RLS.
   - `admin.ts` (service role) → **solo** webhook de Stripe y acciones admin
     tras verificación de rol; protegido con `import "server-only"`.
3. **Pedidos sin escritura pública**: `orders`/`order_items` no tienen policies
   de INSERT para anon/authenticated. El único camino de creación es el
   servidor (checkout action + webhook), eliminando manipulación de precios.
4. **Precios siempre del servidor**: el carrito guarda solo `product_id` y
   `quantity`; el precio se lee de la BBDD al crear la sesión de Stripe.
5. **Webhook verificado por firma** (`STRIPE_WEBHOOK_SECRET`); el estado
   `paid` solo lo escribe el webhook, y el trigger de stock se dispara desde
   ese cambio de estado.
6. **Middleware** valida JWT con `getUser()` (no `getSession()`), y los
   headers de seguridad (HSTS, nosniff, frame deny) van en `next.config.ts`.

## 5. Decisiones de rendimiento

- **RSC por defecto**: todo el catálogo se renderiza en servidor; `"use client"`
  solo en: botón añadir al carrito, panel del carrito, formularios admin con
  estado, y el vídeo de entrada (autoplay handling).
- **Carrito en cookie firmada** (ids + cantidades), leída en servidor → el
  carrito es RSC, sin Context API ni estado global de cliente.
- **`next/image`** con AVIF/WebP sobre Supabase Storage (transformaciones CDN).
- **Caché**: páginas de catálogo con `revalidateTag("products")` invalidada
  desde las Server Actions del admin → contenido estático hasta que cambia.
- **Fuentes** con `next/font` (Barlow Condensed + Inter), self-hosted,
  `display: swap`, sin layout shift.

## 6. Modelo de stock

| Tipo | `is_unique` | `stock_quantity` | Al venderse |
|---|---|---|---|
| Cuadro original | `true` | `1` | Trigger → `status = archived` |
| Lámina (edición) | `false` | nº edición restante | Trigger decrementa |
| Escultura | según pieza | según pieza | ídem |

El decremento ocurre en el trigger `decrement_stock_on_paid_order`, disparado
cuando el webhook marca el pedido como `paid` — nunca desde el cliente.
