import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnSuccess } from "@/components/cart/clear-cart-on-success";
import { Button } from "@/components/ui/button";
import { getOrderByCheckoutSession } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Compra confirmada",
  robots: { index: false },
};

export default async function ExitoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) notFound();

  const order = await getOrderByCheckoutSession(session_id);
  if (!order) notFound();

  // El webhook puede tardar unos segundos en llegar; pending aquí es normal.
  const confirmed = order.status === "paid" || order.status === "fulfilled";

  return (
    <section className="mx-auto max-w-xl px-8 pb-28 pt-28 text-center">
      <ClearCartOnSuccess />

      <p className="text-eyebrow mb-7">{confirmed ? "Pedido confirmado" : "Procesando pago"}</p>
      <h1 className="mb-8 font-display text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.05] tracking-[0.1em]">
        Gracias
      </h1>
      <div className="mx-auto mb-8 h-px w-8 bg-sand" aria-hidden="true" />

      <p className="mb-12 text-sm font-light leading-[1.95] text-[#555553]">
        {confirmed ? (
          <>
            Tu compra está confirmada. Recibirás un correo de Stripe con el recibo
            {order.customer_email && order.customer_email !== "pending@checkout" ? (
              <> en <span className="text-ink">{order.customer_email}</span></>
            ) : null}
            . Cada obra se embala individualmente y se envía asegurada; te escribiré
            personalmente con los detalles del envío.
          </>
        ) : (
          <>
            Estamos confirmando tu pago con la pasarela. Recibirás el recibo por correo en
            unos minutos. Si no llega, escríbeme desde la sección de contacto.
          </>
        )}
      </p>

      <ul className="mb-10 divide-y divide-border border-y border-border text-left">
        {order.order_items.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between py-4">
            <span className="text-sm font-light">
              {item.product_name}
              {item.quantity > 1 && <span className="text-mid"> × {item.quantity}</span>}
            </span>
            <span className="font-display text-sm tracking-[0.1em]">
              {formatPrice(item.unit_price_amount * item.quantity, order.currency)}
            </span>
          </li>
        ))}
        {order.shipping_amount > 0 && (
          <li className="flex items-baseline justify-between py-4">
            <span className="text-sm font-light text-mid">Envío</span>
            <span className="font-display text-sm tracking-[0.1em]">
              {formatPrice(order.shipping_amount, order.currency)}
            </span>
          </li>
        )}
        <li className="flex items-baseline justify-between py-4">
          <span className="text-eyebrow">Total</span>
          <span className="font-display text-xl font-medium tracking-[0.1em]">
            {formatPrice(order.total_amount, order.currency)}
          </span>
        </li>
      </ul>

      <Button asChild variant="outline">
        <Link href="/obras">Seguir explorando</Link>
      </Button>
    </section>
  );
}
