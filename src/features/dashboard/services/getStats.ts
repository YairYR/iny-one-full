import { ApiResponse } from "@/lib/types";
import { ILinkDateStats, UserUrlStats } from "@/features/dashboard/types/types";

export async function getStatsCommon(page = 1): Promise<UserDashboardStats | null> {
  return fetchData<UserDashboardStats>(`/api/dashboard/stats?page=${page}`);
}

export async function getLinkStatsCommon([slug]: [slug: string]): Promise<ILinkDateStats[] | null> {
  if (!slug) return null;
  return fetchData<ILinkDateStats[]>(`/api/dashboard/stats/${slug}`);
}

async function fetchData<T>(url: string): Promise<T | null> {
  const response: ApiResponse<T> = await fetch(url).then((res) => res.json());
  return response.success ? response.data : null;
}

export interface UserDashboardStats {
  urls: UserUrlStats[];
  topLinks: { slug: string; clicks: number }[];
  refererStats: {
    referer: string;
    count: number;
  }[];
  summary: {
    date_start: string;
    date_end: string;
    clicks: number;
    clicks_last_24h: number;
    date_grouping: 'day' | 'week' | 'month';
    stats: { date: string, clicks: number }[];
  };
  all_time: {
    clicks: number;
    top_browsers: { name: string, value: number }[];
    top_countries: { name: string, value: number }[];
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
