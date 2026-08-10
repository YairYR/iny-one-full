import { getStatsCommon } from "@/features/dashboard/services/getStats";
import useSWR, { useSWRConfig } from "swr";

const STATS_KEY = ['stats', 'common'] as const;

export const useStatsCommon = (page = 1) => {
  const { data, error, isLoading, isValidating } = useSWR(
    [...STATS_KEY, page],
    ([, , currentPage]: [string, string, number]) => getStatsCommon(currentPage),
    { keepPreviousData: true },
  );

  return { data, isLoading, isValidating, error };
}

/**
 * Revalida las estadísticas de **todas** las páginas cacheadas.
 *
 * No se suscribe a ninguna: quien edita un alias no necesita los datos, sólo
 * invalidarlos. Antes esto se hacía desde `useStatsCommon()` sin argumentos, lo
 * que actualizaba siempre la caché de la página 1 aunque el usuario estuviera
 * viendo otra, y además abría una segunda petición sólo para obtener la función.
 */
export const useRefreshStats = () => {
  const { mutate } = useSWRConfig();

  return () => mutate(
    (key) => Array.isArray(key) && key[0] === STATS_KEY[0] && key[1] === STATS_KEY[1],
  );
}
