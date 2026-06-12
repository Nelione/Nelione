import Image from "next/image";
import Link from "next/link";
import { formatDimensions, formatPrice, getProductImageUrl } from "@/lib/utils";
import type { ProductWithRelations } from "@/types/database";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = product.product_images[0];
  const dims = formatDimensions(product);
  const soldOut = product.stock_quantity === 0;

  return (
    <article>
      <Link href={`/obras/${product.category.slug}/${product.slug}`} className="group block">
        <div className="relative mb-5 aspect-[4/5] overflow-hidden bg-[#e6e0d8]">
          {image ? (
            <Image
              src={getProductImageUrl(image.storage_path)}
              alt={image.alt_text ?? product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="text-eyebrow text-sand">Sin imagen</span>
            </div>
          )}
          {soldOut && (
            <span className="text-eyebrow absolute left-4 top-4 bg-cream px-3 py-1.5 text-ink">
              Vendida
            </span>
          )}
        </div>

        <p className="text-eyebrow mb-1">{product.category.name}</p>
        <h3 className="mb-1 font-display text-xl font-medium tracking-[0.08em]">
          {product.name}
        </h3>
        {(dims || product.edition_info) && (
          <p className="mb-3 text-xs font-light text-mid">
            {[dims, product.edition_info].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="font-display text-sm font-medium tracking-[0.12em]">
          {formatPrice(product.price_amount, product.currency)}
        </p>
      </Link>
    </article>
  );
}

export function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  if (products.length === 0) {
    return (
      <p className="py-24 text-center text-sm font-light text-mid">
        No hay obras disponibles en esta sección por el momento.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
