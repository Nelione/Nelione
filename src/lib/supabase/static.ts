import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente anónimo SIN cookies, para lecturas públicas del catálogo.
 *
 * Al no tocar cookies(), las páginas que lo usan pueden ser estáticas/ISR
 * (`export const revalidate = N`) — clave para el rendimiento y SEO del
 * catálogo. RLS sigue aplicando: solo ve productos `published`.
 *
 * Para operaciones con sesión de usuario usa lib/supabase/server.ts.
 */
export function createStaticClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
