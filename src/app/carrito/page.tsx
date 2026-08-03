import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { readCart, removeFromCart, updateQuantity } from "@/lib/actions/cart";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { getProductsByIds } from "@/lib/data/products";
import { formatPrice, getProductImageUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  "sin-stock": "Alguna de las obras seleccionadas ya no está disponible.",
  pedido: "No se pudo iniciar el pago. Inténtalo de nuevo.",
  stripe: "Error de conexión con la pasarela de pago. Inténtalo de nuevo.",
};

export default async function CarritoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, cart] = await Promise.all([searchParams, readCart()]);
  const products = await getProductsByIds(cart.map((i) => i.id));
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = cart
    .map((item) => {
      const product = byId.get(item.id);
      return product ? { product, qty: item.qty } : null;
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  const subtotal = items.reduce((sum, i) => sum + i.product.price_amount * i.qty, 0);

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
        <h1 className="mb-6 font-display text-4xl font-bold tracking-[0.12em]">Tu selección</h1>
        <p className="mb-10 text-sm font-light text-mid">Todavía no hay nada aquí.</p>
        <Button asChild variant="outline">
          <Link href="/obras">Ver el catálogo</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 pb-28 pt-24 lg:px-10">
      <h1 className="mb-12 text-center font-display text-4xl font-bold tracking-[0.12em]">
        Tu selección
      </h1>

      {error && ERROR_MESSAGES[error] && (
        <p role="alert" className="mb-8 border border-red-200 bg-red-50 px-5 py-4 text-xs text-red-800">
          {ERROR_MESSAGES[error]}
        </p>
      )}

      <ul className="mb-12 divide-y divide-border border-y border-border">
        {items.map(({ product, qty }) => {
          const image = product.product_images[0];
          const outOfStock = product.stock_quantity !== null && product.stock_quantity < 1;
          const maxQty = product.is_unique
            ? 1
            : Math.min(product.stock_quantity ?? 10, 10);

          return (
            <li key={product.id} className="flex gap-6 py-7">
              <Link
                href={`/obras/${product.category.slug}/${product.slug}`}
                className="relative block size-24 shrink-0 bg-[#e6e0d8] sm:size-28"
              >
                {image && (
                  <Image
                    src={getProductImageUrl(image.storage_path)}
                    alt={image.alt_text ?? product.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <p className="text-eyebrow mb-1">{product.category.name}</p>
                <Link
                  href={`/obras/${product.category.slug}/${product.slug}`}
                  className="mb-1 font-display text-lg font-medium tracking-[0.08em] hover:text-mid"
                >
                  {product.name}
                </Link>
                <p className="text-sm font-light text-mid">
                  {formatPrice(product.price_amount, product.currency)}
                </p>
                {outOfStock && (
                  <p className="mt-1 text-xs text-red-700">Ya no disponible — quítala para continuar.</p>
                )}

                <div className="mt-auto flex items-center gap-6 pt-3">
                  {maxQty > 1 ? (
                    <form action={updateQuantity} className="flex items-center gap-2">
                      <input type="hidden" name="productId" value={product.id} />
                      <label htmlFor={`qty-${product.id}`} className="text-eyebrow">
                        Cantidad
                      </label>
                      <select
                        id={`qty-${product.id}`}
                        name="quantity"
                        defaultValue={qty}
                        className="border-b border-border bg-transparent py-1 text-sm font-light focus:border-ink focus:outline-none"
                      >
                        {Array.from({ length: maxQty }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" variant="ghost" size="sm">
                        Actualizar
                      </Button>
                    </form>
                  ) : (
                    <p className="text-xs font-light text-mid">Pieza única</p>
                  )}

                  <form action={removeFromCart}>
                    <input type="hidden" name="productId" value={product.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Quitar
                    </Button>
                  </form>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col items-end gap-6">
        <div className="flex w-full max-w-xs items-baseline justify-between">
          <span className="text-eyebrow">Subtotal</span>
          <span className="font-display text-2xl font-medium tracking-[0.1em]">
            {formatPrice(subtotal)}
          </span>
        </div>
        <p className="text-xs font-light text-mid">
          Envío e impuestos se calculan en el siguiente paso.
        </p>
        <form action={createCheckoutSession} className="w-full max-w-xs">
          <Button type="submit" className="w-full">
            Finalizar compra
          </Button>
        </form>
      </div>
    </section>
  );
}
