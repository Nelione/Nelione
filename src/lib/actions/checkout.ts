"use server";

import { redirect } from "next/navigation";
import { readCart } from "@/lib/actions/cart";
import { getProductsByIds } from "@/lib/data/products";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProductImageUrl, getSiteUrl } from "@/lib/utils";

/**
 * Crea la sesión de Stripe Checkout.
 *
 * Seguridad:
 *  - Los precios salen SIEMPRE de la base de datos, nunca del cliente.
 *  - Se valida stock antes de crear la sesión.
 *  - El pedido se crea en estado `pending`; solo el webhook (firmado) lo
 *    pasa a `paid`, lo que dispara el trigger de decremento de stock.
 */
export async function createCheckoutSession(): Promise<void> {
  const cart = await readCart();
  if (cart.length === 0) redirect("/carrito");

  const products = await getProductsByIds(cart.map((i) => i.id));
  const byId = new Map(products.map((p) => [p.id, p]));

  // Validación de disponibilidad y construcción de líneas con precio de BBDD
  const lines: Array<{
    productId: string;
    name: string;
    unitAmount: number;
    quantity: number;
    image?: string;
  }> = [];

  for (const item of cart) {
    const product = byId.get(item.id);
    if (!product) continue; // producto despublicado desde que se añadió
    const available =
      product.stock_quantity === null ? item.qty : Math.min(item.qty, product.stock_quantity);
    if (available < 1) continue;

    const primaryImage = product.product_images[0];
    lines.push({
      productId: product.id,
      name: product.name,
      unitAmount: product.price_amount,
      quantity: product.is_unique ? 1 : available,
      image: primaryImage ? getProductImageUrl(primaryImage.storage_path) : undefined,
    });
  }

  if (lines.length === 0) redirect("/carrito?error=sin-stock");

  const subtotal = lines.reduce((sum, l) => sum + l.unitAmount * l.quantity, 0);

  // 1) Pedido pendiente en BBDD (Service Role: orders no admite escritura pública)
  const supabase = createAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      status: "pending",
      customer_email: "pending@checkout", // se sobreescribe en el webhook con el email real
      subtotal_amount: subtotal,
      shipping_amount: 0, // el envío lo calcula Stripe (shipping_options) y se guarda en webhook
      total_amount: subtotal,
      currency: "EUR",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Error creando pedido:", orderError?.message);
    redirect("/carrito?error=pedido");
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.productId,
      product_name: l.name,
      unit_price_amount: l.unitAmount,
      quantity: l.quantity,
    })),
  );

  if (itemsError) {
    console.error("Error creando líneas de pedido:", itemsError.message);
    redirect("/carrito?error=pedido");
  }

  // 2) Sesión de Stripe Checkout
  const stripe = getStripe();
  const siteUrl = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "es",
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "eur",
        unit_amount: l.unitAmount,
        product_data: {
          name: l.name,
          ...(l.image ? { images: [l.image] } : {}),
        },
      },
    })),
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
    shipping_address_collection: {
      allowed_countries: ["ES", "PT", "FR", "DE", "IT", "BE", "NL", "AT", "IE", "LU"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Envío estándar asegurado",
          type: "fixed_amount",
          fixed_amount: { amount: 1500, currency: "eur" },
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
    ],
    success_url: `${siteUrl}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancelado`,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 min
  });

  // Vinculamos la sesión al pedido para que el webhook lo localice
  await supabase
    .from("orders")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", order.id);

  if (!session.url) redirect("/carrito?error=stripe");
  redirect(session.url);
}
