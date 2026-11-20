import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserProfileMenu from '@/components/Navbar/profile/UserProfileMenu';
import translations from '../../data/lang/es.json';
import englishTranslations from '../../data/lang/en.json';

const push = jest.fn();
const refresh = jest.fn();
const fetchMock = jest.fn();
const originalFetch = global.fetch;
const originalResizeObserver = global.ResizeObserver;
let pathname = '/account/settings';
let locale: 'en' | 'es' = 'es';

jest.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: () => ({ push, refresh }) }));
jest.mock('next-intl', () => ({
  useLocale: () => locale,
  useTranslations: () => (key: keyof typeof translations.UserMenu) =>
    (locale === 'es' ? translations : englishTranslations).UserMenu[key],
}));
jest.mock('@/features/auth/components/OAuth/CurrentUserAvatar', () => ({ CurrentUserAvatar: () => <span aria-hidden="true">Avatar</span> }));

beforeEach(() => {
  jest.clearAllMocks();
  pathname = '/es/account/settings';
  locale = 'es';
  fetchMock.mockResolvedValue({ ok: true });
  global.fetch = fetchMock;
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterAll(() => {
  global.fetch = originalFetch;
  global.ResizeObserver = originalResizeObserver;
});

it('links to account settings from the user menu', () => {
  render(<UserProfileMenu picture={null} />);
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de usuario' }));
  expect(screen.getByRole('menuitem', { name: 'Cuenta' })).toHaveAttribute('href', '/es/account/settings');
});

it('leaves the protected account page after signing out', async () => {
  render(<UserProfileMenu picture={null} />);
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de usuario' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));
  await waitFor(() => expect(push).toHaveBeenCalledWith('/es'));
  expect(fetchMock).toHaveBeenCalledWith('/auth/logout');
});

it('uses English routes and labels when the locale is English', async () => {
  locale = 'en';
  pathname = '/account/settings';
  render(<UserProfileMenu picture={null} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open user menu' }));
  expect(screen.getByRole('menuitem', { name: 'Account settings' })).toHaveAttribute('href', '/account/settings');
  fireEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
  await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
});
