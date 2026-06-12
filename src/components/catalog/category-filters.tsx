import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

/**
 * Filtros de catálogo como enlaces (rutas reales /obras/[category]).
 * Ventaja sobre filtros con estado de cliente: cada categoría es una URL
 * indexable con su propia metadata — mejor SEO y cero JS.
 */
export function CategoryFilters({
  categories,
  active,
}: {
  categories: Category[];
  active?: string;
}) {
  const items = [{ slug: "", name: "Todo" }, ...categories];

  return (
    <nav aria-label="Filtrar por categoría" className="mb-14 flex flex-wrap justify-center gap-3">
      {items.map((item) => {
        const isActive = (item.slug || undefined) === active;
        return (
          <Link
            key={item.slug || "all"}
            href={item.slug ? `/obras/${item.slug}` : "/obras"}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "btn-gallery border px-5 py-2 transition-colors",
              isActive
                ? "border-ink bg-ink text-cream"
                : "border-border text-mid hover:border-ink hover:text-ink",
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
