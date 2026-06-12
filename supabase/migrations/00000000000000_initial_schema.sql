-- ============================================================================
-- NELIONE — Esquema de base de datos Supabase
-- ============================================================================
-- Orden de ejecución: este archivo es idempotente y puede ejecutarse completo
-- en el SQL Editor de Supabase o vía Supabase CLI migrations.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- EXTENSIONES
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'product_type') then
    create type product_type as enum ('original', 'lamina', 'escultura');
  end if;

  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type product_status as enum ('draft', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');
  end if;

  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('admin', 'editor');
  end if;
end$$;

-- ----------------------------------------------------------------------------
-- TABLE: categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories is
  'Categorías del catálogo: láminas, cuadros (originales), esculturas.';

-- ----------------------------------------------------------------------------
-- TABLE: products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  slug text not null unique,
  name text not null,
  description text,
  product_type product_type not null,
  status product_status not null default 'draft',

  -- Pricing stored in minor units (cents) to avoid float rounding issues.
  price_amount integer not null check (price_amount >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),

  -- Stock management. NULL = unique/unlimited (e.g. one-off original).
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  is_unique boolean not null default false,

  -- Physical attributes
  width_cm numeric(6, 2),
  height_cm numeric(6, 2),
  depth_cm numeric(6, 2),
  weight_kg numeric(6, 2),
  medium text,
  edition_info text,
  year_created smallint,

  -- Stripe integration
  stripe_product_id text unique,
  stripe_price_id text unique,

  -- SEO
  meta_title text,
  meta_description text,

  featured boolean not null default false,
  display_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is
  'Catálogo de obras: cuadros originales, láminas y esculturas.';
comment on column public.products.price_amount is
  'Precio en céntimos (minor units) para evitar errores de redondeo.';
comment on column public.products.is_unique is
  'true para piezas únicas (cuadros originales); el stock se gestiona como 0/1.';

-- ----------------------------------------------------------------------------
-- TABLE: product_images
-- ----------------------------------------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  width_px integer,
  height_px integer,
  created_at timestamptz not null default now()
);

comment on table public.product_images is
  'Imágenes asociadas a cada obra, almacenadas en Supabase Storage (bucket "products").';
comment on column public.product_images.storage_path is
  'Ruta relativa dentro del bucket "products", p.ej. "lamina-01/main.webp".';

-- ----------------------------------------------------------------------------
-- TABLE: orders  (necesaria para checkout / confirmación de compra)
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  status order_status not null default 'pending',

  customer_email text not null,
  customer_name text,

  shipping_address jsonb,
  billing_address jsonb,

  subtotal_amount integer not null check (subtotal_amount >= 0),
  shipping_amount integer not null default 0 check (shipping_amount >= 0),
  total_amount integer not null check (total_amount >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is 'Pedidos generados a través de Stripe Checkout.';

-- ----------------------------------------------------------------------------
-- TABLE: order_items
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,

  -- Snapshot de datos del producto en el momento de la compra
  product_name text not null,
  unit_price_amount integer not null check (unit_price_amount >= 0),
  quantity integer not null check (quantity > 0),

  created_at timestamptz not null default now()
);

comment on table public.order_items is
  'Líneas de pedido. Guarda una copia (snapshot) del nombre/precio en el momento de compra.';

-- ----------------------------------------------------------------------------
-- TABLE: profiles  (vincula auth.users con roles de administración)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role app_role not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfiles de usuarios autenticados con acceso al área de administración.';

-- ============================================================================
-- ÍNDICES OPTIMIZADOS
-- ============================================================================

-- Productos: las consultas más frecuentes son por categoría + estado,
-- por tipo, por slug (detalle), por destacados, y ordenación.
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_type on public.products (product_type);
create index if not exists idx_products_slug on public.products (slug);
create index if not exists idx_products_featured
  on public.products (featured)
  where featured = true;
create index if not exists idx_products_status_type_order
  on public.products (status, product_type, display_order);

-- Categorías
create index if not exists idx_categories_slug on public.categories (slug);
create index if not exists idx_categories_display_order on public.categories (display_order);

-- Imágenes: las consultas siempre filtran por producto y ordenan por display_order
create index if not exists idx_product_images_product_id on public.product_images (product_id);
create index if not exists idx_product_images_product_order
  on public.product_images (product_id, display_order);
create unique index if not exists idx_product_images_one_primary
  on public.product_images (product_id)
  where is_primary = true;

-- Pedidos
create index if not exists idx_orders_stripe_session on public.orders (stripe_checkout_session_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_customer_email on public.orders (customer_email);

-- Líneas de pedido
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- ---- updated_at automático ------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---- Garantizar una sola imagen principal por producto ---------------------
create or replace function public.enforce_single_primary_image()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.is_primary then
    update public.product_images
       set is_primary = false
     where product_id = new.product_id
       and id <> new.id
       and is_primary = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_product_images_single_primary on public.product_images;
create trigger trg_product_images_single_primary
  before insert or update of is_primary on public.product_images
  for each row
  when (new.is_primary = true)
  execute function public.enforce_single_primary_image();

-- ---- Crear perfil automáticamente al registrar un usuario -----------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'editor'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- Decremento de stock al confirmar un pedido (paid) ---------------------
create or replace function public.decrement_stock_on_paid_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    update public.products p
       set stock_quantity = greatest(p.stock_quantity - oi.quantity, 0)
      from public.order_items oi
     where oi.order_id = new.id
       and p.id = oi.product_id
       and p.stock_quantity is not null;

    -- Las piezas únicas (cuadros originales) pasan a archivado al venderse.
    update public.products p
       set status = 'archived'
      from public.order_items oi
     where oi.order_id = new.id
       and p.id = oi.product_id
       and p.is_unique = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_decrement_stock on public.orders;
create trigger trg_orders_decrement_stock
  after update of status on public.orders
  for each row execute function public.decrement_stock_on_paid_order();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.profiles enable row level security;

-- ----------------------------------------------------------------------------
-- Helper: ¿es el usuario actual admin o editor?
-- ----------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
      from public.profiles
     where id = auth.uid()
       and role in ('admin', 'editor')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
      from public.profiles
     where id = auth.uid()
       and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- POLICIES: categories
-- ----------------------------------------------------------------------------
-- Lectura pública de categorías (necesario para navegación del catálogo).
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories
  for select
  to anon, authenticated
  using (true);

-- Solo staff puede crear/editar/eliminar categorías.
drop policy if exists "categories_staff_write" on public.categories;
create policy "categories_staff_write"
  on public.categories
  for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- POLICIES: products
-- ----------------------------------------------------------------------------
-- Público: solo productos publicados.
drop policy if exists "products_public_read_published" on public.products;
create policy "products_public_read_published"
  on public.products
  for select
  to anon, authenticated
  using (status = 'published');

-- Staff: acceso total (incluye drafts/archived para el dashboard).
drop policy if exists "products_staff_read_all" on public.products;
create policy "products_staff_read_all"
  on public.products
  for select
  to authenticated
  using (public.is_staff());

drop policy if exists "products_staff_write" on public.products;
create policy "products_staff_write"
  on public.products
  for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists "products_staff_update" on public.products;
create policy "products_staff_update"
  on public.products
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- POLICIES: product_images
-- ----------------------------------------------------------------------------
-- Lectura pública SOLO de imágenes de productos publicados.
drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
  on public.product_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
       where p.id = product_images.product_id
         and p.status = 'published'
    )
  );

drop policy if exists "product_images_staff_read_all" on public.product_images;
create policy "product_images_staff_read_all"
  on public.product_images
  for select
  to authenticated
  using (public.is_staff());

drop policy if exists "product_images_staff_write" on public.product_images;
create policy "product_images_staff_write"
  on public.product_images
  for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ----------------------------------------------------------------------------
-- POLICIES: orders & order_items
-- ----------------------------------------------------------------------------
-- Los pedidos se crean y leen exclusivamente vía Service Role (Server Actions
-- / webhooks de Stripe ejecutados en el servidor con la clave de servicio),
-- por lo que NO se conceden permisos a 'anon' ni 'authenticated' para insert.
-- El staff puede consultar y actualizar (gestión de pedidos) desde el dashboard.

drop policy if exists "orders_staff_read" on public.orders;
create policy "orders_staff_read"
  on public.orders
  for select
  to authenticated
  using (public.is_staff());

drop policy if exists "orders_staff_update" on public.orders;
create policy "orders_staff_update"
  on public.orders
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "order_items_staff_read" on public.order_items;
create policy "order_items_staff_read"
  on public.order_items
  for select
  to authenticated
  using (public.is_staff());

-- No se definen policies de insert/delete para anon/authenticated en orders u
-- order_items: el Service Role bypassa RLS y es el único camino de escritura.

-- ----------------------------------------------------------------------------
-- POLICIES: profiles
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Solo admins pueden cambiar roles de otros usuarios.
drop policy if exists "profiles_admin_manage_roles" on public.profiles;
create policy "profiles_admin_manage_roles"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- STORAGE: bucket "products" (imágenes)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Lectura pública del bucket (las imágenes del catálogo son públicas).
drop policy if exists "products_bucket_public_read" on storage.objects;
create policy "products_bucket_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'products');

-- Solo staff puede subir/actualizar/eliminar imágenes.
drop policy if exists "products_bucket_staff_write" on storage.objects;
create policy "products_bucket_staff_write"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'products' and public.is_staff());

drop policy if exists "products_bucket_staff_update" on storage.objects;
create policy "products_bucket_staff_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'products' and public.is_staff())
  with check (bucket_id = 'products' and public.is_staff());

drop policy if exists "products_bucket_staff_delete" on storage.objects;
create policy "products_bucket_staff_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'products' and public.is_staff());

-- ============================================================================
-- SEED: categorías iniciales (alineadas con la colección "Feel Create Repeat")
-- ============================================================================
insert into public.categories (slug, name, description, display_order)
values
  ('obras-originales', 'Obras originales', 'Cuadros y pinturas originales, piezas únicas.', 1),
  ('laminas', 'Láminas', 'Ediciones limitadas en formato lámina.', 2),
  ('esculturas', 'Esculturas', 'Piezas escultóricas de pequeño y mediano formato.', 3)
on conflict (slug) do nothing;
