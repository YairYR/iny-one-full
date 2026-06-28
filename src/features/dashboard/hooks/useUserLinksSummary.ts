import { getUserLinksSummary } from "@/features/dashboard/services/getStats";
import useSWR from "swr";

export const useUserLinksSummary = () => {
    const { data, error, isLoading, isValidating } = useSWR(['dashboard', 'links', 'summary'], getUserLinksSummary);

    return {
        data,
        isLoading,
        isValidating,
        error,
    };
}
