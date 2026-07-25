import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { useLocale } from "next-intl";
import Link from "next/link";
import QrGenerator from "@/features/qr/components/QrGenerator";
import { ROUTES } from "@/lib/routes";
import { buildPageMetadata, normalizeLocale } from "@/lib/seo/metadata";

const META = {
  en: {
    title: "Free QR Code Generator — No Sign-Up, PNG Download | iny.one",
    description:
      "Generate a QR code for any URL in seconds. Free, no sign-up, no watermark, high-resolution PNG download. Pair it with a short link to track scans.",
  },
  es: {
    title: "Generador de códigos QR gratis — PNG sin registro | iny.one",
    description:
      "Genera un código QR para cualquier URL en segundos. Gratis, sin registro, sin marca de agua y con descarga PNG en alta resolución. Acorta el enlace primero para medir escaneos.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale());
  const m = META[locale];

  return {
    ...buildPageMetadata({
      title: m.title,
      description: m.description,
      path: ROUTES.QR_GENERATOR,
      locale,
    }),
    keywords: [
      "qr code generator",
      "free qr code generator",
      "qr code generator no sign up",
      "create qr code free",
      "qr code png download",
      "generador de codigo qr gratis",
      "crear codigo qr",
    ],
    robots: { index: true, follow: true },
  };
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://iny.one/qr-code-generator#tool",
      name: "iny.one QR Code Generator",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      url: "https://iny.one/qr-code-generator",
      description:
        "Free QR code generator that turns any URL into a high-resolution PNG QR code, with no sign-up and no watermark.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this QR code generator really free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Generating and downloading QR codes as PNG is free, with no sign-up, no watermark, and no expiration on the code itself.",
          },
        },
        {
          "@type": "Question",
          name: "Do these QR codes expire?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A QR code generated directly from your URL never expires — it encodes the URL itself. If you generate the QR from an iny.one short link, the link follows your plan's retention rules.",
          },
        },
        {
          "@type": "Question",
          name: "Can I track how many people scan my QR code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Shorten your URL with iny.one first and generate the QR from the short link: every scan is a click you can see in the dashboard, with country, device, and referrer data.",
          },
        },
        {
          "@type": "Question",
          name: "What resolution is the downloaded QR code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The PNG downloads at 512x512 pixels, sharp enough for business cards, flyers, table cards, and most print use.",
          },
        },
      ],
    },
  ],
};

const content = {
  en: {
    h1: "Free QR Code Generator",
    intro:
      "Turn any URL into a QR code in seconds. iny.one generates high-resolution PNG QR codes with no sign-up, no watermark, and no ads — and if you want scan analytics, shorten the link first and every scan becomes a measurable click.",
    labels: {
      inputLabel: "URL to encode",
      placeholder: "https://example.com",
      button: "Generate QR",
      invalid: "Enter a valid URL",
      download: "Download PNG",
      alt: "Generated QR code",
    },
    trackTitle: "Static QR vs. trackable QR",
    track:
      "A QR code generated directly from your URL is static: it works forever, but tells you nothing. Generate the QR from an iny.one short link instead and every scan is logged — total scans, country, device, and time — in your dashboard. Same print, real data. For campaigns, add UTM parameters with the UTM builder so scans attribute correctly in Google Analytics.",
    printTitle: "Print-ready by default",
    print:
      "Downloads are 512x512 PNG with margin and M-level error correction — sharp on business cards, table tents, flyers, posters, and packaging. Test the printed code from at least the distance your audience will scan it.",
    useTitle: "Common uses",
    uses: [
      "Restaurant and café menus on tables",
      "Business cards linking to a portfolio or contact page",
      "Posters and event signage",
      "Product packaging linking to instructions or warranty",
      "Wi-Fi sharing, payment links, and social profiles",
    ],
    ctaUtm: "Running a campaign? Build a tagged UTM link first",
    ctaHome: "Want scan tracking? Shorten your URL first",
  },
  es: {
    h1: "Generador de códigos QR gratis",
    intro:
      "Convierte cualquier URL en un código QR en segundos. iny.one genera códigos QR en PNG de alta resolución sin registro, sin marca de agua y sin anuncios — y si quieres analítica de escaneos, acorta el enlace primero y cada escaneo se vuelve un clic medible.",
    labels: {
      inputLabel: "URL a codificar",
      placeholder: "https://ejemplo.com",
      button: "Generar QR",
      invalid: "Ingresa una URL válida",
      download: "Descargar PNG",
      alt: "Código QR generado",
    },
    trackTitle: "QR estático vs. QR medible",
    track:
      "Un código QR generado directamente desde tu URL es estático: funciona para siempre, pero no te dice nada. Genera el QR desde un enlace corto de iny.one y cada escaneo queda registrado — escaneos totales, país, dispositivo y hora — en tu panel. La misma impresión, datos reales. Para campañas, añade parámetros UTM con el generador UTM para que los escaneos se atribuyan correctamente en Google Analytics.",
    printTitle: "Listo para imprimir",
    print:
      "Las descargas son PNG de 512x512 con margen y corrección de errores nivel M — nítido en tarjetas de presentación, tent cards, volantes, afiches y empaques. Prueba el código impreso desde al menos la distancia a la que tu audiencia lo escaneará.",
    useTitle: "Usos comunes",
    uses: [
      "Menús de restaurantes y cafés en las mesas",
      "Tarjetas de presentación que llevan a un portafolio o contacto",
      "Afiches y señalética de eventos",
      "Empaques de producto con instrucciones o garantía",
      "Compartir Wi-Fi, links de pago y perfiles sociales",
    ],
    ctaUtm: "¿Tienes una campaña? Crea primero un enlace UTM etiquetado",
    ctaHome: "¿Quieres medir escaneos? Acorta tu URL primero",
  },
};

export default function QrCodeGeneratorPage() {
  const locale = useLocale() as "es" | "en";
  const t = content[locale] ?? content.en;

  return (
    <>
      {/* JSON-LD server-rendered: con next/script se inyectaba tras la
          hidratación y no estaba en el HTML inicial que leen los crawlers. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{t.h1}</h1>
          <p className="text-lg text-gray-600">{t.intro}</p>
        </div>

        <QrGenerator labels={t.labels} />

        <section className="mt-12 space-y-10 text-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.trackTitle}</h2>
            <p className="leading-relaxed">{t.track}</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.printTitle}</h2>
            <p className="leading-relaxed">{t.print}</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.useTitle}</h2>
            <ul className="list-disc list-inside space-y-2">
              {t.uses.map((u, i) => (
                <li key={i} className="leading-relaxed">{u}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm space-x-4">
            <Link prefetch={false} href={ROUTES.UTM_BUILDER} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t.ctaUtm}
            </Link>
            <Link prefetch={false} href={ROUTES.HOME} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t.ctaHome}
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
