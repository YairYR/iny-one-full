import { getRequestConfig } from 'next-intl/server';
import { headers } from "next/headers";
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { type Formats } from 'next-intl';

const defaultLocale = 'en';
export const availableLocales = ['en', 'es'];

export default getRequestConfig(async (params) => {
  // Static for now, we'll change this later
  let locale: string = params.locale as string;
  if(!locale) {
    const headerList = await headers();
    const acceptLanguage = headerList.get('accept-language');
    if(acceptLanguage) {
      const languages = new Negotiator({ headers: { 'accept-language': acceptLanguage } }).languages()
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
