import { getSiteUrl } from "@/lib/utils";

/**
 * Datos estructurados globales: Organization + WebSite.
 * Se renderiza una vez en el layout raíz. El JSON-LD por obra/persona vive
 * en sus páginas respectivas.
 */
export function SiteJsonLd() {
  const base = getSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "Nelione",
        url: base,
        logo: `${base}/icon.png`,
        description:
          "Artista contemporáneo. Obra original, láminas de edición limitada y escultura.",
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "Nelione",
        publisher: { "@id": `${base}/#organization` },
        inLanguage: "es-ES",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático de datos propios
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
