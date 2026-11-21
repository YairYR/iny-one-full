/**
 * @jest-environment node
 */
export {};

const getCurrentUserDTO = jest.fn();
const getStatsUserUrls = jest.fn();

jest.mock('@/data/dto/user-dto', () => ({ getCurrentUserDTO }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/user.repository', () => ({ getUserRepository: () => ({ getStatsUserUrls }) }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/api/v1/dashboard/links/route') as typeof import('@/app/api/v1/dashboard/links/route');

beforeEach(() => {
  jest.clearAllMocks();
  getCurrentUserDTO.mockResolvedValue({ id: 'user-1' });
  getStatsUserUrls.mockResolvedValue({ data: [], error: null });
});

it('preserves the legacy user-scoped response', async () => {
  const response = await GET();
  expect(response.status).toBe(200);
  expect((await response.json()).data).toEqual([]);
  expect(getStatsUserUrls).toHaveBeenCalledWith('user-1');
});

it('returns a private error rather than an empty list when the query fails', async () => {
  getStatsUserUrls.mockResolvedValue({ data: null, error: { message: 'unavailable' } });
  const response = await GET();
  expect(response.status).toBe(500);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});

it('requires a session', async () => {
  getCurrentUserDTO.mockResolvedValue(null);
  expect((await GET()).status).toBe(401);
  expect(getStatsUserUrls).not.toHaveBeenCalled();
});
