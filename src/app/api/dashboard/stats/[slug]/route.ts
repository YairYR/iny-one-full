import {withErrorHandling} from "@/lib/api/http";
import {NextRequest} from "next/server";
import {getStatsRepository} from "@/infra/db/stats.repository";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {successResponse} from "@/lib/api/responses";
import {supabase_service} from "@/infra/db/supabase_service";
import {ValidationError} from "@/lib/api/errors";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

export const GET = withErrorHandling(async (request: NextRequest, ctx: RouteContext<'/api/dashboard/stats/[slug]'>) => {
    const { slug } = await ctx.params;
    if (!slug || slug.length <= 0) {
        throw new ValidationError();
    }

    const statsRepo = getStatsRepository(supabase_service);

    const today = dayjs().utc();
    const oneWeekAgo = today.subtract(7, 'day');
    const { data: result } = await statsRepo.getDayStatsBetweenDates([slug], oneWeekAgo.toDate(), today.toDate());
    return successResponse(result ?? []);
});
