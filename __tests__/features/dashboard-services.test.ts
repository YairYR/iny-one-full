import { getDashboardInsights, getDashboardKpis, getDashboardLinks } from '@/features/dashboard/services/getStats';

const fetchMock = jest.fn();
const originalFetch = global.fetch;

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true, data: {} }) });
  global.fetch = fetchMock;
});

afterAll(() => { global.fetch = originalFetch; });

it('requests the three independent dashboard groups without HTTP caching', async () => {
  await Promise.all([getDashboardKpis(), getDashboardInsights(), getDashboardLinks(3)]);
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/v1/dashboard/summary?kpi=total_links,total_clicks,top_country,last_clicks,week', { cache: 'no-store' },
  );
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/v1/dashboard/summary?kpi=traffic,performance', { cache: 'no-store' },
  );
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/v1/teams/default/links?page=3&pageSize=20', { cache: 'no-store' },
  );
});

it('reports failed requests instead of treating them as empty data', async () => {
  fetchMock.mockResolvedValue({ ok: false, json: async () => ({ ok: false }) });
  await expect(getDashboardKpis()).rejects.toThrow('Unable to fetch dashboard data');
});
