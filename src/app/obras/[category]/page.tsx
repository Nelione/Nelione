import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryFilters } from "@/components/catalog/category-filters";
import { ProductGrid } from "@/components/catalog/product-card";
import { getCategories, getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategorySlug } from "@/lib/data/products";

export const revalidate = 300;

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description:
      category.description ??
      `${category.name} de Nelione — colección Feel Create Repeat.`,
    alternates: { canonical: `/obras/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const [categories, category, products] = await Promise.all([
    getCategories(),
    getCategoryBySlug(slug),
    getProductsByCategorySlug(slug),
  ]);

  if (!category) notFound();

  return (
    <section className="mx-auto max-w-7xl px-6 pb-28 pt-24 lg:px-10">
      <header className="mb-12 text-center">
        <h1 className="mb-3 font-display text-4xl font-bold tracking-[0.12em]">
          {category.name}
        </h1>
        {category.description && (
          <p className="mx-auto max-w-md text-sm font-light text-mid">{category.description}</p>
        )}
      </header>

      <CategoryFilters categories={categories} active={category.slug} />
      <ProductGrid products={products} />
    </section>
  );
}
