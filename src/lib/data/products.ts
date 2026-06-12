import { createStaticClient } from "@/lib/supabase/static";
import type { ProductWithRelations } from "@/types/database";

const PRODUCT_WITH_RELATIONS = `
  *,
  category:categories (*),
  product_images (*)
` as const;

function sortImages(p: ProductWithRelations): ProductWithRelations {
  return {
    ...p,
    product_images: [...p.product_images].sort(
      (a, b) =>
        Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order,
    ),
  };
}

/** Catálogo público completo (solo published por RLS). */
export async function getPublishedProducts(): Promise<ProductWithRelations[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_RELATIONS)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al cargar el catálogo: ${error.message}`);
  return (data as unknown as ProductWithRelations[]).map(sortImages);
}

/** Productos de una categoría por slug de categoría. */
export async function getProductsByCategorySlug(
  categorySlug: string,
): Promise<ProductWithRelations[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("products")
    .select(`${PRODUCT_WITH_RELATIONS}`)
    .eq("category.slug", categorySlug)
    .not("category", "is", null)
    .order("display_order", { ascending: true });

  if (error) throw new Error(`Error al cargar la categoría: ${error.message}`);
  return (data as unknown as ProductWithRelations[]).map(sortImages);
}

/** Detalle de obra por slug. */
export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_RELATIONS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Error al cargar la obra: ${error.message}`);
  return data ? sortImages(data as unknown as ProductWithRelations) : null;
}

/** Obras destacadas para la página de colección. */
export async function getFeaturedProducts(limit = 6): Promise<ProductWithRelations[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_RELATIONS)
    .eq("featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Error al cargar destacados: ${error.message}`);
  return (data as unknown as ProductWithRelations[]).map(sortImages);
}

/** Para el carrito y checkout: productos por lista de ids (precio del servidor). */
export async function getProductsByIds(ids: string[]): Promise<ProductWithRelations[]> {
  if (ids.length === 0) return [];
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_RELATIONS)
    .in("id", ids);

  if (error) throw new Error(`Error al cargar productos del carrito: ${error.message}`);
  return (data as unknown as ProductWithRelations[]).map(sortImages);
}
