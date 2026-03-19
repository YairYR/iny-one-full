import { withErrorHandling } from "@/lib/api/http";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { ApiError, SessionNotFoundError } from "@/lib/api/errors";
import { getUserRepository } from "@/infra/db/user.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { getStatsRepository } from "@/infra/db/stats.repository";
import { UserUrl } from "@/features/dashboard/types/types";
import { successResponse } from "@/lib/api/responses";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { createClient } from "@/lib/supabase/server";
import { ERROR } from "@/lib/api/error-codes";

dayjs.extend(utc);

export const GET = withErrorHandling(async () => {
  const user = await getCurrentUserDTO();
  if (!user) {
    throw new SessionNotFoundError();
  }

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);
  const statsRepo = getStatsRepository(supabase_service);

  const { data: _urls } = await userRepo.getStatsUserUrls(user.id);

  const urls: UserUrl[] = (_urls ?? []) as never as UserUrl[];
  const slugs = urls.map(item => item.slug);

  const date = dayjs().utc();
  const dateWeekAgo = date.subtract(4, 'week');

  const statsResponse = await statsRepo.getDashboardStatsSummary(
    slugs,
    dateWeekAgo.toISOString(),
    date.toISOString(),
    'day'
  );

  const { data, error } = statsResponse;

  if(!data || error) {
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching stats summary');
  }

  const { data: refererStats } = await statsRepo.getRefererersStats(slugs);

  return successResponse({
    urls,
    refererStats: refererStats ?? [],
    summary: data.summary,
    all_time: data.all_time
  });
});