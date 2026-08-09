import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
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

/** Links por página en la tabla del dashboard. */
const PAGE_SIZE = 20;

/** Links del ranking de rendimiento que se envían al cliente. */
const TOP_LINKS = 5;

export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await getCurrentUserDTO();
  if (!user) {
    throw new SessionNotFoundError();
  }

  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);
  const statsRepo = getStatsRepository(supabase_service);

  const date = dayjs().utc();

  // Los KPI y las series se calculan sobre todos los links del usuario; la
  // tabla sólo muestra la página pedida. Antes ambas cosas salían de la misma
  // consulta limitada a 20 filas, así que las métricas de una cuenta con más
  // links eran incorrectas sin ninguna señal.
  const [allSlugs, pageUrls, topLinks] = await Promise.all([
    userRepo.getSlugs(user.id),
    userRepo.getStatsUserUrls(user.id, (page - 1) * PAGE_SIZE, PAGE_SIZE),
    userRepo.getTopLinks(user.id, TOP_LINKS),
  ]);

  const slugs = (allSlugs.data ?? []).map((item) => item.slug).filter((slug): slug is string => slug !== null);

  const [summaryResponse, refererResponse] = await Promise.all([
    statsRepo.getDashboardStatsSummary(slugs, date.subtract(1, 'week').toISOString(), date.toISOString(), 'day'),
    statsRepo.getRefererersStats(slugs),
  ]);

  if (!summaryResponse.data || summaryResponse.error) {
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching stats summary');
  }

  return successResponse({
    urls: (pageUrls.data ?? []) as never as UserUrl[],
    topLinks: (topLinks.data ?? []).map(({ slug, clicks }) => ({ slug: slug ?? '', clicks: clicks ?? 0 })),
    refererStats: refererResponse.data ?? [],
    summary: summaryResponse.data.summary,
    all_time: summaryResponse.data.all_time,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: pageUrls.count ?? 0,
    },
  });
});
