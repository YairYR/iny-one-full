'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { isLocalizedPath, localizedPath } from '@/i18n/routes';

/**
 * Selector de idioma con enlaces <a> reales (crawleables), no un dropdown JS.
 * SEO: da a Googlebot un camino de descubrimiento entre la URL en inglés y su
 * equivalente /es/... desde cualquier página, complementando el hreflang.
 */
export default function LanguageSwitcher({ placement = 'footer' }: Readonly<{ placement?: 'footer' | 'nav' }>) {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const t = useTranslations('Navigation');
  const isEs = useLocale() === 'es';
  const canLocalize = isLocalizedPath(pathname);
  const technical = pathname.startsWith('/auth/') || pathname === '/cart';
  const hrefFor = (locale: 'en' | 'es') => {
    const base = canLocalize ? localizedPath(pathname, locale) : technical ? pathname : locale === 'es' ? '/es' : '/';
    const params = new URLSearchParams(canLocalize || technical ? searchParams.toString() : '');
    params.delete('lang');
    if (technical || (base === '/' && locale === 'en' && isEs)) params.set('lang', locale);
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  };
  const nav = placement === 'nav';
  const activeCls = nav ? 'font-semibold text-white' : 'font-semibold text-gray-700';
  const idleCls = nav ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-indigo-600';
  const linkCls = 'rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';

  return (
    <div role="group" aria-label={t('language')} className={nav ? 'flex items-center whitespace-nowrap text-xs sm:text-sm' : 'mt-8 text-center text-xs'}>
      <a href={hrefFor('en')} hrefLang="en" lang="en" aria-current={!isEs ? 'true' : undefined} className={`${linkCls} ${isEs ? idleCls : activeCls}`}>
        English
      </a>
      <span aria-hidden="true" className={nav ? 'mx-2 text-gray-400' : 'mx-2 text-gray-300'}>·</span>
      <a href={hrefFor('es')} hrefLang="es" lang="es" aria-current={isEs ? 'true' : undefined} className={`${linkCls} ${isEs ? activeCls : idleCls}`}>
        Español
      </a>
    </div>
  );
}
