import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";
import { getProductBySlug, getPublishedProducts } from "@/lib/data/products";
import {
  formatDimensions,
  formatPrice,
  getProductImageUrl,
  getSiteUrl,
} from "@/lib/utils";

export const revalidate = 300;

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((p) => ({ category: p.category.slug, slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = product.product_images[0];

  return {
    title: product.meta_title ?? `${product.name} — ${product.category.name}`,
    description:
      product.meta_description ??
      product.description?.slice(0, 155) ??
      `${product.name}, ${product.category.name.toLowerCase()} de Nelione.`,
    alternates: { canonical: `/obras/${product.category.slug}/${product.slug}` },
    openGraph: image
      ? { images: [{ url: getProductImageUrl(image.storage_path), alt: product.name }] }
      : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { category: categorySlug, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.category.slug !== categorySlug) notFound();

  const dims = formatDimensions(product);
  const inStock = product.stock_quantity === null || product.stock_quantity > 0;
  const [mainImage, ...restImages] = product.product_images;

  // Datos estructurados Schema.org — Product + VisualArtwork
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.product_images.map((img) => getProductImageUrl(img.storage_path)),
    url: `${getSiteUrl()}/obras/${product.category.slug}/${product.slug}`,
    category: product.category.name,
    brand: { "@type": "Person", name: "Nelione" },
    offers: {
      "@type": "Offer",
      price: (product.price_amount / 100).toFixed(2),
      priceCurrency: product.currency,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      url: `${getSiteUrl()}/obras/${product.category.slug}/${product.slug}`,
    },
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pb-28 pt-24 lg:px-10">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD generado en servidor a partir de datos propios
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[3fr_2fr]">
        {/* Galería de imágenes */}
        <div className="space-y-6">
          <div className="relative aspect-[4/5] bg-[#e6e0d8]">
            {mainImage ? (
              <Image
                src={getProductImageUrl(mainImage.storage_path)}
                alt={mainImage.alt_text ?? product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span className="text-eyebrow text-sand">Imagen próximamente</span>
              </div>
            )}
          </div>
          {restImages.length > 0 && (
            <div className="grid grid-cols-2 gap-6">
              {restImages.map((img) => (
                <div key={img.id} className="relative aspect-square bg-[#e6e0d8]">
                  <Image
                    src={getProductImageUrl(img.storage_path)}
                    alt={img.alt_text ?? product.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 30vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ficha de la obra */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-eyebrow mb-3">{product.category.name}</p>
          <h1 className="mb-4 font-display text-4xl font-bold tracking-[0.1em]">
            {product.name}
          </h1>

          <dl className="mb-8 space-y-1.5 text-sm font-light text-mid">
            {product.year_created && (
              <div>
                <dt className="sr-only">Año</dt>
                <dd>{product.year_created}</dd>
              </div>
            )}
            {product.medium && (
              <div>
                <dt className="sr-only">Técnica</dt>
                <dd>{product.medium}</dd>
              </div>
            )}
            {dims && (
              <div>
                <dt className="sr-only">Dimensiones</dt>
                <dd>{dims}</dd>
              </div>
            )}
            {product.edition_info && (
              <div>
                <dt className="sr-only">Edición</dt>
                <dd>{product.edition_info}</dd>
              </div>
            )}
          </dl>

          {product.description && (
            <p className="mb-10 text-sm font-light leading-[1.9] text-[#555553]">
              {product.description}
            </p>
          )}

          <p className="mb-8 font-display text-2xl font-medium tracking-[0.1em]">
            {formatPrice(product.price_amount, product.currency)}
          </p>

          {inStock ? (
            <form action={addToCart}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value="1" />
              <Button type="submit" className="w-full sm:w-auto">
                Añadir al carrito
              </Button>
            </form>
          ) : (
            <p className="btn-gallery inline-block border border-border px-8 py-3 text-mid">
              Obra vendida
            </p>
          )}

          {product.is_unique && inStock && (
            <p className="mt-5 text-xs font-light text-mid">
              Pieza única. Se entrega con certificado de autenticidad firmado.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
