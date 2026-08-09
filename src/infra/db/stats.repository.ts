import type { DbInstance } from "@/infra/db/supabase_service";

export function getStatsRepository(db: DbInstance)  {
  return {
    async getDayStatsBetweenDates(slug: string[], startDate: Date, endDate: Date) {
      return db
        .from('short_links_daily_stats')
        .select('slug, date, total_clicks, unique_ips, country_counts, browser_counts, os_counts, device_type_counts')
        .in('slug', slug)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });
    },

    async getRefererersStats(slugs: string[]) {
      return db
        .rpc('get_page_traffic', {
          _slug: slugs
        });
    },

    async getDashboardStatsSummary(slugs: string[], start_date: string, end_date: string, grouping: 'day' | 'week' | 'month' = 'day') {
      return db.rpc('get_dashboard_stats_summary', {
        _slugs: slugs,
        _start_date: start_date,
        _end_date: end_date,
        _date_grouping: grouping,
      })
    },

    /* INACTIVO — sin importaciones ni referencias en el repositorio (rev. 2026-08-09).
     * No se elimina por si retoma uso en una build futura; hoy no tiene efecto en
     * producción. Al reactivarlo: descomentar y cubrirlo con tests. */
    // async getStatsUrls(slugs: string[]) {
    //   return db
    //     .from('short_links_stats')
    //     .select('slug, total_clicks, unique_ips, last_click_at, country_counts, browser_counts, os_counts, device_type_counts, created_at, updated_at')
    //     .in('slug', slugs);
    // },
    //
    // // OJO al reactivar: quedó a medias. No filtra por usuario ni ejecuta la
    // // consulta (devuelve el query builder), así que tal cual no sirve.
    // async getStatsUrlsCurrentUser() {
    //   return db
    //     .from('short_links_stats')
    // },
    //
    // async getClicksBetween(slugs: string[], startDate: Date, endDate: Date) {
    //   return db
    //     .rpc('get_page_clicks_between_dates', {
    //       _slug: slugs,
    //       _start_date: startDate.toISOString(),
    //       _end_date: endDate.toISOString()
    //     });
    // },
  }
}