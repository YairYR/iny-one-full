'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Rutas que existen en ambos idiomas (la versión ES vive bajo /es/...).
 * Mantener en sync con los rewrites de next.config.ts.
 */
const LOCALIZABLE = new Set([
  '/',
  '/about',
  '/plans',
  '/utm-builder',
  '/qr-code-generator',
  '/bitly-alternative',
  '/url-shortener-api',
]);

/**
 * Selector de idioma con enlaces <a> reales (crawleables), no un dropdown JS.
 * SEO: da a Googlebot un camino de descubrimiento entre la URL en inglés y su
 * equivalente /es/... desde cualquier página, complementando el hreflang.
 */
export default function LanguageSwitcher() {
  const pathname = usePathname() || '/';

  const isEs = pathname === '/es' || pathname.startsWith('/es/');
  const basePath = isEs ? (pathname === '/es' ? '/' : pathname.slice(3)) : pathname;
  const canLocalize = LOCALIZABLE.has(basePath);

  const enHref = canLocalize ? basePath : '/';
  const esHref = canLocalize ? (basePath === '/' ? '/es' : `/es${basePath}`) : '/es';

  const activeCls = 'font-semibold text-gray-700';
  const idleCls = 'text-gray-400 hover:text-indigo-600 transition-colors';

  return (
    <p className="text-center mt-8 text-xs">
      <Link prefetch={false} href={enHref} hrefLang="en" lang="en" className={isEs ? idleCls : activeCls}>
        English
      </Link>
      <span className="mx-2 text-gray-300">·</span>
      <Link prefetch={false} href={esHref} hrefLang="es" lang="es" className={isEs ? activeCls : idleCls}>
        Español
      </Link>
    </p>
  );
}
