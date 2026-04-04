import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutPage");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: "/about",
    },
    openGraph: {
      title,
      description,
      url: "/about",
      images: ["/og-image.png"],
    },
    twitter: {
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

const faqs = {
  en: [
    {
      q: "What is iny.one?",
      a: "It's a free tool to shorten URLs and add UTM parameters for better campaign tracking.",
    },
    {
      q: "Is iny.one free?",
      a: "Yes, the service is completely free and does not require registration.",
    },
    {
      q: "What are UTM parameters?",
      a: "UTM parameters let you track the origin of web traffic in your marketing campaigns.",
    },
    {
      q: "Can I see stats for my links?",
      a: "Not yet, but we're working on it.",
    },
    {
      q: "Does iny.one store my data?",
      a: "We don't collect or store personal data. Shortened URLs are used only for redirection.",
    },
  ],
  es: [
    {
      q: "¿Qué es iny.one?",
      a: "Es una herramienta gratuita para acortar URLs y añadir parámetros UTM fácilmente, permitiendo un mejor seguimiento de campañas.",
    },
    {
      q: "¿iny.one es gratuito?",
      a: "Sí, el servicio es completamente gratuito y no requiere registro.",
    },
    {
      q: "¿Qué son los parámetros UTM?",
      a: "Los parámetros UTM permiten rastrear el origen del tráfico web en tus campañas de marketing.",
    },
    {
      q: "¿Puedo ver estadísticas de los enlaces?",
      a: "Por ahora no, pero estamos trabajando en ello.",
    },
    {
      q: "¿iny.one guarda mis datos?",
      a: "No recopilamos ni almacenamos datos personales. Las URLs acortadas se usan solo para redirección.",
    },
  ],
};

const roadmap = {
  en: [
    "Built-in QR code generator",
    "Basic link stats (clicks, referer, etc.)",
    "Dashboard for registered users",
  ],
  es: [
    "Generador de códigos QR integrado",
    "Estadísticas básicas por enlace (clics, referer, etc.)",
    "Panel de gestión para usuarios registrados",
  ],
};

export default function AboutPage() {
  const t = useTranslations("AboutPage");
  const locale = useLocale() as "es" | "en";

  // FAQPage schema usa siempre inglés para máxima cobertura en SERPs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.en.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">{t("title")}</h1>

        <p className="text-lg text-gray-700 mb-6">{t("intro")}</p>
        <p className="text-lg text-gray-700 mb-6">{t("why")}</p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t("futureTitle")}</h2>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          {roadmap[locale].map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <p className="text-lg text-gray-700 mb-12">{t("contact")}</p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t("faqTitle")}</h2>
        <div className="space-y-6">
          {faqs[locale].map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-800">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            prefetch={false}
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backHome")}
          </Link>
        </div>
      </main>
    </div>
  );
}
