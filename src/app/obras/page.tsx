import type { Metadata } from "next";
import { CategoryFilters } from "@/components/catalog/category-filters";
import { ProductGrid } from "@/components/catalog/product-card";
import { getCategories } from "@/lib/data/categories";
import { getPublishedProducts } from "@/lib/data/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Obras — Originales, láminas y esculturas",
  description:
    "Catálogo completo de Nelione: cuadros originales, láminas de edición limitada y esculturas de la colección Feel Create Repeat.",
  alternates: { canonical: "/obras" },
};

export default async function ObrasPage() {
  const [categories, products] = await Promise.all([getCategories(), getPublishedProducts()]);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-28 pt-24 lg:px-10">
      <header className="mb-12 text-center">
        <h1 className="mb-3 font-display text-4xl font-bold tracking-[0.12em]">
          Feel Create Repeat
        </h1>
        <p className="text-eyebrow">Obras originales · Láminas · Esculturas</p>
      </header>

      <CategoryFilters categories={categories} />
      <ProductGrid products={products} />
    </section>
  );
}
