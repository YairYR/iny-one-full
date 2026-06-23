import { getStatsCommon } from "@/features/dashboard/services/getStats";
import useSWR from "swr";

export const useStatsCommon = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR(['stats', 'common'], getStatsCommon);

  const mutateAlias = async (slug: string, alias: string) => {
    if(!data) return;
    const mutatedUrls = data.urls.map(url => url.slug === slug ? { ...url, alias } : url);
    await mutate({ ...data, urls: mutatedUrls }, false);
  }

  //const mutateLinkStats = async ()

  return {
    data,
    isLoading,
    isValidating,
    error,
    mutateAlias,
  };
}
