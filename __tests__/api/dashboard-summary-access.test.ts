/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const isLoggedIn = jest.fn();
const getDefaultTeamAccess = jest.fn();
const getLinksId = jest.fn();
const getLinks = jest.fn();
const getLinksCount = jest.fn();
const getTopLinks = jest.fn();
const getDashboardStatsSummary = jest.fn();
const getRefererersStats = jest.fn();

jest.mock('@/data/dto/user-dto', () => ({ isLoggedIn }));
jest.mock('@/features/authorization/helpers/access', () => ({ getDefaultTeamAccess }));
jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/team.repository', () => ({
  getTeamRepository: () => ({ getLinksId, getLinks, getLinksCount, getTopLinks }),
}));
jest.mock('@/infra/db/stats.repository', () => ({
  getStatsRepository: () => ({ getDashboardStatsSummary, getRefererersStats }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/api/v1/dashboard/summary/route') as typeof import('@/app/api/v1/dashboard/summary/route');
const request = (query = '') => new NextRequest(`https://iny.one/api/v1/dashboard/summary${query}`);

beforeEach(() => {
  jest.clearAllMocks();
  isLoggedIn.mockResolvedValue(true);
  getDefaultTeamAccess.mockResolvedValue({ team_id: 'team-1', permitted: true });
  getLinksId.mockResolvedValue({ data: [], count: 0, error: null });
  getLinks.mockResolvedValue({ data: [], count: 0, error: null });
  getLinksCount.mockResolvedValue({ count: 7, error: null });
  getTopLinks.mockResolvedValue({ data: [], error: null });
  getDashboardStatsSummary.mockResolvedValue({ data: {
    clicks_all_time: 0, clicks_last_24hrs: 0, weekly_activity: [], top_countries: [],
  }, error: null });
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
  const response = await GET(request(), undefined);
  expect(response.status).toBe(200);
  expect((await response.json()).data).toEqual(expect.objectContaining({
    urls: [], topLinks: [], refererStats: [],
    summary: expect.objectContaining({ clicks: 0, clicks_last_24h: 0, stats: [] }),
    all_time: { clicks: 0, top_browsers: [], top_countries: [] },
    pagination: { page: 1, pageSize: 20, total: 0 },
  }));
  expect(getDashboardStatsSummary).toHaveBeenCalledWith('team-1');
  expect(getLinksId).toHaveBeenCalledWith('team-1', 0, 500);
});

it('fetches only the summary and link count for the frequently refreshed KPIs', async () => {
  getDashboardStatsSummary.mockResolvedValue({
    data: {
      clicks_all_time: 42, clicks_last_24hrs: 3,
      top_countries: [{ name: 'CL', value: 5 }],
      weekly_activity: [{ date: '2026-01-01', clicks: 2 }],
    },
    error: null,
  });
  const response = await GET(request('?kpi=total_links,total_clicks,top_country,last_clicks,week'), undefined);
  const payload = await response.json();
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(payload.data).toMatchObject({
    totalLinks: 7,
    summary: { clicks_last_24h: 3, stats: [{ date: '2026-01-01', clicks: 2 }] },
    all_time: { clicks: 42, top_countries: [{ name: 'CL', value: 5 }] },
  });
  expect(getDashboardStatsSummary).toHaveBeenCalledWith('team-1');
  expect(getLinksCount).toHaveBeenCalledWith('team-1');
  expect(getLinks).not.toHaveBeenCalled();
  expect(getLinksId).not.toHaveBeenCalled();
  expect(getTopLinks).not.toHaveBeenCalled();
  expect(getRefererersStats).not.toHaveBeenCalled();
});

it('fetches traffic and ranking without querying links or the summary RPC', async () => {
  getLinksId.mockResolvedValue({ data: [{ link_id: 'id-1' }], count: 1, error: null });
  getRefererersStats.mockResolvedValue({ data: [{ referer: 'https://google.com', count: 3 }], error: null });
  getTopLinks.mockResolvedValue({ data: [{ slug: 'abc', clicks: 3 }], error: null });
  const response = await GET(request('?kpi=traffic,performance'), undefined);
  expect((await response.json()).data).toEqual({
    refererStats: [{ referer: 'https://google.com', count: 3 }],
    topLinks: [{ slug: 'abc', clicks: 3 }],
  });
  expect(getRefererersStats).toHaveBeenCalledWith(['id-1']);
  expect(getLinks).not.toHaveBeenCalled();
  expect(getLinksCount).not.toHaveBeenCalled();
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});

it('fetches just the requested links page and maps its alias', async () => {
  getLinks.mockResolvedValue({
    data: [{ link_id: 'id-1', slug: 'abc', name: 'Nombre', destination: 'https://github.com', clicks: 1, created_at: '2026-01-01' }],
    count: 35, error: null,
  });
  const response = await GET(request('?links=true&page=2'), undefined);
  const payload = await response.json();
  expect(payload.data).toMatchObject({
    urls: [{ link_id: 'id-1', alias: 'Nombre' }],
    pagination: { page: 2, pageSize: 20, total: 35 },
  });
  expect(getLinks).toHaveBeenCalledWith('team-1', 20, 20);
  expect(getLinksId).not.toHaveBeenCalled();
  expect(getTopLinks).not.toHaveBeenCalled();
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
  expect(getRefererersStats).not.toHaveBeenCalled();
});

it('only includes requested individual KPIs', async () => {
  getDashboardStatsSummary.mockResolvedValue({
    data: { clicks_all_time: 12, clicks_last_24hrs: 4, weekly_activity: [], top_countries: [] }, error: null,
  });
  const response = await GET(request('?kpi=last_clicks'), undefined);
  expect((await response.json()).data).toEqual({ summary: { clicks_last_24h: 4 }, all_time: {} });
  expect(getDashboardStatsSummary).toHaveBeenCalledTimes(1);
  expect(getLinks).not.toHaveBeenCalled();
});

it('fetches the ranking without reading traffic or the summary', async () => {
  const response = await GET(request('?kpi=performance'), undefined);
  expect((await response.json()).data).toEqual({ topLinks: [] });
  expect(getTopLinks).toHaveBeenCalledTimes(1);
  expect(getLinksId).not.toHaveBeenCalled();
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});

it('paginates all link ids before calculating traffic', async () => {
  const ids = Array.from({ length: 500 }, (_, i) => ({ link_id: `id-${i}` }));
  getLinksId.mockResolvedValueOnce({ data: ids, count: 501, error: null })
    .mockResolvedValueOnce({ data: [{ link_id: 'id-500' }], count: 501, error: null });
  const response = await GET(request('?kpi=traffic'), undefined);
  expect(response.status).toBe(200);
  expect(getLinksId).toHaveBeenNthCalledWith(2, 'team-1', 500, 500);
  expect(getRefererersStats).toHaveBeenCalledWith([...ids.map(({ link_id }) => link_id), 'id-500']);
});

it('does not call the traffic RPC for a team without links', async () => {
  const response = await GET(request('?kpi=traffic'), undefined);
  expect((await response.json()).data).toEqual({ refererStats: [] });
  expect(getRefererersStats).not.toHaveBeenCalled();
});

it.each(['?kpi=unknown', '?kpi=week,', '?links=false', '?links=true&page=-1', '?page=999999999999999999999'])(
  'rejects invalid parameters %s before reading data',
  async (query) => {
    expect((await GET(request(query), undefined)).status).toBe(422);
    expect(getDashboardStatsSummary).not.toHaveBeenCalled();
    expect(getLinks).not.toHaveBeenCalled();
  },
);

it.each(['?links=true', '?kpi=traffic,performance', '?kpi=week'])(
  'enforces team authorization for %s',
  async (query) => {
    getDefaultTeamAccess.mockResolvedValue({ team_id: 'team-1', permitted: false });
    expect((await GET(request(query), undefined)).status).toBe(403);
    expect(getLinks).not.toHaveBeenCalled();
    expect(getLinksId).not.toHaveBeenCalled();
    expect(getDashboardStatsSummary).not.toHaveBeenCalled();
  },
);

it('returns an error when the traffic RPC fails', async () => {
  getLinksId.mockResolvedValue({ data: [{ link_id: 'id-1' }], count: 1, error: null });
  getRefererersStats.mockResolvedValue({ data: null, error: { message: 'unavailable' } });
  expect((await GET(request('?kpi=traffic'), undefined)).status).toBe(500);
});

it('returns an error when the link id list is incomplete', async () => {
  getLinksId.mockResolvedValue({ data: [], count: 1, error: null });
  expect((await GET(request('?kpi=traffic'), undefined)).status).toBe(500);
  expect(getRefererersStats).not.toHaveBeenCalled();
});

it('returns an error for an invalid summary response', async () => {
  getDashboardStatsSummary.mockResolvedValue({ data: { clicks_all_time: 'not a number' }, error: null });
  expect((await GET(request('?kpi=total_clicks'), undefined)).status).toBe(500);
});

it('returns an error when the links query fails', async () => {
  getLinks.mockResolvedValue({ data: null, count: null, error: { message: 'unavailable' } });
  expect((await GET(request('?links=true'), undefined)).status).toBe(500);
});

it('reuses the page count when links and the link count are requested together', async () => {
  const response = await GET(request('?links=true&kpi=total_links'), undefined);
  expect((await response.json()).data).toMatchObject({ totalLinks: 0, pagination: { total: 0 } });
  expect(getLinksCount).not.toHaveBeenCalled();
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});

it('does not read statistics if authorization fails', async () => {
  getDefaultTeamAccess.mockRejectedValue(new Error('database unavailable'));
  expect((await GET(request(), undefined)).status).toBe(500);
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});
