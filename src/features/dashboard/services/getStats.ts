import { ApiResponse, DashboardStatsSummary } from "@/lib/types";
import { ILinkStatsSummary, UserUrlStats } from "@/features/dashboard/types/types";

/** INACTIVO: el dashboard usa los grupos independientes. */
export async function getStatsCommon(page = 1): Promise<UserDashboardStats | null> {
  return fetchData<UserDashboardStats>(`/api/v1/dashboard/summary?page=${page}`);
}

export type DashboardKpis = {
  totalLinks: number;
  summary: Pick<DashboardStatsSummary['summary'], 'date_start' | 'date_end' | 'date_grouping' | 'stats' | 'clicks_last_24h'>;
  all_time: Pick<DashboardStatsSummary['all_time'], 'clicks' | 'top_countries'>;
};

export type DashboardInsights = Pick<UserDashboardStats, 'topLinks' | 'refererStats'>;
export type DashboardLinks = Pick<UserDashboardStats, 'urls' | 'pagination'>;

async function fetchDashboardData<T>(query: string): Promise<T> {
  const response = await fetch(`/api/v1/dashboard/summary?${query}`, { cache: 'no-store' });
  const payload: ApiResponse<T> = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error('Unable to fetch dashboard data');
  }
  return payload.data;
}

export const getDashboardKpis = () =>
  fetchDashboardData<DashboardKpis>('kpi=total_links,total_clicks,top_country,last_clicks,week');

export const getDashboardInsights = () =>
  fetchDashboardData<DashboardInsights>('kpi=traffic,performance');

export const getDashboardLinks = (page: number) =>
  fetchDashboardData<DashboardLinks>(`links=true&page=${page}`);

export async function getLinkStatsCommon([link_id]: [link_id: string]): Promise<ILinkStatsSummary | null> {
  if (!link_id) return null;
  const response = await fetch(`/api/v1/dashboard/links/${link_id}`, { cache: 'no-store' });
  const payload: ApiResponse<ILinkStatsSummary> = await response.json();
  if (!response.ok || !payload.ok || !payload.data?.breakdown) {
    throw new Error('Unable to fetch link statistics');
  }
  return payload.data;
}

export async function getUserLinksSummary() {
  return fetchData('/api/v1/dashboard/summary');
}

async function fetchData<T>(url: string): Promise<T | null> {
  const response: ApiResponse<T> = await fetch(url).then((res) => res.json());
  return response.ok ? response.data : null;
}

export interface UserDashboardStats {
  urls: UserUrlStats[];
  topLinks: { slug: string; clicks: number }[];
  refererStats: {
    referer: string;
    count: number;
  }[];
  summary: DashboardStatsSummary['summary'];
  all_time: DashboardStatsSummary['all_time'];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
