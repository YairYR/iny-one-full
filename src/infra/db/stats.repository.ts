import supabase from "@/infra/db/supabase";

export const StatsRepository = {
  async getDayStatsBetweenDates(slug: string[], startDate: Date, endDate: Date) {
    return supabase
      .from('short_links_daily_stats')
      .select('slug, date, total_clicks, unique_ips, country_counts, browser_counts, os_counts, device_type_counts')
      .in('slug', slug)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });
  }
}