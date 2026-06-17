import { useTranslations } from "next-intl";

/**
 * Bloque de contenido editorial de la homepage.
 *
 * Objetivos SEO/GEO:
 * - Aporta texto indexable real (el sitio era muy "thin content").
 * - Estructura citation-first: cada bloque abre con una definición clara
 *   ([Entidad] es [categoría] que [diferenciador]) que los LLMs extraen bien.
 * - Headings jerárquicos (h2/h3) con keywords del nicho.
 * - Densidad de entidades: UTM, QR, click tracking, source/medium/campaign.
 */
export default function HomeContent() {
  const t = useTranslations("HomeContent");

  const steps = [t("step1"), t("step2"), t("step3")];
  const utmParts = [
    { term: "utm_source", desc: t("utmSourceDesc") },
    { term: "utm_medium", desc: t("utmMediumDesc") },
    { term: "utm_campaign", desc: t("utmCampaignDesc") },
  ];

  return (
    <section className="max-w-2xl mx-auto mt-12 mb-8 space-y-10 text-gray-700">
      {/* Qué es / cómo funciona */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t("howTitle")}</h2>
        <p className="mb-4 leading-relaxed">{t("howIntro")}</p>
        <ol className="list-decimal list-inside space-y-2">
          {steps.map((step, i) => (
            <li key={i} className="leading-relaxed">{step}</li>
          ))}
        </ol>
      </div>

      {/* Qué son los UTM */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t("utmTitle")}</h2>
        <p className="mb-4 leading-relaxed">{t("utmIntro")}</p>
        <dl className="space-y-3">
          {utmParts.map(({ term, desc }) => (
            <div key={term} className="bg-white rounded-lg p-4 shadow-sm">
              <dt className="font-mono text-sm font-semibold text-indigo-600">{term}</dt>
              <dd className="text-sm mt-1">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* QR codes */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t("qrTitle")}</h2>
        <p className="leading-relaxed">{t("qrIntro")}</p>
      </div>

      {/* Privacidad / sin ads */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t("privacyTitle")}</h2>
        <p className="leading-relaxed">{t("privacyIntro")}</p>
      </div>
    </section>
  );
}
