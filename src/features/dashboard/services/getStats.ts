import { ApiResponse, DashboardStatsSummary } from "@/lib/types";
import { ILinkStatsSummary, UserUrlStats } from "@/features/dashboard/types/types";

/** INACTIVO: el dashboard usa los grupos independientes. */
export async function getStatsCommon(page = 1): Promise<UserDashboardStats | null> {
  return fetchData<UserDashboardStats>(`/api/v1/dashboard/summary?page=${page}`);
}

export interface DashboardSummary {
  range: {
    date_start: string;
    date_end: string;
  };
  summary: {
    last_clicks: number;
    total_links: number;
    total_clicks: number;
    week: { date: string; clicks: number; }[];
    top_country: { name: string; value: number; }[];
    performance: { slug: string; clicks: number; }[];
    traffic: { referer: string; count: number; }[];
  };
}

export type DashboardKpis = Pick<DashboardSummary, 'range'> &
    { summary: Pick<DashboardSummary['summary'], 'last_clicks'|'total_links'|'total_clicks'|'week'|'top_country'> };

export type DashboardInsights = Pick<DashboardSummary, 'range'> &
    { summary: Pick<DashboardSummary['summary'], 'performance'|'traffic'> };

export type DashboardLinks = Pick<UserDashboardStats, 'urls' | 'pagination'>;

async function fetchDashboardData<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  const payload: ApiResponse<T> = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error('Unable to fetch dashboard data');
  }
  return payload.data;
}

export const getDashboardKpis = () =>
  fetchDashboardData<DashboardKpis>('/api/v1/dashboard/summary?kpi=total_links,total_clicks,top_country,last_clicks,week');

export const getDashboardInsights = () =>
  fetchDashboardData<DashboardInsights>('/api/v1/dashboard/summary?kpi=traffic,performance');

export const getDashboardLinks = (page: number, pageSize = 20) =>
  fetchDashboardData<DashboardLinks>(`/api/v1/teams/default/links?page=${page}&pageSize=${pageSize}`);

export async function getLinkStatsCommon([link_id, range = 7]: [link_id: string, range?: number]): Promise<ILinkStatsSummary | null> {
  if (!link_id) return null;
  const response = await fetch(`/api/v1/dashboard/links/${link_id}?range=${range}`, { cache: 'no-store' });
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
