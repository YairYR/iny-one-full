import { withPrivateErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { ApiError, InsufficientPermissionsError, SessionNotFoundError } from "@/lib/api/errors";
import { supabase_service } from "@/infra/db/supabase_service";
import { getStatsRepository } from "@/infra/db/stats.repository";
import { successResponse } from "@/lib/api/responses";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ERROR } from "@/lib/api/error-codes";
import { logger } from "@/lib/logger";
import { getDefaultTeamAccess } from "@/features/authorization/helpers/access";
import { getTeamRepository } from "@/infra/db/team.repository";
import { isLoggedIn } from "@/data/dto/user-dto";
import { z } from "zod";

dayjs.extend(utc);

const log = logger.child({ route: 'api/v1/dashboard/summary' });
const PAGE_SIZE = 20;
const TOP_LINKS = 5;
const ID_PAGE_SIZE = 500;
const kpiNames = ['total_links', 'total_clicks', 'top_country', 'last_clicks', 'traffic', 'week', 'performance'] as const;
const kpiSchema = z.enum(kpiNames);

const paramsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform((value) => Math.max(1, Number(value)))
    .refine((page) => Number.isSafeInteger(page) && Number.isSafeInteger(page * PAGE_SIZE))
    .optional(),
  links: z.literal('true').optional(),
  kpi: z.string().min(1).transform((value) => value.split(','))
    .pipe(z.array(kpiSchema).min(1)).optional(),
});

const summarySchema = z.object({
  clicks_all_time: z.number(),
  clicks_last_24hrs: z.number(),
  weekly_activity: z.array(z.object({ date: z.string(), clicks: z.number() })),
  top_countries: z.array(z.object({ name: z.string(), value: z.number() })),
});

export const GET = withPrivateErrorHandling(async (request: NextRequest) => {
  const params = paramsSchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const all = params.kpi === undefined && params.links === undefined;
  const requested = new Set(all ? kpiNames : params.kpi ?? []);
  const includeLinks = all || params.links === 'true';
  const includeSummary = requested.has('total_clicks') || requested.has('top_country')
    || requested.has('last_clicks') || requested.has('week');

  if (!await isLoggedIn()) throw new SessionNotFoundError();

  const access = await getDefaultTeamAccess('stats.view');
  if (!access.team_id) throw new SessionNotFoundError();
  if (!access.permitted) throw new InsufficientPermissionsError();

  const teamId = access.team_id;
  const teamRepo = getTeamRepository(supabase_service);
  const statsRepo = getStatsRepository(supabase_service);
  const page = params.page ?? 1;

  const [links, linksCount, topLinks, summary, refererStats] = await Promise.all([
    includeLinks ? teamRepo.getLinks(teamId, (page - 1) * PAGE_SIZE, PAGE_SIZE) : null,
    requested.has('total_links') && !includeLinks ? teamRepo.getLinksCount(teamId) : null,
    requested.has('performance') ? teamRepo.getTopLinks(teamId, TOP_LINKS) : null,
    includeSummary ? statsRepo.getDashboardStatsSummary(teamId) : null,
    requested.has('traffic') ? loadTraffic(teamRepo, statsRepo, teamId) : null,
  ]);

  assertNoError({ links, linksCount, topLinks, summary });
  if ((links && (!links.data || links.count == null)) || (linksCount && linksCount.count == null)
    || (topLinks && !topLinks.data)) {
    log.error('missing dashboard query data');
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching dashboard data', { status: 500 });
  }
  const parsedSummary = summary ? summarySchema.safeParse(summary.data) : null;
  if (parsedSummary && !parsedSummary.success) {
    log.error({ error: parsedSummary.error }, 'invalid dashboard stats summary');
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching stats summary', { status: 500 });
  }

  const summaryData = parsedSummary?.data;
  const now = dayjs().utc();
  const response = successResponse({
    ...(links && {
      urls: (links.data ?? []).map(({ name, utms, ...link }) => ({
        ...link,
        alias: name,
        utm_source: Array.isArray(utms) ? utms[0]?.utm_source ?? null : utms?.utm_source ?? null,
        utm_medium: Array.isArray(utms) ? utms[0]?.utm_medium ?? null : utms?.utm_medium ?? null,
        utm_campaign: Array.isArray(utms) ? utms[0]?.utm_campaign ?? null : utms?.utm_campaign ?? null,
      })),
      pagination: { page, pageSize: PAGE_SIZE, total: links.count ?? 0 },
    }),
    ...(!all && requested.has('total_links') && { totalLinks: links?.count ?? linksCount?.count }),
    ...(topLinks && {
      topLinks: (topLinks.data ?? []).map(({ slug, clicks }) => ({ slug: slug ?? '', clicks: clicks ?? 0 })),
    }),
    ...(refererStats && { refererStats }),
    ...(summaryData && {
      summary: {
        ...(all && { clicks: 0 }),
        ...(requested.has('last_clicks') && { clicks_last_24h: summaryData.clicks_last_24hrs }),
        ...(requested.has('week') && {
          date_start: now.subtract(6, 'day').toISOString(),
          date_end: now.toISOString(),
          date_grouping: 'day' as const,
          stats: summaryData.weekly_activity,
        }),
      },
      all_time: {
        ...(requested.has('total_clicks') && { clicks: summaryData.clicks_all_time }),
        ...(all && { top_browsers: [] }),
        ...(requested.has('top_country') && { top_countries: summaryData.top_countries }),
      },
    }),
  });
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
});

async function loadTraffic(
  teamRepo: ReturnType<typeof getTeamRepository>,
  statsRepo: ReturnType<typeof getStatsRepository>,
  teamId: string,
) {
  const linkIds: string[] = [];
  let total: number;
  do {
    const result = await teamRepo.getLinksId(teamId, linkIds.length, ID_PAGE_SIZE);
    assertNoError({ linkIds: result });
    if (result.count == null || !result.data || (!result.data.length && result.count > linkIds.length)) {
      log.error('incomplete link ids for traffic statistics');
      throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching dashboard data', { status: 500 });
    }
    linkIds.push(...(result.data ?? []).map((item) => item.link_id));
    total = result.count;
  } while (linkIds.length < total);

  if (linkIds.length === 0) return [];
  const result = await statsRepo.getRefererersStats(linkIds);
  assertNoError({ traffic: result });
  if (!result.data) {
    log.error('missing traffic statistics');
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching dashboard data', { status: 500 });
  }
  return result.data;
}

function assertNoError(responses: Record<string, { error: unknown } | null>): void {
  for (const [name, response] of Object.entries(responses)) {
    if (response?.error) {
      log.error(response.error, 'dashboard query failed: %s', name);
      throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching dashboard data', { status: 500 });
    }
  }
}
