import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Para galerías y coleccionistas",
  description:
    "Carta de presentación de Nelione para galerías, instituciones y coleccionistas. Exposiciones, adquisiciones y colaboraciones editoriales.",
  alternates: { canonical: "/galerias" },
};

export default function GaleriasPage() {
  return (
    <section className="mx-auto max-w-xl px-8 pb-28 pt-28">
      <header className="mb-14 text-center">
        <p className="text-eyebrow mb-7">Para galerías y coleccionistas</p>
        <h1 className="mb-8 font-display text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.05] tracking-[0.1em]">
          Hablemos
          <br />
          de una
          <br />
          colaboración
        </h1>
        <div className="mx-auto mb-8 h-px w-8 bg-sand" aria-hidden="true" />
      </header>

      {/* Carta de presentación — sustituir por el texto definitivo del artista */}
      <div className="mb-16 space-y-6 text-sm font-light leading-[1.95] text-center text-[#555553]">
        <p>
          Mi trabajo explora los ciclos del cuerpo y la mente a través de la pintura, la
          escultura y la obra gráfica. La colección actual, <em>Feel Create Repeat</em>, reúne
          piezas únicas y ediciones limitadas concebidas como un único diálogo.
        </p>
        <p>
          Si representas una galería o institución, o coleccionas obra contemporánea, estaré
          encantado de compartir el dossier completo de la colección, condiciones de
          disponibilidad y obra no publicada en la web. Respondo personalmente a cada mensaje.
        </p>
      </div>

      <ContactForm />
    </section>
  );
}
