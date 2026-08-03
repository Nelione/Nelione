import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gestión de obras",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  archived: "Archivada",
};

export default async function AdminProductsPage() {
  const profile = await getStaffProfile();
  if (!profile) redirect("/admin/login");

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, status, price_amount, currency, stock_quantity, is_unique, category:categories(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold tracking-[0.12em]">Obras</h1>
        <Link
          href="/admin/productos/nuevo"
          className="btn-gallery border border-ink bg-ink px-6 py-2.5 text-cream transition-colors hover:bg-transparent hover:text-ink"
        >
          Nueva obra
        </Link>
      </div>

      {products && products.length > 0 ? (
        <ul className="divide-y divide-border border-y border-border">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/productos/${p.id}`}
                className="flex flex-wrap items-baseline gap-x-8 gap-y-1 py-4 transition-colors hover:bg-border/30"
              >
                <span className="text-eyebrow w-24">{STATUS_LABELS[p.status]}</span>
                <span className="flex-1 font-display text-base font-medium tracking-[0.06em]">
                  {p.name}
                </span>
                <span className="text-xs font-light text-mid">
                  {(p.category as unknown as { name: string })?.name}
                </span>
                <span className="text-xs font-light text-mid">
                  {p.is_unique
                    ? "Pieza única"
                    : p.stock_quantity === null
                      ? "Sin límite"
                      : `Stock: ${p.stock_quantity}`}
                </span>
                <span className="font-display text-sm tracking-[0.1em]">
                  {formatPrice(p.price_amount, p.currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-light text-mid">
          Aún no hay obras. Crea la primera con "Nueva obra".
        </p>
      )}
    </>
  );
}
