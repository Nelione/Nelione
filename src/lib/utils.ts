import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases Tailwind sin conflictos (patrón shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un precio almacenado en céntimos a formato español.
 * 180000 -> "1.800 €"
 */
export function formatPrice(amountInCents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: amountInCents % 100 === 0 ? 0 : 2,
  }).format(amountInCents / 100);
}

/**
 * URL pública de una imagen en el bucket "products" de Supabase Storage.
 */
export function getProductImageUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/products/${storagePath}`;
}

/**
 * Slug URL-safe a partir de un nombre.
 * "Sin título I" -> "sin-titulo-i"
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Dimensiones legibles de una obra.
 * { width: 80, height: 100 } -> "80 × 100 cm"
 */
export function formatDimensions(opts: {
  width_cm: number | null;
  height_cm: number | null;
  depth_cm: number | null;
}): string | null {
  const parts = [opts.width_cm, opts.height_cm, opts.depth_cm].filter(
    (v): v is number => v != null,
  );
  if (parts.length === 0) return null;
  return `${parts.map((v) => Number(v)).join(" × ")} cm`;
}

/** URL base canónica del sitio. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://nelione.com";
}
