import { getRequestConfig } from 'next-intl/server';
import { headers } from "next/headers";
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { type Formats } from 'next-intl';

const defaultLocale = 'en';
export const availableLocales = ['en', 'es'];

export default getRequestConfig(async () => {
  const headerList = await headers();

  // 1) Locale forzado por ruta (/es/*), inyectado por el middleware.
  //    Esto da URLs propias a la versión en español para que Google la indexe;
  //    con Accept-Language sobre una misma URL, Googlebot solo veía el inglés.
  const forced = headerList.get('x-iny-locale');
  let locale: string | undefined =
    forced && availableLocales.includes(forced) ? forced : undefined;

  // 2) Fallback: negociación por Accept-Language (URLs sin prefijo de idioma).
  if (!locale) {
    const acceptLanguage = headerList.get('accept-language');
    if (acceptLanguage) {
      const languages = new Negotiator({ headers: { 'accept-language': acceptLanguage } }).languages();
      locale = match(languages, availableLocales, defaultLocale);
    } else {
      locale = defaultLocale;
    }
  }

  return {
    locale,
    messages: (await import(`../../data/lang/${locale}.json`)).default
  };
});

export const formats = {} satisfies Formats;
