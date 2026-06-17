import { type Metadata } from "next";

const BASE_URL = "https://iny.one";

/**
 * Construye el bloque `alternates` con canonical + hreflang para una ruta.
 *
 * iny.one sirve contenido en/es según accept-language sobre las mismas URLs
 * (sin prefijo de locale), por lo que se declara:
 *   - hreflang="en" y hreflang="es" apuntando a la misma URL
 *   - hreflang="x-default" como fallback
 *
 * Esto le indica a Google que la URL es multilingüe y evita que sirva la
 * versión equivocada por región.
 */
export function buildAlternates(path: string): Metadata["alternates"] {
  const url = path === "/" ? BASE_URL : `${BASE_URL}${path}`;
  return {
    canonical: url,
    languages: {
      en: url,
      es: url,
      "x-default": url,
    },
  };
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  images?: string[];
}

/**
 * Helper de alto nivel: arma title, description, alternates (con hreflang),
 * OpenGraph y Twitter de forma consistente para cualquier página.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  images = ["/og-image.png"],
}: PageMetaInput): Metadata {
  const url = path === "/" ? BASE_URL : `${BASE_URL}${path}`;
  return {
    title,
    description,
    alternates: buildAlternates(path),
    openGraph: {
      title,
      description,
      url,
      siteName: "iny.one",
      type: "website",
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
