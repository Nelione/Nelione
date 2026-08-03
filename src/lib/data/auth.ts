import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/**
 * Devuelve el perfil del usuario autenticado si es staff (admin/editor).
 * null si no hay sesión o el rol no es de staff.
 *
 * Autorización junto a los datos: cada Server Action de admin la invoca,
 * sin confiar solo en el middleware (defensa en profundidad; RLS es la
 * tercera capa).
 */
export async function getStaffProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "admin" && profile.role !== "editor")) return null;
  return profile;
}

export async function requireStaff(): Promise<Profile> {
  const profile = await getStaffProfile();
  if (!profile) throw new Error("No autorizado.");
  return profile;
}
