import {withErrorHandling} from "@/lib/api/http";
import {getCurrentUserDTO} from "@/data/dto/user-dto";
import {SessionNotFoundError} from "@/lib/api/errors";
import {createClient} from "@/lib/supabase/server";
import {getUserRepository} from "@/infra/db/user.repository";
import {UserUrl} from "@/features/dashboard/types/types";
import {successResponse} from "@/lib/api/responses";


export const GET = withErrorHandling(async () => {
    const user = await getCurrentUserDTO();
    if (!user) {
        throw new SessionNotFoundError();
    }

    const supabase = await createClient();
    const userRepo = getUserRepository(supabase);

    const { data: _urls } = await userRepo.getStatsUserUrls(user.id);

    const urls: UserUrl[] = (_urls ?? []) as never as UserUrl[];
    return successResponse(urls);
});
