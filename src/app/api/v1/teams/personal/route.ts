import { NextRequest } from "next/server";
import * as z from "zod";
import { getUserRepository } from "@/infra/db/user.repository";
import { getTeamRepository } from "@/infra/db/team.repository";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/http";
import { ApiError, SessionNotFoundError, ValidationError } from "@/lib/api/errors";
import { ERROR } from "@/lib/api/error-codes";
import { successResponse } from "@/lib/api/responses";
import { logger } from "@/lib/logger";
import { isCountryCode, isTimeZone } from "@/features/auth/setup-options";

const log = logger.child({ route: 'api/v1/teams/personal' });
const schema = z.object({
  name: z.string().trim().min(1).max(100),
  fullName: z.string().trim().min(1).max(200),
  country: z.string().refine(isCountryCode).nullable(),
  timezone: z.string().max(100).refine(isTimeZone).nullable(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = schema.safeParse(await request.json());
  if (!body.success) throw new ValidationError();

  const supabase = await createClient();
  const { data } = await getUserRepository(supabase).getCurrentUser();
  if (!data.user) throw new SessionNotFoundError();

  const result = await getTeamRepository(supabase).completePersonalSetup({
    teamName: body.data.name,
    fullName: body.data.fullName,
    country: body.data.country,
    timezone: body.data.timezone,
  });
  if (result.error || !result.data) {
    log.error(result.error, 'failed to configure personal team');
    throw new ApiError(ERROR.INTERNAL_ERROR, 'Unable to configure personal team', { status: 500 });
  }
  return successResponse({ teamId: result.data });
});
