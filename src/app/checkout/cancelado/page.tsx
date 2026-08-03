import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pago cancelado",
  robots: { index: false },
};

export default function CanceladoPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
      <p className="text-eyebrow mb-6">Pago cancelado</p>
      <h1 className="mb-8 font-display text-4xl font-bold tracking-[0.12em]">
        Tu selección sigue aquí
      </h1>
      <p className="mb-10 max-w-sm text-sm font-light leading-[1.9] text-mid">
        No se ha realizado ningún cargo. Las obras siguen en tu carrito por si quieres
        completar la compra más tarde.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/carrito">Volver al carrito</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/obras">Seguir explorando</Link>
        </Button>
      </div>
    </section>
  );
}
