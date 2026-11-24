import { withPrivateErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { InsufficientPermissionsError, ServiceError, SessionNotFoundError } from "@/lib/api/errors";
import { getStatsRepository } from "@/infra/db/stats.repository";
import { successResponse } from "@/lib/api/responses";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { getDefaultTeamAccess } from "@/features/authorization/helpers/access";
import { isLoggedIn } from "@/data/dto/user-dto";
import { z } from "zod";
import {createClient} from "@/lib/supabase/server";

dayjs.extend(utc);

const kpiNames = ['total_links', 'total_clicks', 'top_country', 'last_clicks', 'traffic', 'week', 'performance'] as const;
const kpiSchema = z.enum(kpiNames);

const paramsSchema = z.object({
  kpi: z.string().min(1).transform((value) => value.split(','))
    .pipe(z.array(kpiSchema).min(1)).optional(),
});

export const GET = withPrivateErrorHandling(async (request: NextRequest) => {
  const params = paramsSchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!await isLoggedIn()) throw new SessionNotFoundError();

  const access = await getDefaultTeamAccess('stats.view');
  if (!access.team_id) throw new SessionNotFoundError();
  if (!access.permitted) throw new InsufficientPermissionsError();

  const teamId = access.team_id;
  const statsRepo = getStatsRepository(await createClient());

  const now = dayjs().utc();
  const oneWeekAgo = now.subtract(6, 'day').toDate();
  const today = now.toDate();

  const requested = [...new Set(params.kpi)];
  const summary = await statsRepo.getDashboardStatsSummary(teamId, requested, oneWeekAgo, today);

  if (!summary.data) {
    throw new ServiceError();
  }

  return successResponse({
    range: {
      date_start: oneWeekAgo,
      date_end: today,
    },
    summary: summary.data
  });
});
