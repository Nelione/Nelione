import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-10 text-center md:flex-row md:justify-between md:text-left lg:px-10">
        <p className="text-eyebrow">
          © {new Date().getFullYear()} Nelione — Feel Create Repeat
        </p>
        <nav aria-label="Legal" className="flex gap-6">
          <Link href="/galerias" className="text-eyebrow transition-colors hover:text-ink">
            Contacto
          </Link>
          <Link href="/sobre-el-artista" className="text-eyebrow transition-colors hover:text-ink">
            El artista
          </Link>
        </nav>
      </div>
    </footer>
  );
}
