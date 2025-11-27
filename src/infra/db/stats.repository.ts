import supabase from "@/infra/db/supabase";

export const StatsRepository = {
  async getStatsUrls(slugs: string[]){
    return supabase
      .from('short_links_stats')
      .select('slug, total_clicks, unique_ips, last_click_at, country_counts, browser_counts, os_counts, device_type_counts, created_at, updated_at')
      .in('slug', slugs);
  },

  async getDayStatsBetweenDates(slug: string[], startDate: Date, endDate: Date) {
    return supabase
      .from('short_links_daily_stats')
      .select('slug, date, total_clicks, unique_ips, country_counts, browser_counts, os_counts, device_type_counts')
      .in('slug', slug)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
  },

  async getRefererersStats(slugs: string[]) {
    return supabase
      .rpc('get_page_traffic', {
        _slug: slugs
      });
  },

  async getClicksBetween(slugs: string[], startDate: Date, endDate: Date) {
    return supabase
      .rpc('get_page_clicks_between_dates', {
        _slug: slugs,
        _start_date: startDate.toISOString(),
        _end_date: endDate.toISOString()
      });
  }
}