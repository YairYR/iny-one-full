'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { isLocalizedPath, localizedPath } from '@/i18n/routes';

/**
 * Selector de idioma con enlaces <a> reales (crawleables), no un dropdown JS.
 * SEO: da a Googlebot un camino de descubrimiento entre la URL en inglés y su
 * equivalente /es/... desde cualquier página, complementando el hreflang.
 */
export default function LanguageSwitcher() {
  const pathname = usePathname() || '/';
  const isEs = useLocale() === 'es';
  const canLocalize = isLocalizedPath(pathname);
  const technical = pathname.startsWith('/auth/') || pathname === '/cart';
  const enHref = canLocalize ? localizedPath(pathname, 'en') : technical ? `${pathname}?lang=en` : '/';
  const esHref = canLocalize ? localizedPath(pathname, 'es') : technical ? `${pathname}?lang=es` : '/es';

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
