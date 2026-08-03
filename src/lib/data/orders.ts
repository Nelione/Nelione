import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem } from "@/types/database";

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

/**
 * Lectura de pedido por sesión de Stripe — usada SOLO por la página de
 * confirmación, que recibe el session_id desde la redirección de Stripe.
 * Server-only: nunca expuesta al cliente.
 */
export async function getOrderByCheckoutSession(
  sessionId: string,
): Promise<OrderWithItems | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items (*)")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error) {
    console.error("Error cargando pedido:", error.message);
    return null;
  }
  return data as OrderWithItems | null;
}
