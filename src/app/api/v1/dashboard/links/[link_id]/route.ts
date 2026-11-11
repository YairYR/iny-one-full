import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { getStatsRepository } from "@/infra/db/stats.repository";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { successResponse } from "@/lib/api/responses";
import { supabase_service } from "@/infra/db/supabase_service";
import { createClient } from "@/lib/supabase/server";
import { isLoggedIn } from "@/data/dto/user-dto";
import { ResourceNotFoundError, SessionNotFoundError, ValidationError } from "@/lib/api/errors";
import logger from "@/lib/logger";
import { hasTeamPermission } from "@/features/authorization/helpers/access";
import { getTeamRepository } from "@/infra/db/team.repository";
import { uuid } from 'zod';

dayjs.extend(utc);

const isUuid = uuid();

const STATS_WINDOW_DAYS = 7;

const log = logger.child({ route: 'api/v1/dashboard/links/[link_id]' });

export const GET = withErrorHandling(async (_request: NextRequest, ctx: RouteContext<'/api/v1/dashboard/links/[link_id]'>) => {
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
  const { data: linkTeam } = await teamRepo.getLinkById(link_id);

  const canReadLinks = await hasTeamPermission(linkTeam?.team_id ?? null, 'links.read');
  if (!canReadLinks) {
    throw new ResourceNotFoundError();
  }

  const statsRepo = getStatsRepository(supabase_service);

  const today = dayjs().utc();
  const { data: clicksWeek } = await statsRepo.getClicksBetweenDates(
    [link_id],
    today.subtract(6, 'day').toDate(),
    today.subtract(1, 'day').toDate(),
  );
  const { count: clicksToday } = await statsRepo.getClicksToday([link_id]);

  const stats = (clicksWeek ?? []);
  stats.push({
    date: today.toISOString().split('T')[0],
    total_clicks: clicksToday ?? 0,
  });

  const linkBreakdown = await statsRepo.getLinkBreakdown(
    link_id,
    today.subtract(STATS_WINDOW_DAYS, 'day').toDate(),
    today.toDate(),
  );

  log.info({ link_id, stats, linkBreakdown: linkBreakdown.data }, 'Fetched stats for link_id');

  return successResponse({
    link_id,
    stats,
    breakdown: linkBreakdown.data,
  });
});
