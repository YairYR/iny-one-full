import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { createClient } from "@/utils/supabase/app-server";
import { getCurrentUser, getStatsUrls, getUserUrls } from "@/lib/utils/query";
import { redirect } from "next/navigation";
import { ILinkDateStats, ILinkStats } from "@/features/dashboard/types/types";
import { StatsRepository } from "@/infra/db/stats.repository";
import dayjs from "dayjs";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { user, raw } = await getCurrentUser(supabase);

  if (!user || !raw) {
    return redirect("/auth/login");
  }

  const { data: _urls } = await getUserUrls(raw.id);
  const urls: UserUrl[] = (_urls ?? []) as UserUrl[];
  const { data: _stats } = await getStatsUrls(urls.map(item => item.slug));
  const stats: ILinkStats[] = _stats ?? [];

  const slugs = ['xGrjEu']; //['xGrjEu', 'GfpEB7', 'MHYhqi'];
  const date = dayjs('2025-09-20T00:00:00Z');
  const dateWeekAgo = date.subtract(1, 'week');
  const { data: _weekStats } = await StatsRepository.getDayStatsBetweenDates(slugs, dateWeekAgo.toDate(), date.toDate());
  const weekStats: ILinkDateStats[] = (_weekStats ?? []) as ILinkDateStats[];

  return (
    <UserDashboard
      urls={urls}
      stats={stats}
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
