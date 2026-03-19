import { ApiResponse } from "@/lib/types";
import { UserUrlStats } from "@/features/dashboard/types/types";

export async function getStatsCommon(): Promise<UserDashboardStats|null> {
  return fetch('/api/dashboard/stats')
    .then(res => res.json())
    .then((data: ApiResponse<UserDashboardStats>) => {
      if(data.success) {
        return data.data;
      }
      return null;
    });
}

export interface UserDashboardStats {
  urls: UserUrlStats[];
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
  }
}