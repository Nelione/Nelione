import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 * Usa la clave anon — respeta RLS. El usuario autenticado se resuelve a
 * partir de las cookies de sesión.
 *
 * IMPORTANTE: en Server Components (render de solo lectura) `cookies().set`
 * lanzará si se llama fuera de un Server Action / Route Handler. El bloque
 * try/catch silencioso es el patrón recomendado por Supabase para este caso:
 * el middleware se encarga de refrescar la sesión, por lo que el fallo aquí
 * es inofensivo.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Se puede ignorar si se llama desde un Server Component.
            // El middleware refresca las cookies de sesión.
          }
        },
      },
    },
  );
}
