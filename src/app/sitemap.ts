import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/data/categories";
import { getPublishedProducts } from "@/lib/data/products";
import { getSiteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/coleccion`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/obras`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/sobre-el-artista`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/galerias`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const [categories, products] = await Promise.all([getCategories(), getPublishedProducts()]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/obras/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/obras/${p.category.slug}/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
