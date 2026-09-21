import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { getStatsRepository } from "@/infra/db/stats.repository";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { successResponse } from "@/lib/api/responses";
import { supabase_service } from "@/infra/db/supabase_service";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { ResourceNotFoundError, SessionNotFoundError, ValidationError } from "@/lib/api/errors";
import logger from "@/lib/logger";
import { getAccessContext } from "@/features/authorization/helpers/access";
import { getTeamRepository } from "@/infra/db/team.repository";
import { uuid } from 'zod';
import { AuthorizationService } from "@/features/authorization/services/authorization.service";

dayjs.extend(utc);

const isUuid = uuid();

const STATS_WINDOW_DAYS = 7;

const log = logger.child({ route: 'api/dashboard/stats/[link_id]' });

export const GET = withErrorHandling(async (_request: NextRequest, ctx: RouteContext<'/api/dashboard/stats/[link_id]'>) => {
  const { link_id } = await ctx.params;
  const validated = isUuid.safeParse(link_id);
  if (!link_id || !validated.success) {
    throw new ValidationError();
  }

  // Estas métricas se leen con el service role, que salta RLS: la pertenencia
  // del link hay que comprobarla aquí de forma explícita.
  const user = await getCurrentUserDTO();
  if (!user) {
    throw new SessionNotFoundError();
  }

  const access = await getAccessContext();
  if (access.anonymous) {
    throw new SessionNotFoundError();
  }

  const supabase = await createClient();
  const teamRepo = getTeamRepository(supabase);
  const { data: linkTeam } = await teamRepo.getLinkById(link_id);

  const authorization = new AuthorizationService();
  if (!linkTeam
    || !authorization.hasTeamPermission(access, linkTeam.team_id, 'links.read')) {
    throw new ResourceNotFoundError();
  }

  const today = dayjs().utc();
  const { data: stats } = await getStatsRepository(supabase_service).getDayStatsBetweenDates(
    [link_id],
    today.subtract(STATS_WINDOW_DAYS, 'day').toDate(),
    today.toDate(),
  );

  const linkBreakdown = await getStatsRepository(supabase_service).getLinkBreakdown(
    link_id,
    today.subtract(3000, 'day').toDate(),
    today.toDate(),
  );

  log.info({ link_id, stats, linkBreakdown: linkBreakdown.data }, 'Fetched stats for link_id');

  return successResponse({
    link_id,
    stats,
    breakdown: linkBreakdown.data,
  });
});
