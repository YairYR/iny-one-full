import { calcUserStats, categorizeReferer, NO_DATA } from '@/features/dashboard/helpers/stats';
import type { UserDashboardStats } from '@/features/dashboard/services/getStats';
import type { UserUrlStats } from '@/features/dashboard/types/types';

const summary: UserDashboardStats['summary'] = {
  date_start: '2026-01-01T00:00:00.000Z',
  date_end: '2026-01-07T00:00:00.000Z',
  clicks: 0,
  clicks_last_24h: 0,
  date_grouping: 'day',
  stats: [],
};

const emptyAllTime: UserDashboardStats['all_time'] = {
  clicks: 0,
  top_browsers: [],
  top_countries: [],
};

describe('calcUserStats', () => {
  // Regresión: `all_time.top_countries[0].name` reventaba el dashboard de
  // cualquier cuenta que todavía no hubiera recibido un solo clic.
  it('does not throw for an account with no clicks yet', () => {
    expect(() => calcUserStats([], summary, emptyAllTime, [])).not.toThrow();
  });

  it('reports the placeholder instead of crashing on empty rankings', () => {
    const { general } = calcUserStats([], summary, emptyAllTime, []);

    expect(general).toMatchObject({
      totalLinks: 0,
      totalClicks: 0,
      clicksLast24h: NO_DATA,
      topLink: NO_DATA,
      topCountry: NO_DATA,
    });
  });

  it('surfaces the top link and country when there is data', () => {
    const urls: UserUrlStats[] = [
      {
        slug: 'aaa1111',
        alias: null,
        destination: 'https://example.com/a',
        created_at: '2026-01-01T00:00:00.000Z',
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        clicks: 2,
        stats: {
          slug: 'aaa1111',
          total_clicks: 2,
          unique_ips: 2,
          last_click_at: null,
          country_counts: {},
          browser_counts: {},
          os_counts: {},
          device_type_counts: {},
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
        },
      },
      {
        slug: 'bbb2222',
        alias: null,
        destination: 'https://example.com/b',
        created_at: '2026-01-02T00:00:00.000Z',
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        clicks: 9,
        stats: {
          slug: 'bbb2222',
          total_clicks: 9,
          unique_ips: 7,
          last_click_at: null,
          country_counts: {},
          browser_counts: {},
          os_counts: {},
          device_type_counts: {},
          created_at: '2026-01-02T00:00:00.000Z',
          updated_at: '2026-01-02T00:00:00.000Z',
        },
      },
    ];

    const { general, statsByClicks } = calcUserStats(
      urls,
      { ...summary, clicks_last_24h: 4 },
      { clicks: 11, top_browsers: [], top_countries: [{ name: 'CL', value: 8 }] },
      [],
    );

    expect(general).toMatchObject({
      totalLinks: 2,
      totalClicks: 11,
      clicksLast24h: 4,
      topLink: 'bbb2222',
      topCountry: 'CL',
    });
    expect(statsByClicks[0].slug).toBe('bbb2222');
  });

  it('fills every day of the requested range', () => {
    const { week } = calcUserStats([], summary, emptyAllTime, []);

    expect(week.clicks).toHaveLength(7);
    expect(week.clicks.every((value) => value === 0)).toBe(true);
  });

  it('computes referer percentages without producing NaN', () => {
    const { traffic } = calcUserStats([], summary, emptyAllTime, [
      { referer: 'https://www.instagram.com/', count: 3 },
      { referer: '', count: 1 },
    ]);

    expect(traffic.Instagram.value).toBe(75);
    expect(traffic.Direct.value).toBe(25);
    expect(Object.values(traffic).every((item) => Number.isFinite(item.value))).toBe(true);
  });

  it('keeps percentages at zero when every referer has zero clicks', () => {
    const { traffic } = calcUserStats([], summary, emptyAllTime, [
      { referer: 'https://www.google.com/', count: 0 },
    ]);

    expect(traffic.Google.value).toBe(0);
  });
});

describe('categorizeReferer', () => {
  it.each([
    ['https://www.facebook.com/page', 'Facebook'],
    ['https://l.facebook.com/', 'Facebook'],
    ['https://www.instagram.com/', 'Instagram'],
    ['https://t.co-not-matching.com', 'Others'],
    ['https://x.com/post', 'Twitter'],
    ['https://wa.me/123', 'WhatsApp'],
    ['https://lnkd.in/abc', 'LinkedIn'],
    ['https://www.google.com/search', 'Google'],
    ['', 'Direct'],
  ])('classifies %s as %s', (referer, expected) => {
    expect(categorizeReferer(referer)).toBe(expected);
  });
});
