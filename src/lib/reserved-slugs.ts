export const RESERVED_EXACT_SLUGS = new Set([
  // páginas públicas
  'about',
  'plans',
  'pricing',
  'features',
  'contact',
  'help',
  'support',
  'blog',
  'docs',
  'privacy',
  'terms',
  'cookies',
  'piscolas',

  // auth y app
  'auth',
  'login',
  'register',
  'logout',
  'callback',
  'dashboard',
  'settings',
  'account',
  'billing',
  'checkout',
  'cart',
  'profile',
  'admin',
  'studio',
  'u',

  // i18n
  'es',
  'en',

  // infraestructura
  'api',
  '_next',
  '.well-known',

  // archivos especiales
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'site.webmanifest',
  'manifest.webmanifest',
  'apple-touch-icon.png',
  'apple-touch-icon-precomposed.png',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
  'og-image.png',
  'bloom.bin',

  // comunes a futuro
  'app',
  'home',
  'index',
  'search',
  'explore',
  'new',
  'create',
  'edit',
  'delete',
  'update',
  'login-success',
  'signin',
  'signup',
  'signout',
  'auth-error',
]);

export const RESERVED_PREFIXES = [
  'api/',
  '_next/',
  '.well-known/',
  'auth/',
  'dashboard/',
  'admin/',
  'studio/',
  'u/',
  'cart/',
  'billing/',
  'account/',
  'settings/',
  'docs/',
  'blog/',
  'support/',
  'help/',
  'es/',
  'en/',
];

export const RESERVED_PATTERNS: RegExp[] = [
  /^\./,                    // ocultos .git .env etc
  /\/+/,                    // slash interno
  /\.\./,                   // traversal
  /%2f/i,                   // slash encoded
  /%5c/i,                   // backslash encoded
  /[?#]/,                   // query/hash en slug
  /\s/,                     // espacios
  /^[_-]+$/,                // solo guiones/underscores
  /^\d+$/,                  // solo números, opcional bloquear
  /^favicon$/i,
  /^robots$/i,
  /^sitemap$/i,
  /^manifest$/i,
  /^www$/i,
  /^null$/i,
  /^undefined$/i,
  /^admin\d*$/i,
  /^api\d*$/i,
  /^root$/i,
  /^system$/i,
];

export function normalizeSlug(input: string): string {
  return decodeURIComponent(input).trim().toLowerCase().replace(/^\/+|\/+$/g, '');
}

export function isReservedSlug(input: string): boolean {
  const slug = normalizeSlug(input);

  if (!slug) return true;
  if (RESERVED_EXACT_SLUGS.has(slug)) return true;
  if (RESERVED_PREFIXES.some((prefix) => slug.startsWith(prefix))) return true;
  if (RESERVED_PATTERNS.some((pattern) => pattern.test(slug))) return true;

  return false;
}

export function getReservedSlugReason(input: string): string | null {
  const slug = normalizeSlug(input);

  if (!slug) return 'Slug vacío';
  if (RESERVED_EXACT_SLUGS.has(slug)) return 'Slug reservado por el sistema';
  if (RESERVED_PREFIXES.some((prefix) => slug.startsWith(prefix))) return 'Slug bajo prefijo reservado';
  if (RESERVED_PATTERNS.some((pattern) => pattern.test(slug))) return 'Slug inválido o riesgoso';

  return null;
}
