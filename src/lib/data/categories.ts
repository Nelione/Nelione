import { createStaticClient } from "@/lib/supabase/static";
import type { Category } from "@/types/database";

export async function getCategories(): Promise<Category[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw new Error(`Error al cargar categorías: ${error.message}`);
  return data ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Error al cargar la categoría: ${error.message}`);
  return data;
}
