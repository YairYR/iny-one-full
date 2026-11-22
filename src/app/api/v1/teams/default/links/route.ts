import { NextRequest } from "next/server";
import { z } from "zod";
import { isLoggedIn } from "@/data/dto/user-dto";
import { getDefaultTeamAccess } from "@/features/authorization/helpers/access";
import { getTeamRepository } from "@/infra/db/team.repository";
import { ApiError, InsufficientPermissionsError, SessionNotFoundError } from "@/lib/api/errors";
import { ERROR } from "@/lib/api/error-codes";
import { withPrivateErrorHandling } from "@/lib/api/http";
import { successResponse } from "@/lib/api/responses";
import { logger } from "@/lib/logger";
import { supabase_service } from "@/infra/db/supabase_service";

const PAGE_SIZE = 20;
const log = logger.child({ route: 'api/v1/teams/default/links' });
const pageSchema = z.string().regex(/^[1-9]\d*$/)
  .transform(Number)
  .refine((page) => Number.isSafeInteger(page) && Number.isSafeInteger(page * PAGE_SIZE));

export const GET = withPrivateErrorHandling(async (request: NextRequest) => {
  const page = pageSchema.parse(request.nextUrl.searchParams.get('page') ?? '1');
  if (!await isLoggedIn()) throw new SessionNotFoundError();
  const access = await getDefaultTeamAccess('links.read');
  if (!access.team_id) throw new SessionNotFoundError();
  if (!access.permitted) throw new InsufficientPermissionsError();

  const result = await getTeamRepository(supabase_service)
    .getLinks(access.team_id, (page - 1) * PAGE_SIZE, PAGE_SIZE);
  if (result.error || !result.data || result.count == null) {
    log.error(result.error, 'failed to fetch team links');
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching team links', { status: 500 });
  }

  return successResponse({
    urls: result.data.map(({ name, utms, ...link }) => ({
      ...link,
      alias: name,
      utm_source: Array.isArray(utms) ? utms[0]?.utm_source ?? null : utms?.utm_source ?? null,
      utm_medium: Array.isArray(utms) ? utms[0]?.utm_medium ?? null : utms?.utm_medium ?? null,
      utm_campaign: Array.isArray(utms) ? utms[0]?.utm_campaign ?? null : utms?.utm_campaign ?? null,
    })),
    pagination: { page, pageSize: PAGE_SIZE, total: result.count },
  });
});
