import { withPrivateErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { getStatsRepository } from "@/infra/db/stats.repository";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { successResponse } from "@/lib/api/responses";
import { supabase_service } from "@/infra/db/supabase_service";
import { createClient } from "@/lib/supabase/server";
import { isLoggedIn } from "@/data/dto/user-dto";
import { ApiError, ResourceNotFoundError, SessionNotFoundError, ValidationError } from "@/lib/api/errors";
import { ERROR } from "@/lib/api/error-codes";
import logger from "@/lib/logger";
import { hasTeamPermission } from "@/features/authorization/helpers/access";
import { getTeamRepository } from "@/infra/db/team.repository";
import { uuid } from 'zod';

dayjs.extend(utc);

const isUuid = uuid();

const STATS_WINDOW_DAYS = 7;

const log = logger.child({ route: 'api/v1/dashboard/links/[link_id]' });

export const GET = withPrivateErrorHandling(async (_request: NextRequest, ctx: RouteContext<'/api/v1/dashboard/links/[link_id]'>) => {
  const { link_id } = await ctx.params;
  const validated = isUuid.safeParse(link_id);
  if (!link_id || !validated.success) {
    throw new ValidationError();
  }

  // Estas métricas se leen con el service role, que salta RLS: la pertenencia
  // del link hay que comprobarla aquí de forma explícita.
  const logged = await isLoggedIn();
  if (!logged) {
    throw new SessionNotFoundError();
  }

  const supabase = await createClient();
  const teamRepo = getTeamRepository(supabase);
  const { data: linkTeam, error: linkError } = await teamRepo.getLinkById(link_id);
  if (linkError) {
    log.error(linkError, 'failed to fetch link');
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching link statistics', { status: 500 });
  }
  if (!linkTeam?.team_id) throw new ResourceNotFoundError();

  const [canReadLinks, canViewStats] = await Promise.all([
    hasTeamPermission(linkTeam.team_id, 'links.read'),
    hasTeamPermission(linkTeam.team_id, 'stats.view'),
  ]);
  if (!canReadLinks || !canViewStats) {
    throw new ResourceNotFoundError();
  }

  const statsRepo = getStatsRepository(supabase_service);

  const today = dayjs().utc();
  const [week, todayClicks, linkBreakdown] = await Promise.all([
    statsRepo.getClicksBetweenDates(
      [link_id],
      today.subtract(6, 'day').toDate(),
      today.subtract(1, 'day').toDate(),
    ),
    statsRepo.getClicksToday([link_id]),
    statsRepo.getLinkBreakdown(
      link_id,
      today.subtract(STATS_WINDOW_DAYS, 'day').toDate(),
      today.toDate(),
    ),
  ]);
  if (week.error || todayClicks.error || linkBreakdown.error ||
      !week.data || todayClicks.count == null || !linkBreakdown.data) {
    log.error({ week: week.error, today: todayClicks.error, breakdown: linkBreakdown.error }, 'failed to fetch link statistics');
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching link statistics', { status: 500 });
  }

  const stats = [...week.data];
  stats.push({
    date: today.toISOString().split('T')[0],
    total_clicks: todayClicks.count,
  });
  const response = successResponse({
    link_id,
    stats,
    breakdown: linkBreakdown.data,
  });
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
});
