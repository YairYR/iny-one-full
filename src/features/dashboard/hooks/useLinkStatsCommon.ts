import { getLinkStatsCommon } from "@/features/dashboard/services/getStats";
import useSWR from "swr";

export const useLinkStatsCommon = (slug: string|null) => {
    const { data, error, isLoading, isValidating } = useSWR(slug ? [slug, 'stats-link', 'common'] : null, getLinkStatsCommon);

    return {
        slug,
        data,
        isLoading,
        isValidating,
        error,
    };
}
