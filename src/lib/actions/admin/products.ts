"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  productSchema,
} from "@/lib/validation/product";

export interface AdminFormState {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category_id: formData.get("category_id"),
    product_type: formData.get("product_type"),
    status: formData.get("status"),
    price_eur: formData.get("price_eur"),
    stock_quantity: formData.get("stock_quantity") ?? "",
    is_unique: formData.get("is_unique") === "on",
    width_cm: formData.get("width_cm") ?? "",
    height_cm: formData.get("height_cm") ?? "",
    depth_cm: formData.get("depth_cm") ?? "",
    medium: formData.get("medium") ?? "",
    edition_info: formData.get("edition_info") ?? "",
    year_created: formData.get("year_created") ?? "",
    description: formData.get("description") ?? "",
    featured: formData.get("featured") === "on",
    meta_title: formData.get("meta_title") ?? "",
    meta_description: formData.get("meta_description") ?? "",
  });
}

function toFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function toRow(data: ReturnType<typeof productSchema.parse>) {
  const { price_eur, ...rest } = data;
  return {
    ...rest,
    price_amount: Math.round(price_eur * 100),
    currency: "EUR",
    // Coherencia pieza única ↔ stock
    stock_quantity: data.is_unique ? Math.min(data.stock_quantity ?? 1, 1) : data.stock_quantity,
  };
}

function revalidateCatalog(categorySlug?: string, productSlug?: string) {
  revalidatePath("/obras");
  revalidatePath("/coleccion");
  if (categorySlug) {
    revalidatePath(`/obras/${categorySlug}`);
    if (productSlug) revalidatePath(`/obras/${categorySlug}/${productSlug}`);
  }
  revalidatePath("/admin/productos");
}

// ----------------------------------------------------------------------------
// CREATE
// ----------------------------------------------------------------------------
export async function createProduct(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireStaff();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient(); // RLS staff policies aplican
  const { data, error } = await supabase
    .from("products")
    .insert(toRow(parsed.data))
    .select("id, slug, category:categories(slug)")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una obra con ese slug." };
    return { error: `Error al guardar: ${error.message}` };
  }

  revalidateCatalog((data.category as unknown as { slug: string })?.slug, data.slug);
  redirect(`/admin/productos/${data.id}`);
}

// ----------------------------------------------------------------------------
// UPDATE
// ----------------------------------------------------------------------------
export async function updateProduct(
  productId: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireStaff();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: "Revisa los campos marcados.", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update(toRow(parsed.data))
    .eq("id", productId)
    .select("slug, category:categories(slug)")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una obra con ese slug." };
    return { error: `Error al guardar: ${error.message}` };
  }

  revalidateCatalog((data.category as unknown as { slug: string })?.slug, data.slug);
  return {};
}

// ----------------------------------------------------------------------------
// DELETE
// ----------------------------------------------------------------------------
export async function deleteProduct(formData: FormData): Promise<void> {
  await requireStaff();
  const id = formData.get("productId");
  if (typeof id !== "string") return;

  const supabase = await createClient();

  // Borrar también los archivos del bucket
  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id);

  if (images && images.length > 0) {
    await supabase.storage.from("products").remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    // FK con order_items (restrict): no se pueden borrar obras vendidas
    redirect(`/admin/productos/${id}?error=vendida`);
  }

  revalidateCatalog();
  redirect("/admin/productos");
}

// ----------------------------------------------------------------------------
// IMÁGENES
// ----------------------------------------------------------------------------
export async function uploadProductImage(formData: FormData): Promise<void> {
  await requireStaff();

  const productId = formData.get("productId");
  const file = formData.get("file");
  const altText = formData.get("altText");

  if (typeof productId !== "string" || !(file instanceof File) || file.size === 0) return;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) return;

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

  if (uploadError) {
    console.error("Error subiendo imagen:", uploadError.message);
    return;
  }

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: path,
    alt_text: typeof altText === "string" && altText.trim() ? altText.trim() : null,
    display_order: count ?? 0,
    is_primary: (count ?? 0) === 0, // la primera imagen es la principal
  });

  revalidateCatalog();
  revalidatePath(`/admin/productos/${productId}`);
}

export async function deleteProductImage(formData: FormData): Promise<void> {
  await requireStaff();
  const imageId = formData.get("imageId");
  const productId = formData.get("productId");
  if (typeof imageId !== "string" || typeof productId !== "string") return;

  const supabase = await createClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId)
    .maybeSingle();

  if (image) {
    await supabase.storage.from("products").remove([image.storage_path]);
    await supabase.from("product_images").delete().eq("id", imageId);
  }

  revalidateCatalog();
  revalidatePath(`/admin/productos/${productId}`);
}

export async function setPrimaryImage(formData: FormData): Promise<void> {
  await requireStaff();
  const imageId = formData.get("imageId");
  const productId = formData.get("productId");
  if (typeof imageId !== "string" || typeof productId !== "string") return;

  const supabase = await createClient();
  // El trigger enforce_single_primary_image desmarca el resto
  await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);

  revalidateCatalog();
  revalidatePath(`/admin/productos/${productId}`);
}
