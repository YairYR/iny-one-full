import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { getStatsRepository } from "@/infra/db/stats.repository";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { successResponse } from "@/lib/api/responses";
import { supabase_service } from "@/infra/db/supabase_service";
import { createClient } from "@/lib/supabase/server";
import { getUserRepository } from "@/infra/db/user.repository";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { ResourceNotFoundError, SessionNotFoundError, ValidationError } from "@/lib/api/errors";
import logger from "@/lib/logger";

dayjs.extend(utc);

const STATS_WINDOW_DAYS = 7;

const log = logger.child({ route: 'api/dashboard/stats/[slug]' });

export const GET = withErrorHandling(async (_request: NextRequest, ctx: RouteContext<'/api/dashboard/stats/[slug]'>) => {
  const { slug } = await ctx.params;
  if (!slug) {
    throw new ValidationError();
  }

  // Estas métricas se leen con el service role, que salta RLS: la pertenencia
  // del link hay que comprobarla aquí de forma explícita.
  const user = await getCurrentUserDTO();
  if (!user) {
    throw new SessionNotFoundError();
  }

  const supabase = await createClient();
  const { data: owned } = await getUserRepository(supabase).isOwner(user.id, slug);
  if (!owned) {
    throw new ResourceNotFoundError();
  }

  const today = dayjs().utc();
  const { data } = await getStatsRepository(supabase_service).getDayStatsBetweenDates(
    [slug],
    today.subtract(STATS_WINDOW_DAYS, 'day').toDate(),
    today.toDate(),
  );

  const linkBreakdown = await getStatsRepository(supabase_service).getLinkBreakdown(
    slug,
    today.subtract(3000, 'day').toDate(),
    today.toDate(),
  );

  log.info({ slug, data, linkBreakdown }, 'Fetched stats for slug');

  return successResponse({
    slug,
    stats: data,
    breakdown: linkBreakdown,
  });
});
