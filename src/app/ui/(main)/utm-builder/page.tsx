import type { Metadata } from "next";
import Script from "next/script";
import { useLocale } from "next-intl";
import Link from "next/link";
import UrlShortForm from "@/features/short_links/components/UrlShortForm";
import { ROUTES } from "@/lib/routes";

const TITLE = "Free UTM Builder — Create, Tag & Shorten Campaign Links | iny.one";
const DESCRIPTION =
  "Build UTM links for Google Analytics in seconds: add utm_source, utm_medium and utm_campaign, then get a clean short link and QR code. Free, no sign-up.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "utm builder",
    "free utm builder",
    "utm generator",
    "utm link builder",
    "campaign url builder",
    "generador utm",
    "crear enlaces utm",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://iny.one/utm-builder",
    languages: {
      en: "https://iny.one/utm-builder",
      es: "https://iny.one/utm-builder",
      "x-default": "https://iny.one/utm-builder",
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/utm-builder",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://iny.one/utm-builder#tool",
      name: "iny.one UTM Builder",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      url: "https://iny.one/utm-builder",
      description:
        "Free UTM builder that tags links with utm_source, utm_medium and utm_campaign and returns a short, trackable URL with an optional QR code.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a UTM builder?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A UTM builder is a tool that appends UTM parameters (utm_source, utm_medium, utm_campaign) to a URL so analytics platforms like Google Analytics can attribute traffic to a specific campaign, channel, or ad.",
          },
        },
        {
          "@type": "Question",
          name: "Is this UTM builder free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Building UTM links, shortening them, and generating a QR code is free and requires no sign-up for basic use.",
          },
        },
        {
          "@type": "Question",
          name: "Do UTM parameters affect SEO?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Search engines ignore UTM parameters for ranking. They only affect how visits are attributed inside your analytics platform.",
          },
        },
        {
          "@type": "Question",
          name: "What is the difference between utm_source and utm_medium?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "utm_source identifies the platform sending the traffic (google, facebook, newsletter), while utm_medium identifies the channel type (cpc, email, social).",
          },
        },
      ],
    },
  ],
};

const content = {
  en: {
    h1: "Free UTM Builder with Link Shortener",
    intro:
      "Build campaign links with UTM parameters and get a clean short URL in one step. iny.one is a free UTM builder that tags your links for Google Analytics, shortens them so they look good anywhere, and generates a QR code for print — no sign-up needed.",
    howTitle: "How to build a UTM link",
    steps: [
      "Paste the destination URL of your campaign (landing page, product page, article).",
      "Fill in utm_source, utm_medium and utm_campaign. Use consistent lowercase naming.",
      "Get your tagged short link, copy it, or download its QR code for offline media.",
    ],
    paramsTitle: "The UTM parameters, explained",
    params: [
      { term: "utm_source", desc: "Where the traffic comes from: google, facebook, newsletter, linkedin." },
      { term: "utm_medium", desc: "The channel type: cpc for paid search, email, social, qr_code for printed codes." },
      { term: "utm_campaign", desc: "The specific initiative: summer_sale, product_launch, black_friday_2026." },
    ],
    conventionTitle: "Naming conventions that keep your data clean",
    convention:
      "Inconsistent tags ruin attribution: Google and google are two different sources in your reports. Always use lowercase, pick underscores or hyphens and stick to one, and use names that will make sense in six months (spring_sale_2026, not test2). Because iny.one stores the parameters with each short link, your dashboard shows exactly which campaign drove every click.",
    whyShortenTitle: "Why shorten UTM links?",
    whyShorten:
      "A URL with three UTM parameters is long, ugly, and easy to break when copied. Shortening it hides the machinery from your audience, prevents manual editing mistakes, and gives you click analytics on top of your regular web analytics. The QR code option extends the same tagged link to posters, packaging, and print.",
    ctaHome: "Just need to shorten a URL? Use the home shortener",
  },
  es: {
    h1: "Generador UTM gratis con acortador de enlaces",
    intro:
      "Crea enlaces de campaña con parámetros UTM y obtén una URL corta y limpia en un solo paso. iny.one es un generador UTM gratuito que etiqueta tus enlaces para Google Analytics, los acorta para que se vean bien en cualquier lugar y genera un código QR para impresos — sin registro.",
    howTitle: "Cómo crear un enlace UTM",
    steps: [
      "Pega la URL de destino de tu campaña (landing, página de producto, artículo).",
      "Completa utm_source, utm_medium y utm_campaign. Usa nombres consistentes en minúsculas.",
      "Obtén tu enlace corto etiquetado, cópialo o descarga su código QR para medios impresos.",
    ],
    paramsTitle: "Los parámetros UTM, explicados",
    params: [
      { term: "utm_source", desc: "De dónde viene el tráfico: google, facebook, newsletter, linkedin." },
      { term: "utm_medium", desc: "El tipo de canal: cpc para búsqueda pagada, email, social, qr_code para códigos impresos." },
      { term: "utm_campaign", desc: "La iniciativa específica: promo_verano, lanzamiento_producto, black_friday_2026." },
    ],
    conventionTitle: "Convenciones de nombres que mantienen tus datos limpios",
    convention:
      "Las etiquetas inconsistentes arruinan la atribución: Google y google son dos fuentes distintas en tus reportes. Usa siempre minúsculas, elige guion bajo o guion y mantén uno solo, y usa nombres que tengan sentido en seis meses (promo_primavera_2026, no test2). Como iny.one guarda los parámetros con cada enlace corto, tu panel muestra exactamente qué campaña generó cada clic.",
    whyShortenTitle: "¿Por qué acortar enlaces UTM?",
    whyShorten:
      "Una URL con tres parámetros UTM es larga, fea y fácil de romper al copiarla. Acortarla oculta la maquinaria a tu audiencia, evita errores de edición manual y te da analítica de clics además de tu analítica web habitual. La opción de código QR extiende el mismo enlace etiquetado a afiches, empaques e impresos.",
    ctaHome: "¿Solo necesitas acortar una URL? Usa el acortador de la home",
  },
};

export default function UtmBuilderPage() {
  const locale = useLocale() as "es" | "en";
  const t = content[locale] ?? content.en;

  return (
    <>
      <Script
        id="utm-builder-jsonld"
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

        <UrlShortForm />

        <section className="mt-12 space-y-10 text-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.howTitle}</h2>
            <ol className="list-decimal list-inside space-y-2">
              {t.steps.map((s, i) => (
                <li key={i} className="leading-relaxed">{s}</li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.paramsTitle}</h2>
            <dl className="space-y-3">
              {t.params.map(({ term, desc }) => (
                <div key={term} className="bg-white rounded-lg p-4 shadow-sm">
                  <dt className="font-mono text-sm font-semibold text-indigo-600">{term}</dt>
                  <dd className="text-sm mt-1">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.conventionTitle}</h2>
            <p className="leading-relaxed">{t.convention}</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.whyShortenTitle}</h2>
            <p className="leading-relaxed">{t.whyShorten}</p>
          </div>

          <p className="text-sm">
            <Link prefetch={false} href={ROUTES.HOME} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t.ctaHome}
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
