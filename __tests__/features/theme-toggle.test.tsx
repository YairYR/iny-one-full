import { act, fireEvent, render, screen } from '@testing-library/react';
import ThemeToggle from '@/components/ThemeToggle';
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from '@/lib/theme';
import translations from '../../data/lang/es.json';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: keyof typeof translations.Navigation) => translations.Navigation[key],
}));

let systemDark = false;
let systemListener: ((event: { matches: boolean }) => void) | null = null;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  systemDark = false;
  systemListener = null;
  window.matchMedia = jest.fn().mockImplementation(() => ({
    matches: systemDark,
    addEventListener: (_: string, listener: typeof systemListener) => { systemListener = listener; },
    removeEventListener: jest.fn(),
  }));
});

describe('theme init script', () => {
  it('follows the system preference when nothing is stored', () => {
    systemDark = true;
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement).toHaveClass('dark');
  });

  it('lets the stored choice override the system preference', () => {
    systemDark = true;
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    new Function(THEME_INIT_SCRIPT)();
    expect(document.documentElement).not.toHaveClass('dark');
  });
});

describe('ThemeToggle', () => {
  it('switches the theme, persists it and updates its accessible label', async () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: translations.Navigation.themeDark }));

    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(await screen.findByRole('button', { name: translations.Navigation.themeLight })).toBeInTheDocument();
  });

  it('tracks system changes only while the user has not chosen a theme', async () => {
    render(<ThemeToggle />);

    act(() => systemListener?.({ matches: true }));
    expect(document.documentElement).toHaveClass('dark');

    fireEvent.click(await screen.findByRole('button', { name: translations.Navigation.themeLight }));
    act(() => systemListener?.({ matches: true }));
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
