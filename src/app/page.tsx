import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Inicio — la entrada de la galería.
 * Vídeo vertical 9:16 como objeto centrado (firma visual del sitio).
 *
 * El vídeo va en /public/entrada.mp4 con poster /public/entrada-poster.jpg.
 * autoPlay + muted + playsInline + loop: atributos HTML estándar, no requiere
 * "use client". Si el navegador bloquea el autoplay, el poster cubre el hueco.
 */
export default function HomePage() {
  return (
    <section className="flex min-h-[calc(100dvh-73px)] flex-col items-center justify-center px-8 py-16">
      <div className="mb-9 aspect-[9/16] w-[min(300px,65vw)] overflow-hidden bg-[#d8d0c8]">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/entrada-poster.jpg"
          aria-label="Vídeo de presentación de la colección Feel Create Repeat"
          className="size-full object-cover"
        >
          <source src="/entrada.mp4" type="video/mp4" />
        </video>
      </div>

      <h1 className="text-center font-display text-[clamp(2.8rem,8vw,5rem)] font-bold leading-none tracking-[0.18em]">
        Nelione
      </h1>
      <p className="mb-11 mt-2 text-center font-display text-[clamp(0.75rem,2vw,0.9rem)] font-light uppercase tracking-[0.35em] text-mid">
        Feel Create Repeat
      </p>

      <Button asChild variant="outline">
        <Link href="/coleccion">Entrar</Link>
      </Button>
    </section>
  );
}
