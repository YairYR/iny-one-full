/**
 * @jest-environment node
 */
const getCurrentUser = jest.fn();
const getEffectiveService = jest.fn();
jest.mock('server-only', () => ({}));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/user.repository', () => ({ getUserRepository: () => ({ getCurrentUser }) }));
jest.mock('@/features/authorization/helpers/access', () => ({ getEffectiveService }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { isLoggedIn } = require('@/data/dto/user-dto') as typeof import('@/data/dto/user-dto');

beforeEach(() => jest.clearAllMocks());

it('checks the verified user without querying the effective service', async () => {
  getCurrentUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@test.invalid', user_metadata: {} }, role: null, plan: null } });
  expect(await isLoggedIn()).toBe(true);
  expect(getEffectiveService).not.toHaveBeenCalled();
});

it('returns false without a user and does not query the effective service', async () => {
  getCurrentUser.mockResolvedValue({ data: { user: null } });
  expect(await isLoggedIn()).toBe(false);
  expect(getEffectiveService).not.toHaveBeenCalled();
});
