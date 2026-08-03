import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { Button } from "@/components/ui/button";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/admin/categories";
import { getStaffProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";

export const metadata: Metadata = {
  title: "Gestión de categorías",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  const profile = await getStaffProfile();
  if (!profile) redirect("/admin/login");

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("display_order");

  return (
    <>
      <h1 className="mb-10 font-display text-3xl font-bold tracking-[0.12em]">Categorías</h1>

      <section className="mb-16 max-w-2xl border border-border p-8">
        <h2 className="text-eyebrow mb-7">Nueva categoría</h2>
        <CategoryForm action={createCategory} submitLabel="Crear categoría" />
      </section>

      <section className="space-y-8">
        <h2 className="text-eyebrow">Categorías existentes</h2>
        {categories && categories.length > 0 ? (
          <ul className="space-y-8">
            {(categories as (Category & { products: { count: number }[] })[]).map((cat) => {
              const count = cat.products?.[0]?.count ?? 0;
              const updateAction = updateCategory.bind(null, cat.id);
              return (
                <li key={cat.id} className="max-w-2xl border border-border p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <p className="font-display text-lg font-medium tracking-[0.08em]">
                      {cat.name}{" "}
                      <span className="text-xs font-light text-mid">
                        · {count} {count === 1 ? "obra" : "obras"}
                      </span>
                    </p>
                  </div>
                  <CategoryForm
                    action={updateAction}
                    category={cat}
                    submitLabel="Guardar cambios"
                  />
                  {count === 0 && (
                    <form action={deleteCategory} className="mt-6 border-t border-border pt-6">
                      <input type="hidden" name="categoryId" value={cat.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Eliminar categoría
                      </Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm font-light text-mid">No hay categorías.</p>
        )}
      </section>
    </>
  );
}
