import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Panel de administración",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  fulfilled: "Enviado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export default async function AdminDashboard() {
  const profile = await getStaffProfile();
  if (!profile) redirect("/admin/login");

  const supabase = await createClient();

  const [products, published, orders, messages] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("orders")
      .select("id, status, customer_email, total_amount, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("contact_messages")
      .select("id, name, organization, email, interest, message, created_at")
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <>
      <h1 className="mb-12 font-display text-3xl font-bold tracking-[0.12em]">Panel</h1>

      <div className="mb-16 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-cream p-7">
          <p className="font-display text-4xl font-bold">{products.count ?? 0}</p>
          <p className="text-eyebrow mt-1">Obras totales</p>
        </div>
        <div className="bg-cream p-7">
          <p className="font-display text-4xl font-bold">{published.count ?? 0}</p>
          <p className="text-eyebrow mt-1">Publicadas</p>
        </div>
        <div className="bg-cream p-7">
          <p className="font-display text-4xl font-bold">{messages.data?.length ?? 0}</p>
          <p className="text-eyebrow mt-1">Mensajes sin leer</p>
        </div>
      </div>

      <section className="mb-16">
        <h2 className="text-eyebrow mb-6">Últimos pedidos</h2>
        {orders.data && orders.data.length > 0 ? (
          <ul className="divide-y divide-border border-y border-border">
            {orders.data.map((order) => (
              <li key={order.id} className="flex flex-wrap items-baseline gap-x-8 gap-y-1 py-4">
                <span className="text-eyebrow w-24">{STATUS_LABELS[order.status]}</span>
                <span className="flex-1 text-sm font-light">{order.customer_email}</span>
                <span className="font-display text-sm tracking-[0.1em]">
                  {formatPrice(order.total_amount, order.currency)}
                </span>
                <time className="text-xs font-light text-mid">
                  {new Date(order.created_at).toLocaleDateString("es-ES")}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-light text-mid">Aún no hay pedidos.</p>
        )}
      </section>

      <section>
        <h2 className="text-eyebrow mb-6">Mensajes de galerías y coleccionistas</h2>
        {messages.data && messages.data.length > 0 ? (
          <ul className="space-y-6">
            {messages.data.map((msg) => (
              <li key={msg.id} className="border border-border p-6">
                <p className="mb-1 font-display text-base font-medium tracking-[0.08em]">
                  {msg.name}
                  {msg.organization && (
                    <span className="font-light text-mid"> — {msg.organization}</span>
                  )}
                </p>
                <p className="mb-3 text-xs font-light text-mid">
                  {msg.email}
                  {msg.interest && ` · ${msg.interest}`} ·{" "}
                  {new Date(msg.created_at).toLocaleDateString("es-ES")}
                </p>
                <p className="text-sm font-light leading-relaxed text-[#555553]">{msg.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-light text-mid">No hay mensajes pendientes.</p>
        )}
      </section>

      <div className="mt-16 flex gap-4">
        <Link href="/admin/productos/nuevo" className="btn-gallery border border-ink bg-ink px-8 py-3 text-cream transition-colors hover:bg-transparent hover:text-ink">
          Nueva obra
        </Link>
      </div>
    </>
  );
}
