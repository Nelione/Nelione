import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook de Stripe — única vía por la que un pedido pasa a `paid`.
 *
 * - Verificación de firma obligatoria (STRIPE_WEBHOOK_SECRET).
 * - Idempotente: si el pedido ya está `paid`, no hace nada.
 * - El trigger `decrement_stock_on_paid_order` de Postgres se encarga del
 *   stock y de archivar piezas únicas al producirse el UPDATE a `paid`.
 *
 * Eventos a configurar en Stripe Dashboard:
 *   checkout.session.completed
 *   checkout.session.expired
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET no configurado");
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Firma de webhook inválida:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (!orderId) break;

      const { data: existing } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .maybeSingle();

      // Idempotencia: Stripe puede reintentar la entrega del evento
      if (!existing || existing.status === "paid") break;

      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
          customer_email: session.customer_details?.email ?? "desconocido",
          customer_name: session.customer_details?.name ?? null,
          shipping_address: session.collected_information?.shipping_details
            ? JSON.parse(JSON.stringify(session.collected_information.shipping_details))
            : null,
          billing_address: session.customer_details?.address
            ? JSON.parse(JSON.stringify(session.customer_details.address))
            : null,
          shipping_amount: session.shipping_cost?.amount_total ?? 0,
          total_amount: session.amount_total ?? 0,
        })
        .eq("id", orderId);

      if (error) {
        console.error("Error actualizando pedido a paid:", error.message);
        // 500 → Stripe reintentará
        return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (!orderId) break;

      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("status", "pending"); // nunca cancelar un pedido ya pagado
      break;
    }

    default:
      // Evento no manejado — aceptamos para que Stripe no reintente
      break;
  }

  return NextResponse.json({ received: true });
}
