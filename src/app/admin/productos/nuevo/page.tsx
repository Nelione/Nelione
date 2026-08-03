import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "@/lib/actions/admin/products";
import { getStaffProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Nueva obra",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const profile = await getStaffProfile();
  if (!profile) redirect("/admin/login");

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (
    <>
      <h1 className="mb-10 font-display text-3xl font-bold tracking-[0.12em]">Nueva obra</h1>
      <p className="mb-10 max-w-xl text-sm font-light text-mid">
        Guarda primero la ficha; después podrás subir las imágenes desde la página de edición.
      </p>
      <ProductForm
        action={createProduct}
        categories={categories ?? []}
        submitLabel="Crear obra"
      />
    </>
  );
}
