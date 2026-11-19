/**
 * @jest-environment node
 */
const getPersonalSetup = jest.fn();
const getCurrentUserDTO = jest.fn();
const headers = jest.fn();
jest.mock('@/data/dto/user-dto', () => ({ getCurrentUserDTO }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/team.repository', () => ({ getTeamRepository: () => ({ getPersonalSetup }) }));
jest.mock('next/headers', () => ({ headers }));
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));
jest.mock('@/features/auth/components/SetupForm', () => () => null);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SetupPage = (require('@/app/ui/(main)/auth/setup/page') as typeof import('@/app/ui/(main)/auth/setup/page')).default;

beforeEach(() => {
  getCurrentUserDTO.mockResolvedValue({ id: 'user-1', name: 'Google Name' });
  headers.mockResolvedValue(new Headers({
    'x-vercel-ip-country': 'AR',
    'x-vercel-ip-timezone': 'America/Argentina/Buenos_Aires',
  }));
  getPersonalSetup.mockResolvedValue({ data: {
    full_name: null, country: null, timezone: null, team_name: null,
  }, error: null });
});

it('suggests the Google name and Vercel location', async () => {
  const result = await SetupPage({ searchParams: Promise.resolve({}) });
  expect(result.props).toMatchObject({
    initialFullName: 'Google Name', initialCountry: 'AR',
    initialTimezone: 'America/Argentina/Buenos_Aires', initialTeamName: null,
  });
});

it('prefers saved profile values over detected values', async () => {
  getPersonalSetup.mockResolvedValue({ data: {
    full_name: 'Saved Name', country: 'CL', timezone: 'America/Santiago', team_name: 'Saved Team',
  }, error: null });
  const result = await SetupPage({ searchParams: Promise.resolve({}) });
  expect(result.props).toMatchObject({
    initialFullName: 'Saved Name', initialCountry: 'CL',
    initialTimezone: 'America/Santiago', initialTeamName: 'Saved Team',
  });
});

it('does not silently ignore database errors', async () => {
  getPersonalSetup.mockResolvedValue({ data: null, error: { message: 'unavailable' } });
  await expect(SetupPage({ searchParams: Promise.resolve({}) })).rejects.toThrow('Unable to load account setup');
});
