import { getLinkStatsCommon } from "@/features/dashboard/services/getStats";
import useSWR from "swr";

export const useLinkStatsCommon = (link_id: string|null) => {
    const { data, error, isLoading, isValidating } = useSWR(link_id ? [link_id, 'stats-link', 'common'] : null, getLinkStatsCommon);

    return {
        link_id,
        data,
        isLoading,
        isValidating,
        error,
    };
}
