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
    canonical: "https://iny.one/piscolas",
    languages: {
      es: "https://iny.one/piscolas",
      "x-default": "https://iny.one/piscolas",
    },
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

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuántas piscolas salen de una botella de pisco?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con la receta clásica 1:3 en vaso de 300 ml, una botella de 750 ml rinde unas 10 piscolas; una de un litro, unas 13.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuánto pisco comprar para 10 personas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Si cada persona toma 3 piscolas se necesitan unas 30: aproximadamente 3 botellas de 750 ml de pisco y 7 litros de Coca-Cola.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué proporción lleva la piscola?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La receta clásica chilena es 1:3 (una parte de pisco por tres de bebida); va de 1:2 para las más cargadas a 1:4 para las más suaves.",
      },
    },
  ],
};

export default function PiscolasPage() {
  return (
    <>
      <Script
        id="piscolas-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="piscolas-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />

      <PiscolaCalculator />

      {/* Contenido server-rendered indexable — la página era solo el calculador client-side */}
      <section className="max-w-2xl mx-auto mt-12 mb-8 space-y-8 text-gray-700 px-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">¿Cómo funciona la calculadora de piscolas?</h2>
          <p className="leading-relaxed">
            La calculadora estima cuántas botellas de pisco y de Coca-Cola necesitas comprar para una junta,
            según la cantidad de personas, cuántas piscolas toma cada una y la proporción de la receta.
            Ingresa los datos, elige los tamaños de botella disponibles y obtén la lista de compras con el
            presupuesto total y el costo por persona.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">La proporción de la piscola</h2>
          <p className="leading-relaxed">
            La receta clásica chilena usa una parte de pisco por tres de bebida (1:3), aunque la proporción
            va del 1:2 para las más cargadas al 1:4 para las más suaves. Un vaso estándar de 300 ml con
            proporción 1:3 lleva unos 75 ml de pisco — es decir, una botella de 750 ml rinde alrededor de
            10 piscolas. La calculadora ajusta todo esto automáticamente según la receta que elijas.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Preguntas frecuentes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">¿Cuántas piscolas salen de una botella de pisco?</h3>
              <p className="text-sm leading-relaxed">Con la receta 1:3 en vaso de 300 ml, una botella de 750 ml rinde unas 10 piscolas; una de un litro, unas 13.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">¿Cuánto pisco comprar para 10 personas?</h3>
              <p className="text-sm leading-relaxed">Si cada persona toma 3 piscolas, necesitas unas 30 piscolas: 3 botellas de 750 ml de pisco y unos 7 litros de Coca-Cola. La calculadora lo ajusta a los formatos de botella reales.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">¿La calculadora es gratis?</h3>
              <p className="text-sm leading-relaxed">Sí, es completamente gratuita y no requiere registro.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
