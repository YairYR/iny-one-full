import { ApiResponse } from "@/lib/types";
import { ILinkDateStats, ILinkStats, UserUrl } from "@/features/dashboard/types/types";

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

interface UserDashboardStats {
  urls: UserUrl[];
  stats: ILinkStats[];
  refererStats: [] | [{
    referer: string;
    count: number;
  }];
  clicksLast24h: number | null;
  weekStats: {
    stats: ILinkDateStats[];
    start: Date;
    end: Date;
    totalDays: number;
  };
}