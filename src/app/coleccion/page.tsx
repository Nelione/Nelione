import type { Metadata } from "next";
import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts } from "@/lib/data/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Colección actual — Feel Create Repeat",
  description:
    "Feel Create Repeat: una colección sobre los ciclos del cuerpo y la mente. Pintura, escultura y lámina en un mismo diálogo.",
  alternates: { canonical: "/coleccion" },
};

export default async function ColeccionPage() {
  const featured = await getFeaturedProducts(6);

  return (
    <>
      <section className="mx-auto max-w-xl px-8 pb-20 pt-28 text-center">
        <p className="text-eyebrow mb-7">2024 — 2025</p>
        <h1 className="mb-8 font-display text-[clamp(2.8rem,7vw,4.5rem)] font-bold leading-[1.05] tracking-[0.1em]">
          Feel
          <br />
          Create
          <br />
          Repeat
        </h1>
        <div className="mx-auto mb-8 h-px w-8 bg-sand" aria-hidden="true" />
        <p className="mb-12 text-sm font-light leading-[1.95] text-[#555553]">
          Una colección sobre los ciclos del cuerpo y la mente. Sentir, crear, repetir — como
          respirar, como vivir.
          <br />
          <br />
          Cada obra es un instante atrapado en ese bucle: el rosa que regresa, la forma que muta
          sin perder su esencia. Pintura, escultura y lámina conviven en un mismo diálogo, íntimo
          y universal.
        </p>
        <Button asChild>
          <Link href="/obras">Ver la colección</Link>
        </Button>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
          <h2 className="text-eyebrow mb-12 text-center">Obras destacadas</h2>
          <ProductGrid products={featured} />
        </section>
      )}
    </>
  );
}
