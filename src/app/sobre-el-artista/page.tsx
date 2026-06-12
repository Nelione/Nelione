import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sobre el artista",
  description:
    "Nelione es un artista contemporáneo cuya obra explora los ciclos del cuerpo y la mente a través de la pintura, la escultura y la obra gráfica.",
  alternates: { canonical: "/sobre-el-artista" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nelione",
  jobTitle: "Artista contemporáneo",
  url: `${getSiteUrl()}/sobre-el-artista`,
  knowsAbout: ["Pintura contemporánea", "Escultura", "Obra gráfica"],
};

export default function SobreElArtistaPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-28 pt-24 lg:px-10">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático generado en servidor
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2">
        {/* Retrato — sustituir /public/retrato.jpg por la foto real */}
        <div className="relative aspect-[4/5] bg-[#e6e0d8]">
          <Image
            src="/retrato.jpg"
            alt="Retrato del artista Nelione en su estudio"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="lg:pt-10">
          <p className="text-eyebrow mb-6">El artista</p>
          <h1 className="mb-8 font-display text-[clamp(2.4rem,5vw,3.8rem)] font-bold leading-[1.05] tracking-[0.1em]">
            Nelione
          </h1>
          <div className="mb-8 h-px w-8 bg-sand" aria-hidden="true" />

          {/*
            CONTENIDO PROVISIONAL — sustituir por la biografía y statement
            reales del artista. La estructura (statement breve + bio + CV
            seleccionado) es la convención de galerías tipo Hauser & Wirth.
          */}
          <div className="space-y-6 text-sm font-light leading-[1.95] text-[#555553]">
            <p>
              Nelione trabaja en la intersección entre pintura, escultura y obra gráfica. Su
              práctica gira en torno a los ciclos: los del cuerpo, los de la mente, los del
              propio acto de crear. Sentir, crear, repetir — un bucle que estructura tanto la
              obra como el proceso.
            </p>
            <p>
              En su trabajo reciente, el color regresa de forma obsesiva — el rosa como
              constante — mientras la forma muta sin perder su esencia. Cada pieza es un
              instante atrapado en esa repetición, íntimo y universal a la vez.
            </p>
          </div>

          <h2 className="text-eyebrow mb-5 mt-14">Trayectoria seleccionada</h2>
          <ul className="space-y-3 text-sm font-light text-[#555553]">
            {/* Sustituir por exposiciones reales */}
            <li className="flex gap-6 border-b border-border pb-3">
              <span className="w-12 shrink-0 font-display tracking-[0.1em]">2025</span>
              <span>Feel Create Repeat — colección actual</span>
            </li>
            <li className="flex gap-6 border-b border-border pb-3">
              <span className="w-12 shrink-0 font-display tracking-[0.1em]">2024</span>
              <span>[Exposición / feria / residencia]</span>
            </li>
          </ul>

          <div className="mt-14">
            <Button asChild variant="outline">
              <Link href="/galerias">Contacto para galerías</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
