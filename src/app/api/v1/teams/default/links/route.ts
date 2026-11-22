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
import { createClient } from "@/lib/supabase/server";

// Valores del selector de filas de la tabla. Se pagina en servidor con el tamaño
// elegido: recortar en cliente una página fija de 20 dejaba filas inaccesibles.
const PAGE_SIZES = ['5', '10', '20'] as const;
const MAX_PAGE_SIZE = 20;
const log = logger.child({ route: 'api/v1/teams/default/links' });
const pageSchema = z.string().regex(/^[1-9]\d*$/)
  .transform(Number)
  .refine((page) => Number.isSafeInteger(page) && Number.isSafeInteger(page * MAX_PAGE_SIZE));
const pageSizeSchema = z.enum(PAGE_SIZES).transform(Number);

export const GET = withPrivateErrorHandling(async (request: NextRequest) => {
  const page = pageSchema.parse(request.nextUrl.searchParams.get('page') ?? '1');
  const pageSize = pageSizeSchema.parse(request.nextUrl.searchParams.get('pageSize') ?? '20');
  if (!await isLoggedIn()) throw new SessionNotFoundError();
  const access = await getDefaultTeamAccess('links.read');
  if (!access.team_id) throw new SessionNotFoundError();
  if (!access.permitted) throw new InsufficientPermissionsError();

  const result = await getTeamRepository(await createClient())
    .getLinks(access.team_id, (page - 1) * pageSize, pageSize);
  if (result.error || !result.data || result.count == null) {
    log.error(result.error, 'failed to fetch team links');
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching team links', { status: 500 });
  }

  return successResponse({
    urls: result.data.map(({ name, ...link }) => ({ ...link, alias: name })),
    pagination: { page, pageSize, total: result.count },
  });
});
