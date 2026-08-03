"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validation/product";
import type { AdminFormState } from "./products";

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    display_order: formData.get("display_order") ?? 0,
  });
}

function revalidateCategories() {
  revalidatePath("/obras", "layout");
  revalidatePath("/admin/categorias");
}

export async function createCategory(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireStaff();
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert(parsed.data);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una categoría con ese slug." };
    return { error: `Error al guardar: ${error.message}` };
  }

  revalidateCategories();
  return {};
}

export async function updateCategory(
  categoryId: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireStaff();
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").update(parsed.data).eq("id", categoryId);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una categoría con ese slug." };
    return { error: `Error al guardar: ${error.message}` };
  }

  revalidateCategories();
  return {};
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireStaff();
  const id = formData.get("categoryId");
  if (typeof id !== "string") return;

  const supabase = await createClient();
  // FK restrict: fallará si la categoría tiene productos — comportamiento deseado.
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("No se pudo borrar la categoría (¿tiene productos?):", error.message);
  }

  revalidateCategories();
}
