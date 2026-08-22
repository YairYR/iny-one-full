import { calcUserStats, categorizeReferer, NO_DATA } from '@/features/dashboard/helpers/stats';
import type { UserDashboardStats } from '@/features/dashboard/services/getStats';

const EMPTY: UserDashboardStats = {
  urls: [],
  topLinks: [],
  refererStats: [],
  summary: {
    date_start: '2026-01-01T00:00:00.000Z',
    date_end: '2026-01-07T00:00:00.000Z',
    clicks: 0,
    clicks_last_24h: 0,
    date_grouping: 'day',
    stats: [],
  },
  all_time: { clicks: 0, top_browsers: [], top_countries: [] },
  pagination: { page: 1, pageSize: 20, total: 0 },
};

const build = (overrides: Partial<UserDashboardStats> = {}): UserDashboardStats => ({
  ...EMPTY,
  ...overrides,
});

describe('calcUserStats', () => {
  // Regresión: `all_time.top_countries[0].name` reventaba el dashboard de
  // cualquier cuenta que todavía no hubiera recibido un solo clic.
  it('does not throw for an account with no clicks yet', () => {
    expect(() => calcUserStats(EMPTY)).not.toThrow();
  });

  it('reports the placeholder instead of crashing on empty rankings', () => {
    expect(calcUserStats(EMPTY).general).toMatchObject({
      totalLinks: 0,
      totalClicks: 0,
      clicksLast24h: NO_DATA,
      topLink: NO_DATA,
      topCountry: NO_DATA,
    });
  });

  // Regresión: los KPI se calculaban sobre las 20 filas que devolvía la
  // consulta paginada, así que una cuenta con más links mostraba totales
  // incorrectos sin ninguna señal.
  it('takes the link count from the pagination total, not from the visible page', () => {
    const stats = calcUserStats(build({
      urls: new Array(20).fill(null).map((_, index) => ({
        slug: `slug${index}`,
        alias: null,
        destination: 'https://example.com',
        created_at: '2026-01-01T00:00:00.000Z',
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        clicks: 0,
      })),
      pagination: { page: 1, pageSize: 20, total: 137 },
    }));

    expect(stats.general.totalLinks).toBe(137);
    expect(stats.links).toHaveLength(20);
  });

  it('takes the top link from the global ranking', () => {
    const stats = calcUserStats(build({
      topLinks: [{ slug: 'bbb2222', clicks: 9 }, { slug: 'aaa1111', clicks: 2 }],
      all_time: { clicks: 11, top_browsers: [], top_countries: [{ name: 'CL', value: 8 }] },
      summary: { ...EMPTY.summary, clicks_last_24h: 4 },
      pagination: { page: 2, pageSize: 20, total: 40 },
    }));

    expect(stats.general).toMatchObject({
      totalClicks: 11,
      clicksLast24h: 4,
      topLink: 'bbb2222',
      topCountry: 'CL',
    });
  });

  it('fills every day of the requested range', () => {
    const { week } = calcUserStats(EMPTY);

    expect(week.clicks).toHaveLength(7);
    expect(week.clicks.every((value) => value === 0)).toBe(true);
  });

  it('computes referer percentages without producing NaN', () => {
    const { traffic } = calcUserStats(build({
      refererStats: [
        { referer: 'https://www.instagram.com/', count: 3 },
        { referer: '', count: 1 },
      ],
    }));

    expect(traffic.Instagram.value).toBe(75);
    expect(traffic.Direct.value).toBe(25);
    expect(Object.values(traffic).every((item) => Number.isFinite(item.value))).toBe(true);
  });

  it('keeps percentages at zero when every referer has zero clicks', () => {
    const { traffic } = calcUserStats(build({
      refererStats: [{ referer: 'https://www.google.com/', count: 0 }],
    }));

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
