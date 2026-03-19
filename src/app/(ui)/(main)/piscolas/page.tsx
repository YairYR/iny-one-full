import Script from 'next/script';
import PiscolaCalculator from '@/components/Piscolas/PiscolaCalculator';

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
