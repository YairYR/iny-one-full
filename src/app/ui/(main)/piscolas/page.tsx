import type { Metadata } from "next";
import Script from "next/script";
import PiscolaCalculator from "@/features/piscolas/components/PiscolaCalculator";

export const metadata: Metadata = {
  title: "Calculadora de Piscolas – iny.one",
  description:
    "Calcula cuántas botellas de pisco y Coca-Cola comprar según personas, receta, tamaños de botella y presupuesto estimado.",
  keywords: [
    "calculadora de piscolas",
    "piscola",
    "pisco coca cola",
    "cuanto pisco comprar",
    "cuanta coca cola comprar",
    "calculadora fiesta chile",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/piscolas",
  },
  openGraph: {
    title: "Calculadora de Piscolas – iny.one",
    description:
      "Calcula cuántas botellas de pisco y Coca-Cola comprar según personas, receta, tamaños de botella y presupuesto estimado.",
    url: "/piscolas",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de Piscolas – iny.one",
    description:
      "Calcula cuántas botellas de pisco y Coca-Cola comprar según personas, receta, tamaños de botella y presupuesto estimado.",
    images: ["/og-image.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calculadora de Piscolas | iny.one",
  url: "https://iny.one/piscolas",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  description:
    "Calcula cuántas botellas de pisco y Coca-Cola comprar para una junta, incluyendo presupuesto total, costo por persona y proporción de la receta.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CLP",
  },
};

export default function PiscolasPage() {
  return (
    <>
      <Script
        id="piscolas-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PiscolaCalculator />
    </>
  );
}
