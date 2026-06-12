-- ============================================================================
-- NELIONE — Migración 2: mensajes de contacto (galerías y coleccionistas)
-- ============================================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  email text not null,
  interest text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.contact_messages is
  'Mensajes del formulario para galerías y coleccionistas. Escritura solo vía Service Role.';

create index if not exists idx_contact_messages_created_at
  on public.contact_messages (created_at desc);
create index if not exists idx_contact_messages_unread
  on public.contact_messages (is_read)
  where is_read = false;

alter table public.contact_messages enable row level security;

-- Sin policy de INSERT para anon/authenticated: la Server Action valida con
-- Zod y escribe con el Service Role. Esto evita spam directo contra la API
-- pública de Supabase (PostgREST).

drop policy if exists "contact_messages_staff_read" on public.contact_messages;
create policy "contact_messages_staff_read"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_staff());

drop policy if exists "contact_messages_staff_update" on public.contact_messages;
create policy "contact_messages_staff_update"
  on public.contact_messages
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());
