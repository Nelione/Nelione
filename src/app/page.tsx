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
      
      <div className="mx-auto max-w-xl px-8 pb-10 text-center">
        <div className="mx-auto mb-8 h-px w-8 bg-sand" aria-hidden="true" />
        <p className="mb-12 text-sm font-light leading-[1.95] text-[#555553]">
          Una colección sobre los ciclos del cuerpo y la mente. Sentir, crear, repetir — como
          respirar, como vivir.
          <br />
          <br />
          Cada obra es un instante atrapado en ese bucle: el rosa que regresa, la forma que muta
          sin perder su esencia. Pintura, escultura y lámina conviven en un mismo diálogo, íntimo
          y universal.
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/obras">Entrar</Link>
      </Button>
    </section>
  );
}
