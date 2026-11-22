import { getDashboardInsights, getDashboardKpis, getDashboardLinks } from "@/features/dashboard/services/getStats";
import useSWR, { useSWRConfig } from "swr";

const STATS_KEY = ['stats', 'dashboard'] as const;

export const useStatsCommon = (page = 1, pageSize = 20) => {
  const kpis = useSWR([...STATS_KEY, 'kpis'], getDashboardKpis, {
    refreshInterval: 60_000,
  });
  const insights = useSWR([...STATS_KEY, 'insights'], getDashboardInsights, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  });
  const links = useSWR(
    [...STATS_KEY, 'links', page, pageSize],
    ([, , , currentPage, currentSize]: [string, string, string, number, number]) => getDashboardLinks(currentPage, currentSize),
  );

  return { kpis, insights, links };
}

export const useRefreshStats = () => {
  const { mutate } = useSWRConfig();

  return () => mutate(
    (key) => Array.isArray(key) && key[0] === STATS_KEY[0] && key[1] === STATS_KEY[1] && key[2] === 'links',
    undefined,
    { revalidate: true },
  );
}
