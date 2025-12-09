import { availableLocales, type formats } from "@/i18n/request";
import messages from '@/data/lang/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof availableLocales)[number];
    Messages: (typeof messages);
    Formats: (typeof formats);
  }
}