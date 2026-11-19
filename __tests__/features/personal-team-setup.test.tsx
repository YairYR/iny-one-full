import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SetupForm from '@/features/auth/components/SetupForm';
import mockEnglish from '../../data/lang/en.json';
import mockSpanish from '../../data/lang/es.json';

const push = jest.fn();
const refresh = jest.fn();
const fetchMock = jest.fn();
const originalFetch = global.fetch;
const originalResizeObserver = global.ResizeObserver;
let mockLocale = 'en';
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));
jest.mock('next-intl', () => ({
  useLocale: () => mockLocale,
  useTranslations: () => (key: string, values?: { name: string }) => {
    const translations = mockLocale === 'es' ? mockSpanish : mockEnglish;
    const template = translations.Setup[key as keyof typeof translations.Setup];
    return values ? template.replace('{name}', values.name) : template;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
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

function setup(locale = 'en') {
  mockLocale = locale;
  return render(<SetupForm next="/dashboard" initialFullName="Jane" initialTeamName={null} initialCountry="US" initialTimezone="America/New_York" />);
}

it('allows skipping without creating a team', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }));
  expect(push).toHaveBeenCalledWith('/dashboard');
  expect(fetchMock).not.toHaveBeenCalled();
});

it('submits the chosen name before continuing', async () => {
  fetchMock.mockResolvedValue({ ok: true });
  setup();
  expect(screen.getByLabelText('Full name')).toHaveValue('Jane');
  expect(screen.getByLabelText('Team name')).toHaveValue("Jane's Team");
  expect(screen.getByLabelText('Country')).toHaveValue('United States');
  expect(screen.getByLabelText('Time zone')).toHaveValue('America/New_York');
  fireEvent.change(screen.getByLabelText('Team name'), { target: { value: 'Studio' } });
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  await waitFor(() => expect(push).toHaveBeenCalledWith('/dashboard'));
  expect(fetchMock).toHaveBeenCalledWith('/api/v1/teams/personal', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({ name: 'Studio', fullName: 'Jane', country: 'US', timezone: 'America/New_York' }),
  }));
});

it('translates the default name into Spanish and updates it with the user name', () => {
  setup('es');
  expect(screen.getByLabelText('Nombre del equipo')).toHaveValue('Equipo de Jane');
  fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Ana' } });
  expect(screen.getByLabelText('Nombre del equipo')).toHaveValue('Equipo de Ana');
});

it('filters and selects a country and a time zone', async () => {
  setup();
  fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'Argentina' } });
  await screen.findByRole('option', { name: 'Argentina' });
  fireEvent.keyDown(screen.getByLabelText('Country'), { key: 'Enter' });
  expect(screen.getByLabelText('Country')).toHaveValue('Argentina');
  await waitFor(() => expect(screen.getByLabelText('Country')).toHaveAttribute('aria-expanded', 'false'));
  fireEvent.change(screen.getByLabelText('Time zone'), { target: { value: 'Buenos_Aires' } });
  await screen.findByRole('option', { name: 'America/Buenos_Aires' });
  fireEvent.keyDown(screen.getByLabelText('Time zone'), { key: 'Enter' });
  await waitFor(() => expect(screen.getByLabelText('Time zone')).toHaveValue('America/Buenos_Aires'));
});
