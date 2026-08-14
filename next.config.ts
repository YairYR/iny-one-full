import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy
 *
 * `script-src` incluye `'unsafe-inline'` porque hoy el sitio emite scripts en
 * línea: el bootstrap de gtag en el layout raíz y un bloque JSON-LD por landing.
 * Endurecerlo exige un nonce por petición generado en el middleware y propagado
 * a cada uno de esos `<script>`; queda como siguiente paso, no como parte de
 * este cambio.
 *
 * Aun con esa concesión, la directiva aporta lo que hoy falta: restringe de qué
 * orígenes se puede cargar código, bloquea `object-src`, fija `base-uri` y
 * `form-action`, y declara `frame-ancestors` (la versión moderna de
 * X-Frame-Options, que se mantiene por compatibilidad con navegadores antiguos).
 *
 * Poner `CSP_REPORT_ONLY=true` publica la política como `Report-Only`, lo que
 * permite validarla en producción sin romper nada antes de aplicarla.
 */
const supabaseOrigin = safeOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);

const PAYPAL_ORIGINS = ["https://www.paypal.com", "https://www.sandbox.paypal.com"];
/**
 * GA4 no manda la medición a www.google-analytics.com. Verificado en la consola
 * de producción el 2026-08-14: el `page_view` sale a
 * `https://analytics.google.com/g/collect`, y al no estar en `connect-src` el
 * navegador lo bloqueaba. Ese era el motivo de que GA4 no registrara visitas.
 *
 * El síntoma es engañoso y conviene recordarlo: gtag.js carga sin problemas
 * —está en `script-src`— así que «el tag está puesto» y aun así no llega nada.
 * El único sitio donde se ve es la consola; un HAR no exporta las peticiones
 * que la CSP corta antes de la capa de red.
 *
 * `*.google-analytics.com` cubre los endpoints regionales documentados
 * (region1…region9), que no aparecieron en esta prueba pero sí se usan en otras
 * regiones. Es precaución, no un host observado. Ojo: en CSP el comodín NO
 * cubre el dominio desnudo, por eso están las dos formas.
 *
 * Deliberadamente FUERA: stats.g.doubleclick.net, www.google.com/g/collect y
 * www.google.<tld>/ads/ga-audiences. Son de Google Signals (demografía y
 * remarketing), no de los informes estándar, y sólo se disparan con Signals
 * activo. Se desactiva en GA4 en lugar de meter dominios de ad-tech en la
 * allowlist. El último además va al dominio de Google del país de cada
 * visitante, así que no hay lista finita que lo cubra.
 */
const ANALYTICS_SCRIPT_ORIGINS = ["https://www.googletagmanager.com"];

const ANALYTICS_ORIGINS = [
  ...ANALYTICS_SCRIPT_ORIGINS,
  "https://analytics.google.com",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
];

const contentSecurityPolicy = [
  ["default-src", "'self'"],
  // 'unsafe-eval' sólo en desarrollo: lo necesita react-refresh.
  ["script-src", "'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...ANALYTICS_SCRIPT_ORIGINS, ...PAYPAL_ORIGINS],
  ["style-src", "'self'", "'unsafe-inline'"],
  ["img-src", "'self'", "data:", "blob:", "https://lh3.googleusercontent.com", ...ANALYTICS_ORIGINS, ...PAYPAL_ORIGINS],
  ["font-src", "'self'", "data:"],
  ["connect-src", "'self'", ...supabaseConnectSources(supabaseOrigin), ...ANALYTICS_ORIGINS, ...PAYPAL_ORIGINS],
  ["frame-src", "'self'", ...PAYPAL_ORIGINS],
  ["worker-src", "'self'", "blob:"],
  ["manifest-src", "'self'"],
  ["frame-ancestors", "'self'"],
  ["base-uri", "'self'"],
  ["form-action", "'self'"],
  ["object-src", "'none'"],
  ...(isDev ? [] : [["upgrade-insecure-requests"]]),
]
  .map((directive) => directive.join(" "))
  .join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
  },
  {
    key: process.env.CSP_REPORT_ONLY === "true"
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
];

/** Origen de una URL, o `null` si la variable falta o no es una URL válida. */
function safeOrigin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** Supabase usa HTTPS para REST/Auth y WSS para Realtime. */
function supabaseConnectSources(origin: string | null): string[] {
  if (!origin) return [];
  return [origin, origin.replace(/^https:/, "wss:")];
}

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  allowedDevOrigins: [ "iny-tests.one", "iny.local" ],

  images: {
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/es/:path*",
        locale: false,
        headers: [
          {
            key: "Content-Language",
            value: "es",
          },
        ],
      },
      {
        source: "/en/:path*",
        locale: false,
        headers: [
          {
            key: "Content-Language",
            value: "en",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.iny.one",
          },
        ],
        destination: "https://iny.one/:path*",
        permanent: true,
      },

      {
        source: "/ui",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ui/about",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/ui/piscolas",
        destination: "/piscolas",
        permanent: true,
      },
      {
        source: "/ui/cart",
        destination: "/cart",
        permanent: true,
      },
      {
        source: "/ui/plans",
        destination: "/plans",
        permanent: true,
      },

      {
        source: "/ui/auth/login",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/ui/auth/register",
        destination: "/auth/register",
        permanent: true,
      },
      {
        source: "/ui/auth/callback",
        destination: "/auth/callback",
        permanent: true,
      },

      {
        source: "/ui/dashboard/:path*",
        destination: "/dashboard/:path*",
        permanent: true,
      },
      {
        source: "/ui/dashboard",
        destination: "/dashboard",
        permanent: true,
      },

      {
        source: "/bloom.bin",
        destination: "/favicon.ico",
        permanent: false,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/",
        destination: "/ui",
      },
      {
        source: "/about",
        destination: "/ui/about",
      },
      {
        source: "/piscolas",
        destination: "/ui/piscolas",
      },
      {
        source: "/cart",
        destination: "/ui/cart",
      },
      {
        source: "/plans",
        destination: "/ui/plans",
      },
      {
        source: "/utm-builder",
        destination: "/ui/utm-builder",
      },
      {
        source: "/qr-code-generator",
        destination: "/ui/qr-code-generator",
      },
      {
        source: "/bitly-alternative",
        destination: "/ui/bitly-alternative",
      },
      {
        source: "/url-shortener-api",
        destination: "/ui/url-shortener-api",
      },

      // Versión en español con URLs propias (/es/*).
      // El middleware inyecta x-iny-locale=es y las mismas páginas de /ui
      // renderizan contenido y metadata en español con canonical /es/...
      {
        source: "/es",
        destination: "/ui",
      },
      {
        source: "/es/about",
        destination: "/ui/about",
      },
      {
        source: "/es/plans",
        destination: "/ui/plans",
      },
      {
        source: "/es/utm-builder",
        destination: "/ui/utm-builder",
      },
      {
        source: "/es/qr-code-generator",
        destination: "/ui/qr-code-generator",
      },
      {
        source: "/es/bitly-alternative",
        destination: "/ui/bitly-alternative",
      },
      {
        source: "/es/url-shortener-api",
        destination: "/ui/url-shortener-api",
      },

      {
        source: "/auth/login",
        destination: "/ui/auth/login",
      },
      {
        source: "/auth/register",
        destination: "/ui/auth/register",
      },
      {
        source: "/auth/callback",
        destination: "/ui/auth/callback",
      },

      {
        source: "/dashboard/:path*",
        destination: "/ui/dashboard/:path*",
      },
      {
        source: "/dashboard",
        destination: "/ui/dashboard",
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./data/lang/en.json",
  },
});

export default withNextIntl(nextConfig);
