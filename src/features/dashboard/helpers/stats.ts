import { ILinkDateStats, ILinkStats, UserUrl } from "@/features/dashboard/types/types";

type WeekStats = {
  stats: ILinkDateStats[];
  start: Date;
  end: Date;
  totalDays: number;
}

export function calcUserStats(urls: UserUrl[], stats: ILinkStats[], weekStats: WeekStats) {
  const totalClicks = stats.reduce((total, item) => total + item.total_clicks, 0);
  const statsByClicks = stats.toSorted((a, b) => b.total_clicks - a.total_clicks);
  const countries = stats.reduce((all, item) => {
    const countries = Object.keys(item.country_counts);
    for (const country of countries) {
      if(!(country in all)) {
        all[country] = 0;
      }
      all[country] += item.country_counts[country];
    }
    return all;
  }, {} as Record<string, number>);
  const countriesSorted = Object.entries(countries).sort((a, b) => b[1] - a[1]);

  const links = urls.map((url) => ({
    ...url,
    stats: stats.find(item => item.slug === url.slug)
  }));

  const week = fillDays(weekStats.stats, {
    startDate: weekStats.start,
    endDate: weekStats.end,
  });

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
    week,
  };
}

function fillDays(stats: ILinkDateStats[], {
  startDate = null,
  endDate = null,
  // startDay = null, // 0=Dom, 1=Lun...
  // endDay = null    // 0=Dom, 1=Lun...
}: { startDate?: Date|null; endDate?: Date|null } = {}) {

  if(stats.length === 0) {
    return { days: [], clicks: [] };
  }

  // Ordenar datos por fecha
  const sorted = [...stats].sort((a, b) => (new Date(a.date)).getTime() - (new Date(b.date)).getTime());

  // Mapa fecha → clics
  const map = Object.fromEntries(
    sorted.map(item => [item.date, item.total_clicks])
  );

  // Fecha inicial base
  const start = startDate
    ? new Date(startDate)
    : new Date(sorted[0].date);

  // Ajuste: buscar el siguiente día de la semana requerido
  // if (startDay !== null) {
  //   while (start.getDay() !== startDay) {
  //     start.setDate(start.getDate() + 1);
  //   }
  // }

  // Fecha final base
  const end = endDate
    ? new Date(endDate)
    : new Date(sorted.at(-1)!.date);

  // Ajuste: buscar el último día de la semana requerido
  // if (endDay !== null) {
  //   while (end.getDay() !== endDay) {
  //     end.setDate(end.getDate() - 1);
  //   }
  // }

  const clicks = [];
  const days = [];

  // Rellenar rango
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    days.push(dateStr);
    clicks.push(map[dateStr] ?? 0);
  }

  return { days, clicks };
}
