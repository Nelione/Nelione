"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form-fields";
import type { AdminFormState } from "@/lib/actions/admin/products";
import type { Category, Product } from "@/types/database";

interface Props {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  categories: Category[];
  product?: Product;
  submitLabel: string;
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function ProductForm({ action, categories, product, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState<AdminFormState, FormData>(action, {});
  const e = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
      <Field id="p-name" label="Nombre" error={e.name}>
        <Input id="p-name" name="name" defaultValue={product?.name} required />
      </Field>

      <Field id="p-slug" label="Slug (URL)" error={e.slug}>
        <Input
          id="p-slug"
          name="slug"
          defaultValue={product?.slug}
          placeholder="sin-titulo-i"
          required
        />
      </Field>

      <Field id="p-category" label="Categoría" error={e.category_id}>
        <Select id="p-category" name="category_id" defaultValue={product?.category_id ?? ""} required>
          <option value="" disabled>
            — Selecciona —
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field id="p-type" label="Tipo" error={e.product_type}>
        <Select id="p-type" name="product_type" defaultValue={product?.product_type ?? "original"}>
          <option value="original">Obra original</option>
          <option value="lamina">Lámina</option>
          <option value="escultura">Escultura</option>
        </Select>
      </Field>

      <Field id="p-status" label="Estado" error={e.status}>
        <Select id="p-status" name="status" defaultValue={product?.status ?? "draft"}>
          <option value="draft">Borrador</option>
          <option value="published">Publicada</option>
          <option value="archived">Archivada</option>
        </Select>
      </Field>

      <Field id="p-price" label="Precio (EUR)" error={e.price_eur}>
        <Input
          id="p-price"
          name="price_eur"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product ? (product.price_amount / 100).toString() : ""}
          required
        />
      </Field>

      <Field id="p-stock" label="Stock (vacío = sin límite)" error={e.stock_quantity}>
        <Input
          id="p-stock"
          name="stock_quantity"
          type="number"
          min="0"
          defaultValue={product?.stock_quantity ?? ""}
        />
      </Field>

      <Field id="p-year" label="Año" error={e.year_created}>
        <Input
          id="p-year"
          name="year_created"
          type="number"
          min="1900"
          max="2100"
          defaultValue={product?.year_created ?? ""}
        />
      </Field>

      <Field id="p-width" label="Ancho (cm)" error={e.width_cm}>
        <Input id="p-width" name="width_cm" type="number" step="0.1" min="0" defaultValue={product?.width_cm ?? ""} />
      </Field>

      <Field id="p-height" label="Alto (cm)" error={e.height_cm}>
        <Input id="p-height" name="height_cm" type="number" step="0.1" min="0" defaultValue={product?.height_cm ?? ""} />
      </Field>

      <Field id="p-depth" label="Fondo (cm)" error={e.depth_cm}>
        <Input id="p-depth" name="depth_cm" type="number" step="0.1" min="0" defaultValue={product?.depth_cm ?? ""} />
      </Field>

      <Field id="p-medium" label="Técnica" error={e.medium}>
        <Input
          id="p-medium"
          name="medium"
          placeholder="Óleo sobre lienzo"
          defaultValue={product?.medium ?? ""}
        />
      </Field>

      <Field id="p-edition" label="Edición (láminas)" error={e.edition_info}>
        <Input
          id="p-edition"
          name="edition_info"
          placeholder="A2 · Ed. 30"
          defaultValue={product?.edition_info ?? ""}
        />
      </Field>

      <div className="flex items-end gap-10 pb-3">
        <label className="flex items-center gap-3 text-sm font-light">
          <input
            type="checkbox"
            name="is_unique"
            defaultChecked={product?.is_unique}
            className="size-4 accent-ink"
          />
          Pieza única
        </label>
        <label className="flex items-center gap-3 text-sm font-light">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured}
            className="size-4 accent-ink"
          />
          Destacada
        </label>
      </div>

      <div className="sm:col-span-2">
        <Field id="p-description" label="Descripción" error={e.description}>
          <Textarea id="p-description" name="description" defaultValue={product?.description ?? ""} />
        </Field>
      </div>

      <Field id="p-meta-title" label="Meta título (SEO, ≤70)" error={e.meta_title}>
        <Input id="p-meta-title" name="meta_title" maxLength={70} defaultValue={product?.meta_title ?? ""} />
      </Field>

      <Field id="p-meta-desc" label="Meta descripción (SEO, ≤160)" error={e.meta_description}>
        <Input
          id="p-meta-desc"
          name="meta_description"
          maxLength={160}
          defaultValue={product?.meta_description ?? ""}
        />
      </Field>

      {state.error && (
        <p role="alert" className="text-xs text-red-700 sm:col-span-2">
          {state.error}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
