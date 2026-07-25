import { type MetadataRoute } from 'next';

const BASE_URL = 'https://iny.one';

const enUrl = (path: string) => (path === '/' ? BASE_URL : `${BASE_URL}${path}`);
const esUrl = (path: string) => (path === '/' ? `${BASE_URL}/es` : `${BASE_URL}/es${path}`);

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

interface BilingualEntry {
  path: string;
  /**
   * Fecha literal por ruta: actualizar SOLO cuando el contenido de la página
   * cambie de verdad. (Antes se usaba `new Date()` en cada build, lo que
   * marcaba todas las URLs como "modificadas hoy" y degrada la señal lastmod.)
   */
  lastModified: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

const BILINGUAL_PAGES: BilingualEntry[] = [
  { path: '/', lastModified: '2026-07-21', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/utm-builder', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/qr-code-generator', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/bitly-alternative', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/url-shortener-api', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/plans', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about', lastModified: '2026-07-21', changeFrequency: 'monthly', priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const bilingual: MetadataRoute.Sitemap = BILINGUAL_PAGES.flatMap((entry) => {
    const languages = {
      en: enUrl(entry.path),
      es: esUrl(entry.path),
    };

    return (['en', 'es'] as const).map((locale) => ({
      url: locale === 'es' ? esUrl(entry.path) : enUrl(entry.path),
      lastModified: new Date(entry.lastModified),
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: { languages },
    }));
  });

  return [
    ...bilingual,
    // Página solo en español (canonical sin prefijo, se mantiene su URL histórica)
    {
      url: `${BASE_URL}/piscolas`,
      lastModified: new Date('2026-07-21'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
