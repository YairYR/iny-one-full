import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { useLocale } from "next-intl";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { buildPageMetadata, normalizeLocale } from "@/lib/seo/metadata";

const META = {
  en: {
    title: "Free URL Shortener API — Create Short Links with One POST | iny.one",
    description:
      "Shorten URLs programmatically with a single JSON POST to https://iny.one/api/v1/shorten. Free tier, UTM parameters built in, JSON responses, no API key required to start.",
  },
  es: {
    title: "API de acortador de URLs gratis — crea enlaces con un POST | iny.one",
    description:
      "Acorta URLs por código con un solo POST JSON a https://iny.one/api/v1/shorten. Nivel gratuito, parámetros UTM integrados, respuestas JSON y sin API key para empezar.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = normalizeLocale(await getLocale());
  const m = META[locale];

  return {
    ...buildPageMetadata({
      title: m.title,
      description: m.description,
      path: ROUTES.API_DOCS,
      locale,
    }),
    keywords: [
      "url shortener api",
      "free url shortener api",
      "link shortener api",
      "shorten url api free",
      "api acortador de url",
      "api acortar enlaces",
    ],
    robots: { index: true, follow: true },
  };
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebAPI",
      "@id": "https://iny.one/url-shortener-api#api",
      name: "iny.one URL Shortener API",
      description:
        "REST endpoint that shortens a URL with optional UTM parameters and returns a JSON response with the short link.",
      documentation: "https://iny.one/url-shortener-api",
      provider: { "@id": "https://iny.one/#organization" },
      termsOfService: "https://iny.one/about",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is the iny.one API free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, within the same limits as the web app: 5 links per month per IP without an account, 50 per month with a free account, and up to 1,000 or 10,000 per month on the Basic and Pro plans.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need an API key?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No key is required for anonymous use. Authenticated calls currently reuse the same session as the web app; dedicated API keys are on the roadmap.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a GET endpoint like /shorten?url=...?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. The API accepts POST requests with a JSON body only, which keeps destination URLs and UTM values out of server logs and referrer headers.",
          },
        },
        {
          "@type": "Question",
          name: "Do API-created links expire?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Links created without an account expire after 180 days. Links created while authenticated do not expire.",
          },
        },
      ],
    },
  ],
};

const CURL_EXAMPLE = `curl -X POST https://iny.one/api/v1/shorten \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/landing",
    "utm": {
      "source": "newsletter",
      "medium": "email",
      "campaign": "july_launch"
    }
  }'`;

const FETCH_EXAMPLE = `const res = await fetch("https://iny.one/api/v1/shorten", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://example.com/landing",
    utm: { source: "newsletter", medium: "email", campaign: "july_launch" },
  }),
});

const json = await res.json();
// json.data.short -> "https://iny.one/abc1234"`;

const RESPONSE_EXAMPLE = `{
  "success": true,
  "data": {
    "short": "https://iny.one/abc1234"
  },
  "meta": {
    "requestId": "3f6f4c1e-…",
    "timestamp": "2026-07-21T12:00:00.000Z"
  }
}`;

const ERROR_EXAMPLE = `{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "…",
    "status": 429,
    "type": "…"
  },
  "meta": { "requestId": "…", "timestamp": "…" }
}`;

function CodeBlock({ code, label }: Readonly<{ code: string; label: string }>) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{label}</p>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const content = {
  en: {
    h1: "URL Shortener API",
    intro:
      "Create iny.one short links from your own scripts, backends or automations with a single JSON POST. The API applies the same UTM tagging, safety screening and analytics as the web shortener — and, like everything else here, it never puts an ad page in front of your visitors.",
    endpointTitle: "Endpoint",
    endpointDesc:
      "One endpoint does the work. Send the destination URL plus a utm object with source, medium and campaign; pass empty strings for any UTM field you don't want to tag.",
    requestTitle: "Request",
    fields: [
      { name: "url", type: "string · required", desc: "Destination URL. http(s) only; bare domains get https:// added. IP addresses and iny.one itself are rejected." },
      { name: "utm.source", type: "string · required (may be empty)", desc: "Where the traffic comes from, e.g. newsletter, google. Sanitized to letters, numbers, hyphens and underscores." },
      { name: "utm.medium", type: "string · required (may be empty)", desc: "Channel type, e.g. email, cpc, social." },
      { name: "utm.campaign", type: "string · required (may be empty)", desc: "Campaign name, e.g. july_launch." },
    ],
    responseTitle: "Response",
    responseDesc:
      "Successful calls return HTTP 200 with the short link in data.short. Validation problems return 422, and hitting your monthly quota returns 429 — both with the same error envelope.",
    limitsTitle: "Rate limits",
    limits: [
      { tier: "Anonymous (per IP)", limit: "5 links / month", note: "Links expire after 180 days" },
      { tier: "Free account", limit: "50 links / month", note: "Links never expire; dashboard analytics included" },
      { tier: "Basic", limit: "1,000 links / month", note: "Adds utm_content and utm_term" },
      { tier: "Pro", limit: "10,000 links / month", note: "Adds utm_id" },
    ],
    limitsCols: { tier: "Tier", limit: "Limit", note: "Notes" },
    notesTitle: "Good to know",
    notes: [
      "POST with a JSON body only — there is no GET /shorten?url= endpoint, so destinations never leak into logs or referrers.",
      "Destination domains are screened against a blocklist of unsafe domains before a link is created.",
      "Authenticated calls currently reuse the web session (cookies). Dedicated API keys are on the roadmap.",
      "Redirects respond with an HTTP 307 and are excluded from search indexing, so your destination page keeps the SEO signals.",
    ],
    faqTitle: "API FAQ",
    faqs: [
      { q: "Is the API free?", a: "Yes, within the same monthly limits as the web app — see the table above. No credit card needed for the anonymous and free tiers." },
      { q: "Do I need an API key?", a: "Not for anonymous use. Dedicated API keys are planned; today authenticated calls use the same session as the web app." },
      { q: "Is there a GET endpoint?", a: "No — JSON POST only. It keeps URLs and UTM values out of server logs and referrer headers." },
      { q: "Do API links expire?", a: "Anonymous links expire after 180 days; links created while signed in don't expire." },
    ],
    ctaPlans: "Need more volume? Compare plans",
    ctaHome: "Prefer the web form? Shorten a URL",
  },
  es: {
    h1: "API del acortador de URLs",
    intro:
      "Crea enlaces cortos de iny.one desde tus propios scripts, backends o automatizaciones con un solo POST JSON. La API aplica el mismo etiquetado UTM, la misma revisión de seguridad y la misma analítica que el acortador web — y, como todo aquí, nunca pone una página de anuncios delante de tus visitantes.",
    endpointTitle: "Endpoint",
    endpointDesc:
      "Un solo endpoint hace el trabajo. Envía la URL de destino más un objeto utm con source, medium y campaign; pasa strings vacíos en los campos UTM que no quieras etiquetar.",
    requestTitle: "Request",
    fields: [
      { name: "url", type: "string · requerido", desc: "URL de destino. Solo http(s); a los dominios sin protocolo se les añade https://. Se rechazan direcciones IP e iny.one mismo." },
      { name: "utm.source", type: "string · requerido (puede ir vacío)", desc: "De dónde viene el tráfico, p. ej. newsletter, google. Se sanitiza a letras, números, guiones y guiones bajos." },
      { name: "utm.medium", type: "string · requerido (puede ir vacío)", desc: "Tipo de canal, p. ej. email, cpc, social." },
      { name: "utm.campaign", type: "string · requerido (puede ir vacío)", desc: "Nombre de campaña, p. ej. lanzamiento_julio." },
    ],
    responseTitle: "Respuesta",
    responseDesc:
      "Las llamadas exitosas devuelven HTTP 200 con el enlace corto en data.short. Los problemas de validación devuelven 422, y alcanzar tu cuota mensual devuelve 429 — ambos con el mismo formato de error.",
    limitsTitle: "Límites de uso",
    limits: [
      { tier: "Anónimo (por IP)", limit: "5 enlaces / mes", note: "Los enlaces expiran a los 180 días" },
      { tier: "Cuenta gratuita", limit: "50 enlaces / mes", note: "Los enlaces no expiran; incluye panel de analítica" },
      { tier: "Basic", limit: "1.000 enlaces / mes", note: "Añade utm_content y utm_term" },
      { tier: "Pro", limit: "10.000 enlaces / mes", note: "Añade utm_id" },
    ],
    limitsCols: { tier: "Nivel", limit: "Límite", note: "Notas" },
    notesTitle: "Bueno saberlo",
    notes: [
      "Solo POST con cuerpo JSON — no existe un endpoint GET /shorten?url=, así los destinos no se filtran en logs ni referrers.",
      "Los dominios de destino se revisan contra una lista de dominios inseguros antes de crear el enlace.",
      "Las llamadas autenticadas hoy reutilizan la sesión web (cookies). Las API keys dedicadas están en el roadmap.",
      "Las redirecciones responden con HTTP 307 y quedan excluidas del índice de búsqueda, así tu página de destino conserva las señales SEO.",
    ],
    faqTitle: "Preguntas frecuentes del API",
    faqs: [
      { q: "¿La API es gratis?", a: "Sí, dentro de los mismos límites mensuales que la app web — mira la tabla de arriba. Sin tarjeta para los niveles anónimo y gratuito." },
      { q: "¿Necesito una API key?", a: "No para uso anónimo. Las API keys dedicadas están planificadas; hoy las llamadas autenticadas usan la misma sesión que la web." },
      { q: "¿Hay endpoint GET?", a: "No — solo POST JSON. Así las URLs y los valores UTM no quedan en logs ni referrers." },
      { q: "¿Los enlaces creados por API expiran?", a: "Los anónimos expiran a los 180 días; los creados con sesión iniciada no expiran." },
    ],
    ctaPlans: "¿Necesitas más volumen? Compara planes",
    ctaHome: "¿Prefieres el formulario web? Acorta una URL",
  },
} as const;

export default function UrlShortenerApiPage() {
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.endpointTitle}</h2>
            <p className="leading-relaxed mb-3">{t.endpointDesc}</p>
            <p className="bg-white rounded-lg p-4 shadow-sm font-mono text-sm">
              <span className="font-semibold text-indigo-600">POST</span>{" "}
              https://iny.one/api/v1/shorten
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.requestTitle}</h2>
            <dl className="space-y-3 mb-6">
              {t.fields.map(({ name, type, desc }) => (
                <div key={name} className="bg-white rounded-lg p-4 shadow-sm">
                  <dt className="font-mono text-sm font-semibold text-indigo-600">
                    {name} <span className="text-gray-400 font-normal">— {type}</span>
                  </dt>
                  <dd className="text-sm mt-1">{desc}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-4">
              <CodeBlock label="cURL" code={CURL_EXAMPLE} />
              <CodeBlock label="JavaScript (fetch)" code={FETCH_EXAMPLE} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.responseTitle}</h2>
            <p className="leading-relaxed mb-3">{t.responseDesc}</p>
            <div className="space-y-4">
              <CodeBlock label="200 OK" code={RESPONSE_EXAMPLE} />
              <CodeBlock label="422 / 429" code={ERROR_EXAMPLE} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.limitsTitle}</h2>
            <div className="overflow-x-auto rounded-lg shadow-sm">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-indigo-50 text-left text-gray-800">
                    <th scope="col" className="px-4 py-3 font-semibold">{t.limitsCols.tier}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.limitsCols.limit}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.limitsCols.note}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.limits.map((row) => (
                    <tr key={row.tier} className="border-t border-gray-100 align-top">
                      <th scope="row" className="px-4 py-3 font-semibold text-left text-indigo-700 whitespace-nowrap">
                        {row.tier}
                      </th>
                      <td className="px-4 py-3 whitespace-nowrap">{row.limit}</td>
                      <td className="px-4 py-3">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t.notesTitle}</h2>
            <ul className="list-disc list-inside space-y-2">
              {t.notes.map((n, i) => (
                <li key={i} className="leading-relaxed">{n}</li>
              ))}
            </ul>
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
            <Link prefetch={false} href={ROUTES.PLANS} className="text-indigo-600 hover:text-indigo-800 font-medium">
              {t.ctaPlans}
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
