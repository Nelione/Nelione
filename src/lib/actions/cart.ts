"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

/**
 * Carrito persistente en cookie httpOnly.
 *
 * Decisión de seguridad: la cookie guarda SOLO { id, qty }. Los precios se
 * leen siempre de la base de datos en el servidor (carrito y checkout), por
 * lo que manipular la cookie no permite alterar importes.
 *
 * Decisión de arquitectura: al vivir en cookie, el carrito se puede leer en
 * Server Components → la página del carrito y el contador del nav son RSC,
 * sin Context API ni estado global de cliente.
 */

const CART_COOKIE = "nelione_cart";
const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

const cartItemSchema = z.object({
  id: z.string().uuid(),
  qty: z.number().int().min(1).max(10),
});
const cartSchema = z.array(cartItemSchema).max(50);

export type CartItem = z.infer<typeof cartItemSchema>;

export async function readCart(): Promise<CartItem[]> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    return cartSchema.parse(JSON.parse(raw));
  } catch {
    return []; // cookie corrupta o manipulada → carrito vacío
  }
}

async function writeCart(items: CartItem[]): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, JSON.stringify(items), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
}

export async function addToCart(formData: FormData): Promise<void> {
  const parsed = cartItemSchema.safeParse({
    id: formData.get("productId"),
    qty: Number(formData.get("quantity") ?? 1),
  });
  if (!parsed.success) return;

  const cart = await readCart();
  const existing = cart.find((i) => i.id === parsed.data.id);
  const next = existing
    ? cart.map((i) =>
        i.id === parsed.data.id ? { ...i, qty: Math.min(i.qty + parsed.data.qty, 10) } : i,
      )
    : [...cart, parsed.data];

  await writeCart(next);
  revalidatePath("/", "layout"); // refresca el contador del nav en todo el sitio
}

export async function removeFromCart(formData: FormData): Promise<void> {
  const id = z.string().uuid().safeParse(formData.get("productId"));
  if (!id.success) return;

  const cart = await readCart();
  await writeCart(cart.filter((i) => i.id !== id.data));
  revalidatePath("/", "layout");
}

export async function updateQuantity(formData: FormData): Promise<void> {
  const parsed = cartItemSchema.safeParse({
    id: formData.get("productId"),
    qty: Number(formData.get("quantity")),
  });
  if (!parsed.success) return;

  const cart = await readCart();
  await writeCart(cart.map((i) => (i.id === parsed.data.id ? parsed.data : i)));
  revalidatePath("/", "layout");
}

export async function clearCart(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
  revalidatePath("/", "layout");
}
