'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { setTheme, useIsDarkTheme } from '@/lib/theme';

export default function ThemeToggle() {
  const t = useTranslations('Navigation');
  const dark = useIsDarkTheme();
  const label = dark ? t('themeLight') : t('themeDark');

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className="relative rounded-full p-1 text-gray-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
    >
      <span className="absolute -inset-1.5" />
      {dark
        ? <SunIcon aria-hidden="true" className="size-5" />
        : <MoonIcon aria-hidden="true" className="size-5" />}
    </button>
  );
}
