import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { useLocale } from "next-intl";
import Link from "next/link";
import PricingCards from "@/components/PricingCards";
import { useTranslations } from "next-intl";
import {PAYPAL_CONFIG} from "@/lib/paypal-client";
import {PayPalProvider} from "@paypal/react-paypal-js/sdk-v6";
import { ROUTES } from "@/lib/routes";
import { buildPageMetadata, normalizeLocale } from "@/lib/seo/metadata";

const META = {
  en: {
    title: "Plans & Pricing — Free URL Shortener with UTM | iny.one",
    description:
      "Start free: 50 short links per month with a free account, UTM tracking, QR codes and click analytics. Upgrade for higher limits and extra UTM parameters. No ads on any plan.",
  },
  es: {
    title: "Planes y precios — Acortador de URLs con UTM | iny.one",
    description:
      "Empieza gratis: 50 enlaces cortos al mes con cuenta gratuita, seguimiento UTM, códigos QR y analítica de clics. Mejora tu plan para más límites y parámetros UTM extra. Sin anuncios en ningún plan.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale());
  const m = META[locale];

  return buildPageMetadata({
    title: m.title,
    description: m.description,
    path: ROUTES.PLANS,
    locale,
  });
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does iny.one show ads on short links?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. iny.one never inserts an advertising page before redirecting, on any plan — including the free and anonymous tiers.",
      },
    },
    {
      "@type": "Question",
      name: "Do iny.one short links expire?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Links created without an account expire after 180 days. Links created with any account (including the free plan) do not expire.",
      },
    },
    {
      "@type": "Question",
      name: "How many links can I create for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Without an account: 5 links per month. With a free account: 50 links per month, plus the analytics dashboard with clicks, countries, devices, browsers and referrers.",
      },
    },
    {
      "@type": "Question",
      name: "Which UTM parameters does each plan support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Free plans support utm_source, utm_medium and utm_campaign. Basic adds utm_content and utm_term. Pro adds utm_id on top of all the others.",
      },
    },
  ],
};

const content = {
  en: {
    h1: "Plans & Pricing",
    intro:
      "Every iny.one plan — including the free one — shortens URLs with UTM tracking and QR codes, and never inserts an ad page before redirecting. Paid plans raise your monthly limits and unlock extra UTM parameters.",
    limitsTitle: "What each tier includes",
    limits: [
      {
        name: "Anonymous (no account)",
        desc: "5 links per month, utm_source / utm_medium / utm_campaign, free QR code per link. Links expire after 180 days.",
      },
      {
        name: "Free account",
        desc: "50 links per month that never expire, plus the full dashboard: total and unique clicks, top countries, devices, browsers and referrers.",
      },
      {
        name: "Basic",
        desc: "1,000 links per month and two extra UTM parameters: utm_content and utm_term — for A/B testing creatives and paid keywords.",
      },
      {
        name: "Pro",
        desc: "10,000 links per month and utm_id support for ads platforms, on top of everything in Basic.",
      },
    ],
    faqTitle: "Pricing FAQ",
    faqs: [
      {
        q: "Does iny.one show ads on short links?",
        a: "No. There is no advertising interstitial before the redirect on any plan, free or paid.",
      },
      {
        q: "Do short links expire?",
        a: "Anonymous links expire after 180 days. Links created with any account — including the free plan — do not expire.",
      },
      {
        q: "Can I start without a credit card?",
        a: "Yes. Shortening works without an account, and the free account only requires signing in with Google.",
      },
      {
        q: "Which UTM parameters does each plan support?",
        a: "Free tiers: utm_source, utm_medium, utm_campaign. Basic adds utm_content and utm_term. Pro adds utm_id.",
      },
    ],
    ctaTools: "Try the tools first:",
    ctaShortener: "URL shortener",
    ctaUtm: "UTM builder",
    ctaQr: "QR code generator",
  },
  es: {
    h1: "Planes y precios",
    intro:
      "Todos los planes de iny.one — incluido el gratuito — acortan URLs con seguimiento UTM y códigos QR, y nunca insertan una página de anuncios antes de redirigir. Los planes de pago suben tus límites mensuales y desbloquean parámetros UTM adicionales.",
    limitsTitle: "Qué incluye cada nivel",
    limits: [
      {
        name: "Anónimo (sin cuenta)",
        desc: "5 enlaces al mes, utm_source / utm_medium / utm_campaign y código QR gratis por enlace. Los enlaces expiran a los 180 días.",
      },
      {
        name: "Cuenta gratuita",
        desc: "50 enlaces al mes que no expiran, más el panel completo: clics totales y únicos, países, dispositivos, navegadores y referentes.",
      },
      {
        name: "Basic",
        desc: "1.000 enlaces al mes y dos parámetros UTM extra: utm_content y utm_term — para testear creatividades y keywords de pago.",
      },
      {
        name: "Pro",
        desc: "10.000 enlaces al mes y soporte de utm_id para plataformas de anuncios, además de todo lo de Basic.",
      },
    ],
    faqTitle: "Preguntas frecuentes sobre planes",
    faqs: [
      {
        q: "¿iny.one muestra anuncios en los enlaces cortos?",
        a: "No. No hay interstitial publicitario antes de la redirección en ningún plan, gratuito o de pago.",
      },
      {
        q: "¿Los enlaces cortos expiran?",
        a: "Los enlaces anónimos expiran a los 180 días. Los creados con cualquier cuenta — incluida la gratuita — no expiran.",
      },
      {
        q: "¿Puedo empezar sin tarjeta de crédito?",
        a: "Sí. Acortar funciona sin cuenta, y la cuenta gratuita solo requiere iniciar sesión con Google.",
      },
      {
        q: "¿Qué parámetros UTM soporta cada plan?",
        a: "Niveles gratuitos: utm_source, utm_medium, utm_campaign. Basic añade utm_content y utm_term. Pro añade utm_id.",
      },
    ],
    ctaTools: "Prueba primero las herramientas:",
    ctaShortener: "Acortador de URLs",
    ctaUtm: "Generador UTM",
    ctaQr: "Generador de códigos QR",
  },
} as const;

export default function PlansPage() {
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

      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center p-6">
        <div className="max-w-2xl text-center mt-6 mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">{t.h1}</h1>
          <p className="text-lg text-gray-600">{t.intro}</p>
        </div>

        <PricingCards logged={false} />

        <section className="max-w-2xl w-full mt-14 space-y-10 text-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.limitsTitle}</h2>
            <dl className="space-y-3">
              {t.limits.map(({ name, desc }) => (
                <div key={name} className="bg-white rounded-lg p-4 shadow-sm">
                  <dt className="font-semibold text-indigo-600">{name}</dt>
                  <dd className="text-sm mt-1 leading-relaxed">{desc}</dd>
                </div>
              ))}
            </dl>
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

          <p className="text-sm pb-8">
            {t.ctaTools}{" "}
            <Link prefetch={false} href={ROUTES.HOME} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t.ctaShortener}
            </Link>
            {" · "}
            <Link prefetch={false} href={ROUTES.UTM_BUILDER} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t.ctaUtm}
            </Link>
            {" · "}
            <Link prefetch={false} href={ROUTES.QR_GENERATOR} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t.ctaQr}
            </Link>
          </p>
        </section>
      </div>
    </>
    /*
    <PayPalProvider {...PAYPAL_CONFIG}>
      <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-3xl font-bold mb-10 text-gray-800">{t("title")}</h2>
        <PricingCards logged={false} />
      </div>
    </PayPalProvider>
    */
  );
}
