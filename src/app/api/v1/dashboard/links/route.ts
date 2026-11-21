import { withPrivateErrorHandling } from "@/lib/api/http";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { ApiError, SessionNotFoundError } from "@/lib/api/errors";
import { ERROR } from "@/lib/api/error-codes";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { getUserRepository } from "@/infra/db/user.repository";
import { successResponse } from "@/lib/api/responses";


export const GET = withPrivateErrorHandling(async () => {
    const user = await getCurrentUserDTO();
    if (!user) {
        throw new SessionNotFoundError();
    }

    const supabase = await createClient();
    const userRepo = getUserRepository(supabase);

    const { data: _urls, error } = await userRepo.getStatsUserUrls(user.id);

    if (error || !_urls) {
        logger.child({ route: 'api/v1/dashboard/links' }).error(error, 'failed to fetch user links');
        throw new ApiError(ERROR.INTERNAL_ERROR, 'Error fetching user links', { status: 500 });
    }

    return successResponse(_urls);
});
