import Link from "next/link";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { getStaffProfile } from "@/lib/data/auth";

/**
 * Layout del área privada.
 * El middleware ya exige sesión; aquí se verifica el ROL (staff) contra la
 * base de datos. Un usuario autenticado sin rol de staff ve el aviso de
 * acceso restringido (su perfil existe pero con rol insuficiente solo si
 * un admin se lo retira; por defecto handle_new_user asigna 'editor' —
 * en producción, desactiva el registro público en Supabase Auth).
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getStaffProfile();

  // /admin/login se renderiza dentro de este layout sin perfil
  if (!profile) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 lg:px-10">
      <div className="mb-12 flex flex-wrap items-center justify-between gap-6 border-b border-border pb-6">
        <nav aria-label="Administración" className="flex flex-wrap gap-7">
          <Link href="/admin" className="btn-gallery text-ink hover:text-mid">
            Panel
          </Link>
          <Link href="/admin/productos" className="btn-gallery text-ink hover:text-mid">
            Obras
          </Link>
          <Link href="/admin/categorias" className="btn-gallery text-ink hover:text-mid">
            Categorías
          </Link>
        </nav>
        <div className="flex items-center gap-5">
          <span className="text-eyebrow">{profile.full_name ?? "Staff"} · {profile.role}</span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
