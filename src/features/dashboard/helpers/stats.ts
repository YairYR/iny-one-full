'use client';

import { ILinkStats, IRefererStat, UserUrlStats } from "@/features/dashboard/types/types";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { UserDashboardStats } from "@/features/dashboard/services/getStats";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

export function calcUserStats(urls: UserUrlStats[], summary: UserDashboardStats['summary'], all_time: UserDashboardStats['all_time'], refererStats?: IRefererStat[]) {
  const stats = urls.reduce((filtered: ILinkStats[], item) => {
    if(item.stats) filtered.push(item.stats);
    return filtered;
  }, []);
  const statsByClicks = stats.toSorted((a, b) => b.total_clicks - a.total_clicks);

  const links = urls.map((url) => ({
    ...url,
    stats: stats.find(item => item.slug === url.slug)
  }));

  const week = fillDays(summary.stats, {
    startDate: dayjs(summary.date_start).toDate(),
    endDate: dayjs(summary.date_end).toDate(),
  });

  const traffic = calcRefererStats(refererStats || []);

  return {
    general: {
      totalLinks: urls.length,
      totalClicks: all_time.clicks,
      clicksLast24h: summary.clicks_last_24h || '-',
      topLink: statsByClicks[0]?.slug,
      topCountry: all_time.top_countries[0].name,
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

function fillDays(stats: UserDashboardStats['summary']['stats'], {
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
    map[item.date] += item.clicks;
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
