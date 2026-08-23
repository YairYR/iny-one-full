import {ApiResponse, DashboardStatsSummary} from "@/lib/types";
import { ILinkDateStats, UserUrlStats } from "@/features/dashboard/types/types";

export async function getStatsCommon(page = 1): Promise<UserDashboardStats | null> {
  return fetchData<UserDashboardStats>(`/api/dashboard/stats?page=${page}`);
}

export async function getLinkStatsCommon([slug]: [slug: string]): Promise<ILinkDateStats[] | null> {
  if (!slug) return null;
  return fetchData<ILinkDateStats[]>(`/api/dashboard/stats/${slug}`);
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
