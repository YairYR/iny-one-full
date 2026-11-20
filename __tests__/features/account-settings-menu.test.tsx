import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import UserProfileMenu from '@/components/Navbar/profile/UserProfileMenu';
import translations from '../../data/lang/es.json';

const push = jest.fn();
const refresh = jest.fn();
const fetchMock = jest.fn();
const originalFetch = global.fetch;
const originalResizeObserver = global.ResizeObserver;
let pathname = '/account/settings';

jest.mock('next/navigation', () => ({ usePathname: () => pathname, useRouter: () => ({ push, refresh }) }));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: keyof typeof translations.UserMenu) => translations.UserMenu[key],
}));
jest.mock('@/features/auth/components/OAuth/CurrentUserAvatar', () => ({ CurrentUserAvatar: () => <span aria-hidden="true">Avatar</span> }));

beforeEach(() => {
  jest.clearAllMocks();
  pathname = '/account/settings';
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
  fireEvent.click(screen.getByRole('button', { name: 'Open user menu' }));
  expect(screen.getByRole('menuitem', { name: 'Configuración de la cuenta' })).toHaveAttribute('href', '/account/settings');
});

it('leaves the protected account page after signing out', async () => {
  render(<UserProfileMenu picture={null} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open user menu' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));
  await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
  expect(fetchMock).toHaveBeenCalledWith('/auth/logout');
});
