import "server-only";
import Stripe from "stripe";

/**
 * Cliente Stripe — solo servidor.
 *
 * Instancia perezosa (lazy) para que el build no falle si la variable
 * de entorno no está presente en tiempo de compilación (p.ej. CI sin
 * secretos), pero sí falle de forma clara en tiempo de ejecución.
 */
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Falta STRIPE_SECRET_KEY en las variables de entorno.");
    }
    stripeInstance = new Stripe(key, {
      // Fijamos la versión de API para evitar breaking changes silenciosos.
      apiVersion: "2025-04-30.basil",
      typescript: true,
      appInfo: {
        name: "Nelione",
        url: "https://nelione.com",
      },
    });
  }
  return stripeInstance;
}
