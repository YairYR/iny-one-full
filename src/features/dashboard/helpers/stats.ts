'use client';

import { ILinkDateStats, ILinkStats, IRefererStat, UserUrl } from "@/features/dashboard/types/types";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

type WeekStats = {
  stats: ILinkDateStats[];
  start: Date;
  end: Date;
  totalDays: number;
}

export function calcUserStats(urls: UserUrl[], stats: ILinkStats[], weekStats: WeekStats, refererStats?: IRefererStat[]) {
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

  const traffic = calcRefererStats(refererStats || []);

  return {
    general: {
      totalLinks: urls.length,
      totalClicks: totalClicks,
      clicksLast24h: '-',
      topLink: statsByClicks[0]?.slug,
      topCountry: countriesSorted[0]?.[0],
    },
    statsByClicks,
    links,
    stats,
    week,
    traffic,
  };
}

export function dayToName(key: number) {
  switch(key) {
    case 0:
      return 'week.sunday';
    case 1:
      return 'week.monday';
    case 2:
      return 'week.tuesday';
    case 3:
      return 'week.wednesday';
    case 4:
      return 'week.thursday';
    case 5:
      return 'week.friday';
    case 6:
      return 'week.saturday';
  }
  return 'week.sunday';
}

function fillDays(stats: ILinkDateStats[], {
  startDate = null,
  endDate = null,
}: { startDate?: Date|null; endDate?: Date|null } = {}) {

  // Ordenar datos por fecha
  const sorted = [...stats].sort((a, b) => (new Date(a.date)).getTime() - (new Date(b.date)).getTime());

  const map: Record<string, number> = {};
  for(const item of sorted) {
    if(!(item.date in map)) {
      map[item.date] = 0;
    }
    map[item.date] += item.total_clicks;
  }

  // Fecha inicial base
  const start = startDate
    ? dayjs.utc(startDate)
    : dayjs.utc(sorted[0].date);

  // Fecha final base
  const end = endDate
    ? dayjs.utc(endDate)
    : dayjs.utc(sorted.at(-1)!.date);

  const clicks: number[] = [];
  const days: string[] = [];
  const daysKey: string[] = [];

  // Rellenar rango
  for (let d = start.toDate(); d <= end.toDate(); d.setDate(d.getDate() + 1)) {
    const day = dayjs.utc(d);
    const dateStr = day.format('YYYY-MM-DD');
    days.push(dateStr);
    daysKey.push(dayToName(day.day()));
    clicks.push(map[dateStr] ?? 0);
  }

  return { days, daysKey, clicks };
}

function calcRefererStats(stats: IRefererStat[]) {
  const referersCount: Record<string, { name: string; count: number, value: number }> = {};

  let total = 0;
  for (const stat of stats) {
    total += stat.count;
    const referer = stat.referer;
    const category = categorizeReferer(referer);

    if (category in referersCount) {
      referersCount[category].count += stat.count;
    } else {
      referersCount[category] = { name: category, count: stat.count, value: 0 };
    }
  }

  for (const key in referersCount) {
    referersCount[key].value = Number.parseFloat(
      ((referersCount[key].count / total) * 100).toFixed(2)
    );
  }

  return referersCount;
}

const FACEBOOK_REGEX = /https?:\/\/(l|lm|m|www)?\.?facebook\.com/;
const INSTAGRAM_REGEX = /https?:\/\/(l|lm|m|www)?\.?instagram\.com/;
const TWITTER_REGEX = /https?:\/\/(t|www)?\.?twitter\.com/;
const WHATSAPP_REGEX = /https?:\/\/(api|www)?\.?whatsapp\.com/;
const LINKEDIN_REGEX = /https?:\/\/(www)?\.?linkedin\.com/;
const GOOGLE_REGEX = /https?:\/\/(www)?\.?google\.com/;
// PINTEREST

const FACEBOOK_2_REGEX = /https?:\/\/(l|lm|m|www)?\.?fb\.com/;
const INSTAGRAM_2_REGEX = /https?:\/\/(l|lm|m|www)?\.?instagr\.am/;
const TWITTER_2_REGEX = /https?:\/\/(t|www)?\.?x\.com/;
const WHATSAPP_2_REGEX = /https?:\/\/(api|www)?\.?wa\.me/;
const LINKEDIN_2_REGEX = /https?:\/\/(www)?\.?lnkd\.in/;
const GOOGLE_2_REGEX = /https?:\/\/(www)?\.?goo\.gl/;

export function categorizeReferer(referer: string): string {
  if (FACEBOOK_REGEX.test(referer) || FACEBOOK_2_REGEX.test(referer)) {
    return 'Facebook';
  } else if (INSTAGRAM_REGEX.test(referer) || INSTAGRAM_2_REGEX.test(referer)) {
    return 'Instagram';
  } else if (TWITTER_REGEX.test(referer) || TWITTER_2_REGEX.test(referer)) {
    return 'Twitter';
  } else if (WHATSAPP_REGEX.test(referer) || WHATSAPP_2_REGEX.test(referer)) {
    return 'WhatsApp';
  } else if (LINKEDIN_REGEX.test(referer) || LINKEDIN_2_REGEX.test(referer)) {
    return 'LinkedIn';
  } else if (GOOGLE_REGEX.test(referer) || GOOGLE_2_REGEX.test(referer)) {
    return 'Google';
  } else if (referer === '' || referer === null) {
    return 'Direct';
  } else {
    return 'Others';
  }
}
