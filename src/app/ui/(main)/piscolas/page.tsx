import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import PiscolaCalculator from "@/features/piscolas/components/PiscolaCalculator";
import { localizedPath } from "@/i18n/routes";

const origin = "https://iny.one";
const languages = { es: `${origin}/piscolas`, en: `${origin}/en/piscolas` };

export async function generateMetadata(): Promise<Metadata> {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Piscolas")]);
  const url = locale === "es" ? languages.es : languages.en;
  const title = `${t("title")} – iny.one`;
  const description = t("metaDescription");
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: url, languages },
    openGraph: { title, description, url, type: "website", images: ["/og-image.png"], locale: locale === "es" ? "es_ES" : "en_US" },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
  };
}

export default async function PiscolasPage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Piscolas")]);
  const faqs = [
    { question: t("faq1Question"), answer: t("faq1Answer") },
    { question: t("faq2Question"), answer: t("faq2Answer") },
    { question: t("faq3Question"), answer: t("faq3Answer") },
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: t("title"),
        url: `${origin}${localizedPath("/piscolas", locale)}`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        description: t("metaDescription"),
        offers: { "@type": "Offer", price: "0", priceCurrency: "CLP" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <PiscolaCalculator />
      <section className="max-w-2xl mx-auto mt-12 mb-8 space-y-8 text-gray-700 px-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t("howTitle")}</h2>
          <p className="leading-relaxed">{t("how")}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t("ratioTitle")}</h2>
          <p className="leading-relaxed">{t("ratioDescription")}</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t("faqTitle")}</h2>
          <div className="space-y-4">
            {faqs.map(({ question, answer }) => (
              <div key={question}>
                <h3 className="font-semibold text-gray-800">{question}</h3>
                <p className="text-sm leading-relaxed">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
