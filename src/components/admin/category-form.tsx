"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/form-fields";
import type { AdminFormState } from "@/lib/actions/admin/products";
import type { Category } from "@/types/database";

interface Props {
  action: (prev: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  category?: Category;
  submitLabel: string;
}

export function CategoryForm({ action, category, submitLabel }: Props) {
  const [state, formAction, isPending] = useActionState<AdminFormState, FormData>(action, {});

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <Label htmlFor={`cat-name-${category?.id ?? "new"}`}>Nombre</Label>
        <Input
          id={`cat-name-${category?.id ?? "new"}`}
          name="name"
          defaultValue={category?.name}
          required
        />
      </div>
      <div>
        <Label htmlFor={`cat-slug-${category?.id ?? "new"}`}>Slug</Label>
        <Input
          id={`cat-slug-${category?.id ?? "new"}`}
          name="slug"
          defaultValue={category?.slug}
          placeholder="laminas"
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`cat-desc-${category?.id ?? "new"}`}>Descripción</Label>
        <Textarea
          id={`cat-desc-${category?.id ?? "new"}`}
          name="description"
          defaultValue={category?.description ?? ""}
          className="min-h-20"
        />
      </div>
      <div>
        <Label htmlFor={`cat-order-${category?.id ?? "new"}`}>Orden</Label>
        <Input
          id={`cat-order-${category?.id ?? "new"}`}
          name="display_order"
          type="number"
          min="0"
          defaultValue={category?.display_order ?? 0}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-red-700 sm:col-span-2">
          {state.error}
        </p>
      )}

      <div className="flex items-end sm:col-span-2">
        <Button type="submit" disabled={isPending} variant={category ? "outline" : "default"}>
          {isPending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
