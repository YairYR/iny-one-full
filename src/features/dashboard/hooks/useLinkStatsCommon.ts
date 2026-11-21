import { getLinkStatsCommon } from "@/features/dashboard/services/getStats";
import useSWR from "swr";

export const useLinkStatsCommon = (link_id: string|null, range = 7) => {
    const { data, error, isLoading, isValidating, mutate } = useSWR(
      link_id ? [link_id, 'stats-link', 'common', range] : null,
      ([link_id, , , selectedRange]: [string, string, string, number]) =>
        getLinkStatsCommon([link_id, selectedRange]),
    );

    return {
        link_id,
        data,
        isLoading,
        isValidating,
        error,
        mutate,
    };
}
