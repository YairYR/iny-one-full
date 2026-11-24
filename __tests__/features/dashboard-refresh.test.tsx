import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useRefreshStats, useStatsCommon } from '@/features/dashboard/hooks/useStatsCommon';
import { getDashboardInsights, getDashboardKpis, getDashboardLinks } from '@/features/dashboard/services/getStats';
import type { ReactNode } from 'react';

jest.mock('@/features/dashboard/services/getStats', () => ({
  getDashboardKpis: jest.fn(),
  getDashboardInsights: jest.fn(),
  getDashboardLinks: jest.fn(),
}));

const kpis = jest.mocked(getDashboardKpis);
const insights = jest.mocked(getDashboardInsights);
const links = jest.mocked(getDashboardLinks);

beforeEach(() => {
  jest.clearAllMocks();
  kpis.mockResolvedValue({
    range: { date_start: '2026-01-01', date_end: '2026-01-07' },
    summary: {
      last_clicks: 0,
      total_links: 40,
      total_clicks: 0,
      week: [],
      top_country: [],
    },
  });
  insights.mockResolvedValue({
    range: { date_start: '2026-01-01', date_end: '2026-01-07' },
    summary: { performance: [], traffic: [] },
  });
  links.mockImplementation(async (page) => ({ urls: [], pagination: { page, pageSize: 20, total: 40 } }));
});

it('fetches groups separately and revalidates only links on pagination and edit', async () => {
  const cache = new Map();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => cache, dedupingInterval: 0 }}>{children}</SWRConfig>
  );
  const { result, rerender } = renderHook(
    ({ page }) => ({ ...useStatsCommon(page), refresh: useRefreshStats() }),
    { initialProps: { page: 1 }, wrapper },
  );
  await waitFor(() => expect(result.current.links.data?.pagination.page).toBe(1));
  expect(kpis).toHaveBeenCalledTimes(1);
  expect(insights).toHaveBeenCalledTimes(1);

  rerender({ page: 2 });
  await waitFor(() => expect(result.current.links.data?.pagination.page).toBe(2));
  expect(kpis).toHaveBeenCalledTimes(1);
  expect(insights).toHaveBeenCalledTimes(1);

  await act(async () => { await result.current.refresh(); });
  expect(links).toHaveBeenCalledTimes(3);
  expect(kpis).toHaveBeenCalledTimes(1);
  expect(insights).toHaveBeenCalledTimes(1);

  rerender({ page: 1 });
  await waitFor(() => expect(links).toHaveBeenCalledTimes(4));
});

it('refreshes KPIs every minute and insights every five minutes', async () => {
  jest.useFakeTimers();
  try {
    const cache = new Map();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig value={{ provider: () => cache, dedupingInterval: 0 }}>{children}</SWRConfig>
    );
    const { unmount } = renderHook(() => useStatsCommon(1), { wrapper });
    await act(async () => { await Promise.resolve(); });
    expect(kpis).toHaveBeenCalledTimes(1);
    expect(insights).toHaveBeenCalledTimes(1);
    expect(links).toHaveBeenCalledTimes(1);

    for (let minute = 1; minute <= 5; minute++) {
      await act(async () => { await jest.advanceTimersByTimeAsync(60_000); });
      expect(kpis).toHaveBeenCalledTimes(minute + 1);
      expect(insights).toHaveBeenCalledTimes(minute < 5 ? 1 : 2);
      expect(links).toHaveBeenCalledTimes(1);
    }
    unmount();
  } finally {
    jest.useRealTimers();
  }
});
