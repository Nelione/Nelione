import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form-fields";
import {
  deleteProduct,
  deleteProductImage,
  setPrimaryImage,
  updateProduct,
  uploadProductImage,
} from "@/lib/actions/admin/products";
import { getStaffProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { getProductImageUrl } from "@/lib/utils";
import type { Product, ProductImage } from "@/types/database";

export const metadata: Metadata = {
  title: "Editar obra",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await getStaffProfile();
  if (!profile) redirect("/admin/login");

  const [{ id }, { error }] = await Promise.all([params, searchParams]);

  const supabase = await createClient();
  const [{ data: product }, { data: categories }, { data: images }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("display_order"),
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("is_primary", { ascending: false })
      .order("display_order"),
  ]);

  if (!product) notFound();

  const updateAction = updateProduct.bind(null, product.id);

  return (
    <>
      <h1 className="mb-10 font-display text-3xl font-bold tracking-[0.12em]">
        Editar: {(product as Product).name}
      </h1>

      {error === "vendida" && (
        <p role="alert" className="mb-8 border border-red-200 bg-red-50 px-5 py-4 text-xs text-red-800">
          No se puede eliminar una obra con pedidos asociados. Archívala en su lugar.
        </p>
      )}

      <ProductForm
        action={updateAction}
        categories={categories ?? []}
        product={product as Product}
        submitLabel="Guardar cambios"
      />

      {/* ── Imágenes ── */}
      <section className="mt-20 max-w-3xl border-t border-border pt-12">
        <h2 className="text-eyebrow mb-8">Imágenes</h2>

        {images && images.length > 0 && (
          <ul className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {(images as ProductImage[]).map((img) => (
              <li key={img.id} className="space-y-3">
                <div className="relative aspect-square bg-[#e6e0d8]">
                  <Image
                    src={getProductImageUrl(img.storage_path)}
                    alt={img.alt_text ?? ""}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                  {img.is_primary && (
                    <span className="text-eyebrow absolute left-2 top-2 bg-cream px-2 py-1">
                      Principal
                    </span>
                  )}
                </div>
                <div className="flex gap-4">
                  {!img.is_primary && (
                    <form action={setPrimaryImage}>
                      <input type="hidden" name="imageId" value={img.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Hacer principal
                      </Button>
                    </form>
                  )}
                  <form action={deleteProductImage}>
                    <input type="hidden" name="imageId" value={img.id} />
                    <input type="hidden" name="productId" value={product.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Eliminar
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form action={uploadProductImage} className="max-w-md space-y-6">
          <input type="hidden" name="productId" value={product.id} />
          <div>
            <Label htmlFor="img-file">Nueva imagen (JPG/PNG/WebP/AVIF, máx. 4 MB)</Label>
            <Input id="img-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
          </div>
          <div>
            <Label htmlFor="img-alt">Texto alternativo (accesibilidad y SEO)</Label>
            <Input
              id="img-alt"
              name="altText"
              placeholder="Vista frontal de la obra sobre fondo neutro"
            />
          </div>
          <Button type="submit" variant="outline">
            Subir imagen
          </Button>
        </form>
      </section>

      {/* ── Zona peligrosa ── */}
      <section className="mt-20 max-w-3xl border-t border-border pt-12">
        <h2 className="text-eyebrow mb-6">Eliminar obra</h2>
        <p className="mb-6 text-sm font-light text-mid">
          Borra la obra y sus imágenes de forma permanente. Si tiene pedidos asociados no se
          podrá eliminar (archívala en su lugar).
        </p>
        <form action={deleteProduct}>
          <input type="hidden" name="productId" value={product.id} />
          <Button type="submit" variant="destructive">
            Eliminar definitivamente
          </Button>
        </form>
      </section>
    </>
  );
}
