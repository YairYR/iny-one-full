/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const isLoggedIn = jest.fn();
const getDefaultTeamAccess = jest.fn();
const getLinks = jest.fn();

jest.mock('@/data/dto/user-dto', () => ({ isLoggedIn }));
jest.mock('@/features/authorization/helpers/access', () => ({ getDefaultTeamAccess }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));
jest.mock('@/infra/db/team.repository', () => ({ getTeamRepository: () => ({ getLinks }) }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/api/v1/teams/default/links/route') as typeof import('@/app/api/v1/teams/default/links/route');
const call = (query = '') => GET(new NextRequest(`https://iny.one/api/v1/teams/default/links${query}`), undefined);

beforeEach(() => {
  jest.clearAllMocks();
  isLoggedIn.mockResolvedValue(true);
  getDefaultTeamAccess.mockResolvedValue({ team_id: 'team-1', permitted: true });
  getLinks.mockResolvedValue({
    data: [{
      link_id: 'id-1',
      name: 'Alias',
      utms: { utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'julio' },
    }],
    count: 21,
    error: null,
  });
});

it('lists the authorized default team with deterministic pagination metadata', async () => {
  const response = await call('?page=2');
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(getDefaultTeamAccess).toHaveBeenCalledWith('links.read');
  expect(getLinks).toHaveBeenCalledWith('team-1', 20, 20);
  expect((await response.json()).data).toEqual({
    urls: [{
      link_id: 'id-1',
      alias: 'Alias',
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'julio',
    }],
    pagination: { page: 2, pageSize: 20, total: 21 },
  });
});

it('does not access data without a session or permission', async () => {
  isLoggedIn.mockResolvedValueOnce(false);
  expect((await call()).status).toBe(401);
  getDefaultTeamAccess.mockResolvedValueOnce({ team_id: 'team-1', permitted: false });
  const response = await call();
  expect(response.status).toBe(403);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(getLinks).not.toHaveBeenCalled();
});

it.each(['0', '-1', '1.5', '999999999999999999999'])('rejects page %s', async (page) => {
  expect((await call(`?page=${page}`)).status).toBe(422);
  expect(getLinks).not.toHaveBeenCalled();
});

it('surfaces repository failures instead of returning an empty list', async () => {
  getLinks.mockResolvedValue({ data: null, count: null, error: { message: 'unavailable' } });
  expect((await call()).status).toBe(500);
});
