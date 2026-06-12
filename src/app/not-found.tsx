import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
      <p className="text-eyebrow mb-6">404</p>
      <h1 className="mb-8 font-display text-4xl font-bold tracking-[0.12em]">
        Esta sala está vacía
      </h1>
      <p className="mb-10 max-w-sm text-sm font-light text-mid">
        La página que buscas no existe o la obra ya no está disponible.
      </p>
      <Button asChild variant="outline">
        <Link href="/obras">Volver al catálogo</Link>
      </Button>
    </section>
  );
}
