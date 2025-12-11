import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { SessionNotFoundError } from "@/lib/api/errors";
import { getUserRepository } from "@/infra/db/user.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { getStatsRepository } from "@/infra/db/stats.repository";
import { ILinkDateStats, ILinkStats, UserUrl } from "@/features/dashboard/types/types";
import { successResponse } from "@/lib/api/responses";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const GET = withErrorHandling(async () => {
  const user = await getCurrentUserDTO();
  if (!user) {
    throw new SessionNotFoundError();
  }

  const userRepo = getUserRepository(supabase_service);
  const statsRepo = getStatsRepository(supabase_service);

  const { data: _urls } = await userRepo.getUrls(user.id);
  const urls: UserUrl[] = (_urls ?? []) as UserUrl[];
  const slugs = urls.map(item => item.slug);
  const { data: _stats } = await statsRepo.getStatsUrls(slugs);
  const stats: ILinkStats[] = _stats ?? [];

  const date = dayjs.utc();
  const dateWeekAgo = date.subtract(1, 'week');
  const date24HoursAgo = date.subtract(24, 'hour');
  const { data: _weekStats } = await statsRepo.getDayStatsBetweenDates(slugs, dateWeekAgo.toDate(), date.toDate());
  const weekStats: ILinkDateStats[] = (_weekStats ?? []) as ILinkDateStats[];

  const { data: refererStats } = await statsRepo.getRefererersStats(slugs);
  const { data: clicksLast24h } = await statsRepo.getClicksBetween(slugs, date24HoursAgo.toDate(), date.toDate());

  return successResponse({
    urls,
    stats,
    refererStats: refererStats ?? [],
    clicksLast24h,
    weekStats:{
      stats: weekStats,
      start: dateWeekAgo.toDate(),
      end: date.toDate(),
      totalDays: 7,
    }
  });
});