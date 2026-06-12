import Link from "next/link";
import { readCart } from "@/lib/actions/cart";

const NAV_LINKS = [
  { href: "/coleccion", label: "Colección" },
  { href: "/obras", label: "Obras" },
  { href: "/sobre-el-artista", label: "El artista" },
  { href: "/galerias", label: "Galerías" },
] as const;

/**
 * Navegación principal — Server Component.
 * El contador del carrito se lee de la cookie en el servidor; addToCart hace
 * revalidatePath("/", "layout") para refrescarlo. Menú móvil con <details>
 * nativo: cero JavaScript de cliente.
 */
export async function SiteNav() {
  const cart = await readCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-cream">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10"
      >
        <Link
          href="/"
          className="font-display text-base font-bold uppercase tracking-[0.22em]"
        >
          Nelione
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="btn-gallery text-ink transition-colors hover:text-mid"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          <Link
            href="/carrito"
            className="btn-gallery relative text-ink transition-colors hover:text-mid"
          >
            Carrito
            {count > 0 && (
              <span className="absolute -right-3.5 -top-2 flex size-4 items-center justify-center rounded-full bg-ink text-[0.5rem] text-cream">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile: <details> nativo, sin JS */}
          <details className="group relative md:hidden">
            <summary className="btn-gallery cursor-pointer list-none text-ink [&::-webkit-details-marker]:hidden">
              Menú
            </summary>
            <ul className="absolute right-0 top-full mt-4 flex w-56 flex-col border border-border bg-cream">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="border-b border-border last:border-0">
                  <Link
                    href={link.href}
                    className="btn-gallery block px-5 py-4 text-ink hover:bg-border/40"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </nav>
    </header>
  );
}
