import { withErrorHandling } from "@/lib/api/http";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { SessionNotFoundError } from "@/lib/api/errors";
import { getUserRepository } from "@/infra/db/user.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { getStatsRepository } from "@/infra/db/stats.repository";
import { successResponse } from "@/lib/api/responses";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { createClient } from "@/lib/supabase/server";

dayjs.extend(utc);

export const GET = withErrorHandling(async () => {
    const user = await getCurrentUserDTO();
    if (!user) {
        throw new SessionNotFoundError();
    }

    const supabase = await createClient();
    const userRepo = getUserRepository(supabase);
    const statsRepo = getStatsRepository(supabase_service);

    // La tabla se pagina (20 por página) pero los agregados NO pueden calcularse
    // sobre esa página: `getStatsUserUrls` sin argumentos devuelve 20 enlaces, y
    // con ellos el total de clics y el número de enlaces salían mal sin ninguna
    // señal. Es el mismo fallo que se corrigió en /api/dashboard/stats.
    const [{ data: _urls }, { data: allSlugs }] = await Promise.all([
        userRepo.getStatsUserUrls(user.id),
        userRepo.getSlugs(user.id),
    ]);

    const slugs = (allSlugs ?? []).map(item => item.slug);

    const today = dayjs().utc();
    const yesterday = today.subtract(1, 'day');

    const [
        clicksAllTime,
        clicksLastDay,
    ] = await Promise.all([
        statsRepo.getClicksAllTime(slugs),
        statsRepo.getClicksBetweenTime(slugs, yesterday.toDate(), today.toDate()),
    ]);

    return successResponse({
        urls: _urls,
        links: slugs.length,
        allTime: {
            clicks: clicksAllTime.data?.[0]?.sum ?? 0,
            country: ''
        },
        lastDay: {
            clicks: clicksLastDay.count,
        },
    });
});
