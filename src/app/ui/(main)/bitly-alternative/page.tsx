import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { buildPageMetadata, normalizeLocale } from "@/lib/seo/metadata";

const META = {
  en: {
    title: "Bitly Alternative Without Ads — Free UTM + QR Codes (2026) | iny.one",
    description:
      "Bitly's free plan now shows an ad page before every redirect and caps you at 5 links a month. Compare honest free-plan limits of Bitly, TinyURL, Short.io, Dub and iny.one — a free shortener with UTM tracking, QR codes and no interstitials.",
  },
  es: {
    title: "Alternativa a Bitly sin anuncios — UTM y QR gratis (2026) | iny.one",
    description:
      "El plan gratuito de Bitly ahora muestra una página de anuncios antes de cada redirección y te limita a 5 enlaces al mes. Compara los límites reales de Bitly, TinyURL, Short.io, Dub e iny.one — un acortador gratis con UTM, códigos QR y sin interstitials.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale());
  const m = META[locale];

  return {
    ...buildPageMetadata({
      title: m.title,
      description: m.description,
      path: ROUTES.BITLY_ALTERNATIVE,
      locale,
    }),
    keywords: [
      "bitly alternative",
      "free bitly alternative",
      "bitly alternatives without ads",
      "bitly free plan ads",
      "url shortener without ads",
      "alternativa a bitly",
      "acortador sin anuncios",
    ],
    robots: { index: true, follow: true },
  };
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://iny.one/bitly-alternative",
      url: "https://iny.one/bitly-alternative",
      name: "Bitly Alternative Without Ads — Free UTM + QR Codes",
      description:
        "Honest comparison of free URL shortener plans in 2026: Bitly, TinyURL, Short.io, Dub, Cuttly and iny.one.",
      inLanguage: ["en", "es"],
      isPartOf: { "@id": "https://iny.one/#website" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Does Bitly's free plan show ads?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Since early 2025, links created on Bitly's free plan show an interstitial preview page that can include advertising before redirecting, and the change applies to previously created free-plan links as well. Removing it requires a paid plan.",
          },
        },
        {
          "@type": "Question",
          name: "Does iny.one show ads on short links?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. iny.one redirects straight to the destination with no advertising interstitial, on every tier including anonymous use.",
          },
        },
        {
          "@type": "Question",
          name: "How many free links does iny.one allow?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "5 links per month without an account (these expire after 180 days), or 50 links per month with a free account, which never expire and include the analytics dashboard.",
          },
        },
        {
          "@type": "Question",
          name: "Can I migrate my existing Bitly links?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Existing bit.ly short codes cannot be transferred to another domain — that is true of any shortener. Old links keep redirecting (with Bitly's free-plan ad page), so the practical approach is to create new links on the new service going forward and replace links wherever you control them.",
          },
        },
      ],
    },
  ],
};

interface Row {
  service: string;
  links: string;
  ads: string;
  utm: string;
  qr: string;
  analytics: string;
}

const content = {
  en: {
    h1: "A Bitly Alternative Without Ads on Your Links",
    intro:
      "iny.one is a free URL shortener with built-in UTM tracking and QR codes that never inserts an advertising page before redirecting. If you landed here after seeing an ad on one of your own Bitly links, this page compares — with real numbers — what the main free plans actually give you in 2026.",
    changedTitle: "What changed with Bitly's free plan",
    changed:
      "Bitly's free tier was the default shortener for over a decade. That product no longer exists in the same form: as of 2026 the free plan allows 5 new links and 2 QR codes per month, analytics are limited to total click counts, and — since early 2025 — free links show an interstitial preview page that can include advertising before sending visitors to the destination. The change applies retroactively to links created earlier on free accounts, and removing the ad page requires a paid plan. None of this makes Bitly a bad product; it makes the free plan a trial rather than a tool.",
    tableTitle: "Free plans compared (verified July 2026)",
    tableNote:
      "Limits change often in this market — always re-check each vendor's pricing page before committing. Sources: each provider's own pricing and support pages.",
    cols: { service: "Service", links: "Free links / month", ads: "Ad page on redirect", utm: "UTM tools", qr: "QR codes", analytics: "Free analytics" },
    rows: [
      { service: "iny.one", links: "5 anonymous · 50 with free account", ads: "Never", utm: "source, medium, campaign built-in", qr: "Free PNG, no watermark", analytics: "Clicks, countries, devices, browsers, referrers" },
      { service: "Bitly", links: "5", ads: "Yes (interstitial with ads)", utm: "On paid campaigns tooling", qr: "2 / month", analytics: "Total clicks only" },
      { service: "TinyURL", links: "Unlimited (anonymous)", ads: "No", utm: "No", qr: "Paid", analytics: "None" },
      { service: "Short.io", links: "1,000 total (own domain required)", ads: "No", utm: "Yes", qr: "Yes", analytics: "Up to 50k tracked clicks / month" },
      { service: "Dub", links: "25", ads: "No", utm: "Yes", qr: "Yes", analytics: "Full, developer-oriented" },
      { service: "Cuttly", links: "30", ads: "No", utm: "UTM builder included", qr: "Yes", analytics: "30-day history" },
    ] as Row[],
    honestTitle: "Where iny.one fits — and where it doesn't",
    honest:
      "Honesty works both ways. iny.one is a good fit if you want clean redirects, UTM tagging and a QR code on every link without paying or seeing ads: 50 links a month on a free account covers most creators and small campaigns, and the dashboard shows countries, devices, browsers and referrers. It is not the right tool if you need branded custom domains (links live on iny.one), tens of thousands of links, or team seats — for high-volume branded links, Short.io's free tier is genuinely generous, and developers who want an open-source stack should also look at Dub.",
    switchTitle: "Switching in three steps",
    steps: [
      "Create your next short link on the iny.one homepage — no account needed for the first ones.",
      "Add utm_source, utm_medium and utm_campaign in the same form so analytics attribution keeps working.",
      "Replace old links wherever you control them (bios, posts, printed QR codes) — existing bit.ly links keep redirecting, but on the free plan they show the ad page.",
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      { q: "Does Bitly's free plan show ads?", a: "Yes — since early 2025, free-plan links show an interstitial preview page that can include advertising, including links created before the change. Removing it requires a paid plan." },
      { q: "Does iny.one show ads?", a: "No. Redirects go straight to the destination on every tier, with no interstitial." },
      { q: "How many free links do I get on iny.one?", a: "5 per month without an account (they expire after 180 days), or 50 per month with a free account — those never expire and include full analytics." },
      { q: "Can I move my existing bit.ly links here?", a: "Short codes can't be transferred between domains on any shortener. Old links keep working; create new ones here going forward and swap links where you control them." },
    ],
    ctaHome: "Create your first ad-free short link",
    ctaUtm: "Or start from the UTM builder",
  },
  es: {
    h1: "Una alternativa a Bitly sin anuncios en tus enlaces",
    intro:
      "iny.one es un acortador de URLs gratuito con seguimiento UTM y códigos QR integrados que nunca inserta una página de publicidad antes de redirigir. Si llegaste aquí después de ver un anuncio en uno de tus propios enlaces de Bitly, esta página compara — con números reales — qué ofrecen de verdad los principales planes gratuitos en 2026.",
    changedTitle: "Qué cambió en el plan gratuito de Bitly",
    changed:
      "El nivel gratuito de Bitly fue el acortador por defecto durante más de una década. Ese producto ya no existe en la misma forma: en 2026 el plan gratuito permite 5 enlaces nuevos y 2 códigos QR al mes, la analítica se limita al total de clics y — desde inicios de 2025 — los enlaces gratuitos muestran una página interstitial de vista previa que puede incluir publicidad antes de enviar al visitante a su destino. El cambio aplica retroactivamente a enlaces creados antes en cuentas gratuitas, y quitar la página de anuncios requiere un plan de pago. Nada de esto hace de Bitly un mal producto; hace del plan gratuito una prueba más que una herramienta.",
    tableTitle: "Planes gratuitos comparados (verificado julio 2026)",
    tableNote:
      "Los límites cambian seguido en este mercado — revisa siempre la página de precios de cada proveedor antes de decidir. Fuentes: las páginas de precios y soporte de cada servicio.",
    cols: { service: "Servicio", links: "Enlaces gratis / mes", ads: "Anuncios al redirigir", utm: "Herramientas UTM", qr: "Códigos QR", analytics: "Analítica gratis" },
    rows: [
      { service: "iny.one", links: "5 anónimos · 50 con cuenta gratis", ads: "Nunca", utm: "source, medium y campaign integrados", qr: "PNG gratis, sin marca de agua", analytics: "Clics, países, dispositivos, navegadores, referentes" },
      { service: "Bitly", links: "5", ads: "Sí (interstitial con publicidad)", utm: "En herramientas de pago", qr: "2 / mes", analytics: "Solo clics totales" },
      { service: "TinyURL", links: "Ilimitados (anónimo)", ads: "No", utm: "No", qr: "De pago", analytics: "Ninguna" },
      { service: "Short.io", links: "1.000 en total (requiere dominio propio)", ads: "No", utm: "Sí", qr: "Sí", analytics: "Hasta 50k clics medidos / mes" },
      { service: "Dub", links: "25", ads: "No", utm: "Sí", qr: "Sí", analytics: "Completa, orientada a developers" },
      { service: "Cuttly", links: "30", ads: "No", utm: "Generador UTM incluido", qr: "Sí", analytics: "Historial de 30 días" },
    ] as Row[],
    honestTitle: "Dónde encaja iny.one — y dónde no",
    honest:
      "La honestidad va en ambas direcciones. iny.one te sirve si quieres redirecciones limpias, etiquetado UTM y un código QR por enlace sin pagar ni ver anuncios: 50 enlaces al mes con cuenta gratuita cubren a la mayoría de creadores y campañas pequeñas, y el panel muestra países, dispositivos, navegadores y referentes. No es la herramienta correcta si necesitas dominios personalizados de marca (los enlaces viven en iny.one), decenas de miles de enlaces o asientos de equipo — para enlaces de marca en volumen, el nivel gratuito de Short.io es genuinamente generoso, y si eres developer y buscas stack open source, mira también Dub.",
    switchTitle: "Cambiarse en tres pasos",
    steps: [
      "Crea tu próximo enlace corto en la portada de iny.one — no necesitas cuenta para los primeros.",
      "Añade utm_source, utm_medium y utm_campaign en el mismo formulario para que la atribución en analítica siga funcionando.",
      "Reemplaza los enlaces antiguos donde tú los controles (bios, publicaciones, códigos QR impresos) — los enlaces bit.ly existentes siguen redirigiendo, pero en el plan gratuito muestran la página de anuncios.",
    ],
    faqTitle: "Preguntas frecuentes",
    faqs: [
      { q: "¿El plan gratuito de Bitly muestra anuncios?", a: "Sí — desde inicios de 2025 los enlaces del plan gratuito muestran una página interstitial de vista previa que puede incluir publicidad, incluidos los enlaces creados antes del cambio. Quitarla requiere un plan de pago." },
      { q: "¿iny.one muestra anuncios?", a: "No. Las redirecciones van directo al destino en todos los niveles, sin interstitial." },
      { q: "¿Cuántos enlaces gratis tengo en iny.one?", a: "5 al mes sin cuenta (expiran a los 180 días), o 50 al mes con cuenta gratuita — esos no expiran e incluyen la analítica completa." },
      { q: "¿Puedo migrar mis enlaces bit.ly existentes?", a: "Los códigos cortos no se pueden transferir entre dominios en ningún acortador. Los enlaces antiguos siguen funcionando; crea los nuevos aquí y reemplaza los enlaces donde tú los controles." },
    ],
    ctaHome: "Crea tu primer enlace corto sin anuncios",
    ctaUtm: "O empieza desde el generador UTM",
  },
} as const;

export default function BitlyAlternativePage() {
  const locale = useLocale() as "es" | "en";
  const t = content[locale] ?? content.en;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{t.h1}</h1>
          <p className="text-lg text-gray-600">{t.intro}</p>
        </div>

        <section className="mt-12 space-y-10 text-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.changedTitle}</h2>
            <p className="leading-relaxed">{t.changed}</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.tableTitle}</h2>
            <div className="overflow-x-auto rounded-lg shadow-sm">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-indigo-50 text-left text-gray-800">
                    <th scope="col" className="px-4 py-3 font-semibold">{t.cols.service}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.cols.links}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.cols.ads}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.cols.utm}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.cols.qr}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.cols.analytics}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((row) => (
                    <tr key={row.service} className="border-t border-gray-100 align-top">
                      <th scope="row" className="px-4 py-3 font-semibold text-left text-indigo-700 whitespace-nowrap">
                        {row.service}
                      </th>
                      <td className="px-4 py-3">{row.links}</td>
                      <td className="px-4 py-3">{row.ads}</td>
                      <td className="px-4 py-3">{row.utm}</td>
                      <td className="px-4 py-3">{row.qr}</td>
                      <td className="px-4 py-3">{row.analytics}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t.tableNote}</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.honestTitle}</h2>
            <p className="leading-relaxed">{t.honest}</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.switchTitle}</h2>
            <ol className="list-decimal list-inside space-y-2">
              {t.steps.map((s, i) => (
                <li key={i} className="leading-relaxed">{s}</li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.faqTitle}</h2>
            <div className="space-y-4">
              {t.faqs.map(({ q, a }) => (
                <div key={q}>
                  <h3 className="font-semibold text-gray-800">{q}</h3>
                  <p className="text-sm mt-1 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm space-x-4 pb-4">
            <Link prefetch={false} href={ROUTES.HOME} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t.ctaHome}
            </Link>
            <Link prefetch={false} href={ROUTES.UTM_BUILDER} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t.ctaUtm}
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
