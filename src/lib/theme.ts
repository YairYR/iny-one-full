import { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from '@/lib/theme-script';

export type ThemePreference = 'light' | 'dark';

export { THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from '@/lib/theme-script';

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function isDarkActive(): boolean {
  return document.documentElement.classList.contains('dark');
}

export function getStoredTheme(): ThemePreference | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

export function setTheme(theme: ThemePreference): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Modo privado o almacenamiento bloqueado: el tema vale para esta visita.
  }
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // Mientras el usuario no elija, el tema acompaña al del sistema en vivo.
  const media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null;
  const onSystemChange = (event: MediaQueryListEvent) => {
    if (!getStoredTheme()) document.documentElement.classList.toggle('dark', event.matches);
  };
  media?.addEventListener('change', onSystemChange);

  return () => {
    observer.disconnect();
    media?.removeEventListener('change', onSystemChange);
  };
}

/** Tema activo; en servidor e hidratación devuelve claro y se corrige al montar. */
export function useIsDarkTheme(): boolean {
  return useSyncExternalStore(subscribe, isDarkActive, () => false);
}
