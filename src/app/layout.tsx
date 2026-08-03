import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import type * as React from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { getSiteUrl } from "@/lib/utils";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Nelione — Feel Create Repeat | Arte contemporáneo",
    template: "%s | Nelione",
  },
  description:
    "Obra original, láminas de edición limitada y escultura del artista contemporáneo Nelione. Colección Feel Create Repeat.",
  keywords: [
    "Nelione",
    "arte contemporáneo",
    "comprar arte",
    "obra original",
    "láminas edición limitada",
    "escultura contemporánea",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: getSiteUrl(),
    siteName: "Nelione",
    title: "Nelione — Feel Create Repeat",
    description:
      "Obra original, láminas de edición limitada y escultura del artista contemporáneo Nelione.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Nelione — Feel Create Repeat" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nelione — Feel Create Repeat",
    description: "Arte contemporáneo: obra original, láminas y escultura.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteJsonLd />
        <SiteNav />
        <main className="flex-1 pt-[73px]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
