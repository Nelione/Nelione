# Guía de despliegue — Nelione

Tiempo estimado: 30–45 min. Necesitas cuentas (gratuitas) en **GitHub**,
**Supabase**, **Stripe** y **Vercel**.

---

## Paso 0 — Requisitos locales

```bash
node -v   # 20.x o superior
npm -v
```

Descomprime el proyecto, entra en la carpeta e instala dependencias:

```bash
cd nelione
npm install
```

> Verifica versiones actuales antes de fijar: `npm view next version`,
> `npm view @supabase/supabase-js version`, `npm view stripe version`.
> Ajusta `package.json` si hay parches más recientes y reinstala.

Comprueba que compila y pasa el linter:

```bash
npm run typecheck
npm run lint
```

---

## Paso 1 — Supabase

1. Entra en https://supabase.com → **New project**. Elige región europea
   (p.ej. `eu-west-1` Irlanda o `eu-central-1` Fráncfort) por latencia y RGPD.
   Guarda la contraseña de la base de datos.
2. Cuando el proyecto esté listo, ve a **SQL Editor → New query**.
3. Copia y ejecuta **en orden** los dos archivos de `supabase/migrations/`:
   - `00000000000000_initial_schema.sql`
   - `00000000000001_contact_messages.sql`
   Cada uno debe terminar con "Success. No rows returned".
4. Ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secreto) → `SUPABASE_SERVICE_ROLE_KEY`
5. **Desactiva el registro público** (solo tú debes tener acceso admin):
   **Authentication → Sign In / Providers → Email** → desactiva
   "Allow new users to sign up". Activa "Confirm email" si quieres.
6. Crea tu usuario administrador: **Authentication → Users → Add user**
   (email + contraseña). El trigger `handle_new_user` le crea un perfil con
   rol `editor`. Para hacerlo `admin`, ve a **SQL Editor** y ejecuta:

   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'TU_EMAIL');
   ```

El bucket `products` (Storage) ya se crea desde la migración, con sus policies.

---

## Paso 2 — Stripe

1. Entra en https://dashboard.stripe.com. Trabaja en **modo test** (interruptor
   arriba a la derecha) hasta que todo funcione.
2. **Developers → API keys**:
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`
3. El webhook lo configurarás en el Paso 4 (necesita la URL de Vercel).

---

## Paso 3 — Subir el código a GitHub

```bash
git init
git add .
git commit -m "Nelione — plataforma inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/nelione.git
git push -u origin main
```

---

## Paso 4 — Vercel

1. Entra en https://vercel.com → **Add New → Project** → importa el repo
   `nelione`. Vercel detecta Next.js automáticamente.
2. Antes de desplegar, abre **Environment Variables** y añade (Production +
   Preview + Development):

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://nelione.com` |
   | `NEXT_PUBLIC_SUPABASE_URL` | (Paso 1) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Paso 1) |
   | `SUPABASE_SERVICE_ROLE_KEY` | (Paso 1) |
   | `STRIPE_SECRET_KEY` | (Paso 2) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | (Paso 2) |
   | `STRIPE_WEBHOOK_SECRET` | lo rellenas en el siguiente sub-paso |

3. Pulsa **Deploy**. Obtendrás una URL `nelione-xxxx.vercel.app`.
4. **Crea el webhook de Stripe** ahora que tienes URL:
   **Stripe → Developers → Webhooks → Add endpoint**
   - Endpoint URL: `https://nelione.com/api/webhooks/stripe`
     (o la URL `.vercel.app` mientras configuras el dominio)
   - Eventos: `checkout.session.completed` y `checkout.session.expired`
   - Copia el **Signing secret** (`whsec_…`) → variable
     `STRIPE_WEBHOOK_SECRET` en Vercel → **redeploy** (Deployments → ⋯ →
     Redeploy) para que tome la variable nueva.

---

## Paso 5 — Conectar el dominio nelione.com

Ver `docs/DOMINIO.md` para los registros DNS exactos.

---

## Paso 6 — Datos de prueba

1. Entra en `https://nelione.com/admin/login` con tu usuario admin.
2. **Categorías**: ya existen las tres del seed (Obras originales, Láminas,
   Esculturas). Ajusta si quieres.
3. **Obras → Nueva obra**: crea una ficha, guárdala, sube imágenes en la
   pantalla de edición, marca estado **Publicada**.
4. Verifica que aparece en `/obras`.

---

## Paso 7 — Probar el checkout (modo test)

1. Añade una obra al carrito → **Finalizar compra**.
2. En Stripe Checkout usa la tarjeta de prueba `4242 4242 4242 4242`,
   cualquier fecha futura y CVC.
3. Deberías volver a `/checkout/exito`. En el panel de admin el pedido pasa a
   **Pagado** (lo marca el webhook) y el stock se decrementa solo.
4. Revisa **Stripe → Developers → Webhooks → tu endpoint** para confirmar que
   los eventos llegan con `200`.

---

## Paso 8 — Pasar a producción

1. En Stripe, activa tu cuenta (datos fiscales/bancarios) y cambia al
   **modo live**. Copia las claves *live* y actualiza
   `STRIPE_SECRET_KEY` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` en Vercel.
2. Crea un **webhook nuevo en modo live** con la misma URL y eventos; copia su
   `whsec_…` live a `STRIPE_WEBHOOK_SECRET`. Redeploy.
3. Repasa `docs/CHECKLIST-PRODUCCION.md`.
