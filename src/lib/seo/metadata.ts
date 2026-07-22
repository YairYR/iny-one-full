import { type Metadata } from "next";

const BASE_URL = "https://iny.one";

export type SiteLocale = "en" | "es";

/** Normaliza el locale de next-intl ("es-CL", "en-US", ...) a los dos soportados. */
export function normalizeLocale(locale: string | undefined | null): SiteLocale {
  return locale?.toLowerCase().startsWith("es") ? "es" : "en";
}

/**
 * URL pública absoluta de una ruta en un locale.
 * La versión en español vive bajo /es/... con URLs propias.
 */
export function localizedUrl(path: string, locale: SiteLocale): string {
  const clean = path === "/" ? "" : path;
  return locale === "es" ? `${BASE_URL}/es${clean}` : `${BASE_URL}${clean}` || BASE_URL;
}

/**
 * Construye el bloque `alternates` con canonical + hreflang para una ruta bilingüe.
 *
 *   - canonical: la URL del locale que se está sirviendo
 *   - hreflang "en"        → URL sin prefijo (https://iny.one/ruta)
 *   - hreflang "es"        → https://iny.one/es/ruta
 *   - hreflang "x-default" → URL sin prefijo (fallback internacional)
 *
 * Cada versión de idioma tiene su propia URL, que es lo que Google requiere
 * para indexar ambas (la negociación por Accept-Language sobre una sola URL
 * dejaba la versión ES invisible para el crawler).
 */
export function buildAlternates(
  path: string,
  locale: SiteLocale = "en",
): Metadata["alternates"] {
  return {
    canonical: localizedUrl(path, locale),
    languages: {
      en: localizedUrl(path, "en"),
      es: localizedUrl(path, "es"),
      "x-default": localizedUrl(path, "en"),
    },
  };
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  locale?: SiteLocale;
  images?: string[];
}

/**
 * Helper de alto nivel: arma title, description, alternates (con hreflang),
 * OpenGraph y Twitter de forma consistente para cualquier página bilingüe.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  locale = "en",
  images = ["/og-image.png"],
}: PageMetaInput): Metadata {
  const url = localizedUrl(path, locale);
  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      title,
      description,
      url,
      siteName: "iny.one",
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
