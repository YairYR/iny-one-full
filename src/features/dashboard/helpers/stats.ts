import { ILinkStats, UserUrl } from "@/features/dashboard/types/types";

export function calcUserStats(urls: UserUrl[], stats: ILinkStats[]) {
  const totalClicks = stats.reduce((total, item) => total + item.total_clicks, 0);
  const statsByClicks = stats.sort((a, b) => b.total_clicks - a.total_clicks);
  const countries = stats.reduce((all, item) => {
    Object.keys(item.country_counts).forEach((country) => {
      if(!(country in all)) {
        all[country] = 0;
      }
      all[country] += item.country_counts[country];
    });
    return all;
  }, {} as Record<string, number>);
  const countriesSorted = Object.entries(countries).sort((a, b) => b[1] - a[1]);

  const links = urls.map((url) => ({
    ...url,
    stats: stats.find(item => item.slug === url.slug)
  }));

  return {
    general: {
      totalLinks: urls.length,
      totalClicks: totalClicks,
      clicksLast24h: '-',
      topLink: statsByClicks[0].slug,
      topCountry: countriesSorted[0]?.[0],
      // avgCTR: "12.4%",
    },
    links,
    stats,
  };
}