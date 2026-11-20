/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const isLoggedIn = jest.fn();
const getDefaultTeamAccess = jest.fn();
const getLinksId = jest.fn();
const getLinks = jest.fn();
const getTopLinks = jest.fn();
const getDashboardStatsSummary = jest.fn();
const getRefererersStats = jest.fn();

jest.mock('@/data/dto/user-dto', () => ({ isLoggedIn }));
jest.mock('@/features/authorization/helpers/access', () => ({ getDefaultTeamAccess }));
jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/team.repository', () => ({
  getTeamRepository: () => ({ getLinksId, getLinks, getTopLinks }),
}));
jest.mock('@/infra/db/stats.repository', () => ({
  getStatsRepository: () => ({ getDashboardStatsSummary, getRefererersStats }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/api/v1/dashboard/summary/route') as typeof import('@/app/api/v1/dashboard/summary/route');
const request = () => new NextRequest('https://iny.one/api/v1/dashboard/summary');

beforeEach(() => {
  jest.clearAllMocks();
  isLoggedIn.mockResolvedValue(true);
  getDefaultTeamAccess.mockResolvedValue({ team_id: 'team-1', permitted: true });
  getLinksId.mockResolvedValue({ data: [], error: null });
  getLinks.mockResolvedValue({ data: [], count: 0, error: null });
  getTopLinks.mockResolvedValue({ data: [], error: null });
  getDashboardStatsSummary.mockResolvedValue({ data: {}, error: null });
  getRefererersStats.mockResolvedValue({ data: [], error: null });
});

it('rejects anonymous users before checking teams or reading statistics', async () => {
  isLoggedIn.mockResolvedValue(false);
  expect((await GET(request(), undefined)).status).toBe(401);
  expect(getDefaultTeamAccess).not.toHaveBeenCalled();
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});

it('rejects missing teams and users without statistics permission', async () => {
  getDefaultTeamAccess.mockResolvedValueOnce({ team_id: null, permitted: false })
    .mockResolvedValueOnce({ team_id: 'team-1', permitted: false });
  expect((await GET(request(), undefined)).status).toBe(401);
  expect((await GET(request(), undefined)).status).toBe(403);
  expect(getDefaultTeamAccess).toHaveBeenCalledWith('stats.view');
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});

it('queries statistics only for the authorized default team', async () => {
  expect((await GET(request(), undefined)).status).toBe(200);
  expect(getDashboardStatsSummary).toHaveBeenCalledWith('team-1');
  expect(getLinksId).toHaveBeenCalledWith('team-1');
});

it('does not read statistics if authorization fails', async () => {
  getDefaultTeamAccess.mockRejectedValue(new Error('database unavailable'));
  expect((await GET(request(), undefined)).status).toBe(500);
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});
