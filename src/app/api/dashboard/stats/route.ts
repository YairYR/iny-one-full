import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { ApiError, InsufficientPermissionsError, SessionNotFoundError } from "@/lib/api/errors";
import { getUserRepository } from "@/infra/db/user.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { getStatsRepository } from "@/infra/db/stats.repository";
import { UserUrl } from "@/features/dashboard/types/types";
import { successResponse } from "@/lib/api/responses";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { createClient } from "@/lib/supabase/server";
import { ERROR } from "@/lib/api/error-codes";
import { logger } from "@/lib/logger";
import { getAccessContext } from "@/features/authorization/helpers/access";
import { AuthorizationService } from "@/features/authorization/services/authorization.service";
import { getTeamRepository } from "@/infra/db/team.repository";
import { isLoggedIn } from "@/data/dto/user-dto";
import { DashboardStatsSummary } from "@/lib/types";

dayjs.extend(utc);

const log = logger.child({ route: 'api/dashboard/stats' });

/** Links por página en la tabla del dashboard. */
const PAGE_SIZE = 20;

/** Links del ranking de rendimiento que se envían al cliente. */
const TOP_LINKS = 5;

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Primero validamos con `isLoggedIn` para no hacer consultas a la base de datos si el usuario no tiene sesión. `getAccessContext` hace varias consultas a la base de datos, así que es mejor abortar antes si no hay sesión.
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    throw new SessionNotFoundError();
  }

  const access = await getAccessContext();
  if (access.anonymous || !access.default_team_id) {
    throw new SessionNotFoundError();
  }

  const authorization = new AuthorizationService();
  if (! authorization.hasTeamPermission(access, access.default_team_id, 'stats.view')) {
    throw new InsufficientPermissionsError();
  }

  const teamId = access.default_team_id;
  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);

  const supabase = await createClient();
  const teamRepo = getTeamRepository(supabase);
  const statsRepo = getStatsRepository(supabase_service);

  const date = dayjs().utc();

  // Los KPI y las series se calculan sobre todos los links del usuario; la
  // tabla sólo muestra la página pedida. Antes ambas cosas salían de la misma
  // consulta limitada a 20 filas, así que las métricas de una cuenta con más
  // links eran incorrectas sin ninguna señal.
  const [allLinksId, pageUrls, topLinks] = await Promise.all([
    teamRepo.getLinksId(teamId),
    teamRepo.getLinks(teamId, (page - 1) * PAGE_SIZE, PAGE_SIZE),
    teamRepo.getTopLinks(teamId, TOP_LINKS),
  ]);

  // Un fallo aquí no puede degradarse en silencio: `data` vendría vacío y el
  // dashboard mostraría cero enlaces como si la cuenta no tuviera ninguno, que
  // es indistinguible de un problema real de permisos o de conexión.
  assertNoError({ allLinksId, pageUrls, topLinks });

  const linkIds = (allLinksId.data ?? []).map((item) => item.link_id).filter((linkId): linkId is string => linkId !== null);

  const [summaryResponse, refererResponse] = await Promise.all([
    statsRepo.getDashboardStatsSummary(linkIds, date.subtract(1, 'week').toISOString(), date.toISOString(), 'day'),
    statsRepo.getRefererersStats(linkIds),
  ]);

  if (!summaryResponse.data || summaryResponse.error) {
    log.error(summaryResponse.error, 'failed to fetch stats summary');
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching stats summary');
  }

  const summary = summaryResponse.data as DashboardStatsSummary;

  return successResponse({
    urls: (pageUrls.data ?? []) as never as UserUrl[],
    topLinks: (topLinks.data ?? []).map(({ slug, clicks }) => ({ slug: slug ?? '', clicks: clicks ?? 0 })),
    refererStats: refererResponse.data ?? [],
    summary: summary.summary,
    all_time: summary.all_time,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: pageUrls.count ?? 0,
    },
  });
});

/** Aborta con 500 si alguna de las consultas del panel devolvió error. */
function assertNoError(responses: Record<string, { error: unknown }>): void {
  for (const [name, response] of Object.entries(responses)) {
    if (response.error) {
      log.error(response.error, 'dashboard query failed: %s', name);
      throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching dashboard data');
    }
  }
}
