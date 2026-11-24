/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const isLoggedIn = jest.fn();
const getDefaultTeamAccess = jest.fn();
const getDashboardStatsSummary = jest.fn();

jest.mock('@/data/dto/user-dto', () => ({ isLoggedIn }));
jest.mock('@/features/authorization/helpers/access', () => ({ getDefaultTeamAccess }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/stats.repository', () => ({
  getStatsRepository: () => ({ getDashboardStatsSummary }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/api/v1/dashboard/summary/route') as typeof import('@/app/api/v1/dashboard/summary/route');
const request = (query = '') => new NextRequest(`https://iny.one/api/v1/dashboard/summary${query}`);

beforeEach(() => {
  jest.clearAllMocks();
  isLoggedIn.mockResolvedValue(true);
  getDefaultTeamAccess.mockResolvedValue({ team_id: 'team-1', permitted: true });
  getDashboardStatsSummary.mockResolvedValue({
    data: {
      total_links: 7,
      total_clicks: 42,
      last_clicks: 3,
      week: [{ date: '2026-01-01', clicks: 2 }],
      top_country: [{ name: 'CL', value: 5 }],
      performance: [],
      traffic: [],
    },
    error: null,
  });
});

it('rejects anonymous users before checking teams or reading statistics', async () => {
  isLoggedIn.mockResolvedValue(false);

  expect((await GET(request())).status).toBe(401);
  expect(getDefaultTeamAccess).not.toHaveBeenCalled();
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});

it('rejects missing teams and users without statistics permission', async () => {
  getDefaultTeamAccess.mockResolvedValueOnce({ team_id: null, permitted: false })
    .mockResolvedValueOnce({ team_id: 'team-1', permitted: false });

  expect((await GET(request())).status).toBe(401);
  expect((await GET(request())).status).toBe(403);
  expect(getDefaultTeamAccess).toHaveBeenCalledWith('stats.view');
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});

it('queries summary statistics only for the authorized default team', async () => {
  const response = await GET(request());
  const payload = await response.json();

  expect(response.status).toBe(200);
  expect(payload.data).toEqual({
    range: {
      date_start: expect.any(String),
      date_end: expect.any(String),
    },
    summary: {
      total_links: 7,
      total_clicks: 42,
      last_clicks: 3,
      week: [{ date: '2026-01-01', clicks: 2 }],
      top_country: [{ name: 'CL', value: 5 }],
      performance: [],
      traffic: [],
    },
  });
  expect(getDashboardStatsSummary).toHaveBeenCalledWith(
    'team-1',
    [],
    expect.any(Date),
    expect.any(Date),
  );
});

it('deduplicates requested KPI names before querying statistics', async () => {
  const response = await GET(request('?kpi=total_clicks,week,total_clicks'));

  expect(response.status).toBe(200);
  expect(getDashboardStatsSummary).toHaveBeenCalledWith(
    'team-1',
    ['total_clicks', 'week'],
    expect.any(Date),
    expect.any(Date),
  );
});

it.each(['?kpi=unknown', '?kpi=week,'])(
  'rejects invalid KPI parameters %s before reading data',
  async (query) => {
    expect((await GET(request(query))).status).toBe(422);
    expect(getDefaultTeamAccess).not.toHaveBeenCalled();
    expect(getDashboardStatsSummary).not.toHaveBeenCalled();
  },
);

it('returns an error when the summary query fails', async () => {
  getDashboardStatsSummary.mockResolvedValue({ data: null, error: { message: 'unavailable' } });

  const response = await GET(request());

  expect(response.status).toBe(500);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
});

it('does not read statistics if authorization fails', async () => {
  getDefaultTeamAccess.mockRejectedValue(new Error('database unavailable'));

  expect((await GET(request())).status).toBe(500);
  expect(getDashboardStatsSummary).not.toHaveBeenCalled();
});
