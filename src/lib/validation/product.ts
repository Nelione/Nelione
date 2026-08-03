import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nombre demasiado corto.").max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug no válido (minúsculas, números y guiones)."),
  category_id: z.string().uuid("Selecciona una categoría."),
  product_type: z.enum(["original", "lamina", "escultura"]),
  status: z.enum(["draft", "published", "archived"]),
  // El formulario envía euros; se convierte a céntimos en la action.
  price_eur: z.coerce.number().min(0, "El precio no puede ser negativo.").max(1_000_000),
  stock_quantity: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(100_000)])
    .transform((v) => (v === "" ? null : v)),
  is_unique: z.coerce.boolean(),
  width_cm: z.union([z.literal(""), z.coerce.number().min(0)]).transform((v) => (v === "" ? null : v)),
  height_cm: z.union([z.literal(""), z.coerce.number().min(0)]).transform((v) => (v === "" ? null : v)),
  depth_cm: z.union([z.literal(""), z.coerce.number().min(0)]).transform((v) => (v === "" ? null : v)),
  medium: z.string().trim().max(200).transform((v) => v || null),
  edition_info: z.string().trim().max(200).transform((v) => v || null),
  year_created: z
    .union([z.literal(""), z.coerce.number().int().min(1900).max(2100)])
    .transform((v) => (v === "" ? null : v)),
  description: z.string().trim().max(5000).transform((v) => v || null),
  featured: z.coerce.boolean(),
  meta_title: z.string().trim().max(70).transform((v) => v || null),
  meta_description: z.string().trim().max(160).transform((v) => v || null),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nombre demasiado corto.").max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug no válido."),
  description: z.string().trim().max(500).transform((v) => v || null),
  display_order: z.coerce.number().int().min(0).max(1000),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
