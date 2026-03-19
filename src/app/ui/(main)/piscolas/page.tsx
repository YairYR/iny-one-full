import Script from 'next/script';
import PiscolaCalculator from "@/features/piscolas/components/PiscolaCalculator";
import { type Metadata } from "next";

export function generateMetadata(): Metadata {
  const title = 'Calculadora de Piscolas | iny.one';
  const description = 'Calcula cuántas botellas de pisco y Coca-Cola comprar según personas, receta, tamaños de botella y presupuesto estimado.';
  const url = 'https://iny.one/piscolas';

  return {
    title,
    description,
    keywords: "calculadora de piscolas,piscola,pisco coca cola,cuanto pisco comprar,cuanta coca cola comprar,calculadora fiesta chile",
    robots: "index, follow",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: "https://www.iny.one/og-image.png"
    },
    twitter: {
      title,
      card: 'summary_large_image',
      description,
      images: "https://www.iny.one/og-image.png"
    }
  }
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Calculadora de Piscolas | iny.one',
  url: 'https://iny.one/piscolas',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  description:
    'Calcula cuántas botellas de pisco y Coca-Cola comprar para una junta, incluyendo presupuesto total, costo por persona y proporción de la receta.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CLP',
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
