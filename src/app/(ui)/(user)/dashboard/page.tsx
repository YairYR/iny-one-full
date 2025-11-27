import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { getUserUrls } from "@/lib/utils/query";
import { redirect } from "next/navigation";
import { ILinkDateStats, ILinkStats } from "@/features/dashboard/types/types";
import { StatsRepository } from "@/infra/db/stats.repository";
import dayjs from "dayjs";
import { getCurrentUserDTO } from "@/data/user-dto";

export default async function DashboardPage() {
  const user = await getCurrentUserDTO();
  if (!user) {
    return redirect("/auth/login");
  }

  const { data: _urls } = await getUserUrls(user.id);
  const urls: UserUrl[] = (_urls ?? []) as UserUrl[];
  const slugs = urls.map(item => item.slug);
  const { data: _stats } = await StatsRepository.getStatsUrls(slugs);
  const stats: ILinkStats[] = _stats ?? [];

  const date = dayjs('2025-09-20T00:00:00Z');
  const dateWeekAgo = date.subtract(1, 'week');
  const date24HoursAgo = date.subtract(24, 'hour');
  const { data: _weekStats } = await StatsRepository.getDayStatsBetweenDates(slugs, dateWeekAgo.toDate(), date.toDate());
  const weekStats: ILinkDateStats[] = (_weekStats ?? []) as ILinkDateStats[];

  const { data: refererStats } = await StatsRepository.getRefererersStats(slugs);
  const { data: clicksLast24h } = await StatsRepository.getClicksBetween(slugs, date24HoursAgo.toDate(), date.toDate());

  return (
    <UserDashboard
      urls={urls}
      stats={stats}
      refererStats={refererStats ?? []}
      clicksLast24h={clicksLast24h}
      weekStats={{
        stats: weekStats,
        start: dateWeekAgo.toDate(),
        end: date.toDate(),
        totalDays: 7,
      }}
    />
  );
}

type UserUrl = {
  slug: string;
  destination: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  clicks: number | null;
}
