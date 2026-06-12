import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente administrativo con la Service Role Key.
 *
 * ⚠️ BYPASSA ROW LEVEL SECURITY POR COMPLETO.
 *
 * Uso EXCLUSIVO en:
 *  - Route Handler del webhook de Stripe (creación/actualización de orders).
 *  - Server Actions del dashboard de administración, tras verificar
 *    explícitamente `is_staff()` / `is_admin()` con el cliente de sesión.
 *
 * El import "server-only" provoca un error de build si este módulo se
 * importa accidentalmente desde código que pueda acabar en el bundle del
 * cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
