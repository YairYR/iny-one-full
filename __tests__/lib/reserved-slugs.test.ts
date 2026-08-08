import {
  getReservedSlugReason,
  isReservedSlug,
  normalizeSlug,
} from '@/lib/reserved-slugs';

describe('normalizeSlug', () => {
  it('lowercases, trims and strips surrounding slashes', () => {
    expect(normalizeSlug('  /Dashboard/ ')).toBe('dashboard');
  });

  it('decodes percent-encoded input', () => {
    expect(normalizeSlug('%61bout')).toBe('about');
  });
});

describe('isReservedSlug', () => {
  it.each([
    'about',
    'plans',
    'dashboard',
    'auth',
    'api',
    'robots.txt',
    'sitemap.xml',
    'favicon.ico',
    'es',
    'en',
  ])('rejects the system route "%s"', (slug) => {
    expect(isReservedSlug(slug)).toBe(true);
  });

  it.each(['api/keys', 'dashboard/settings', 'es/about'])(
    'rejects anything under the reserved prefix "%s"',
    (slug) => {
      expect(isReservedSlug(slug)).toBe(true);
    },
  );

  it.each([
    ['empty', ''],
    ['hidden file', '.env'],
    ['path traversal', '..'],
    ['encoded slash', 'a%2fb'],
    ['whitespace', 'my slug'],
    ['only digits', '12345'],
    ['only separators', '---'],
    ['query fragment', 'abc?x=1'],
  ])('rejects an unsafe slug (%s)', (_label, slug) => {
    expect(isReservedSlug(slug)).toBe(true);
  });

  it('applies the denylist regardless of case or padding', () => {
    expect(isReservedSlug('  DASHBOARD ')).toBe(true);
  });

  it.each(['abc1234', 'my-link', 'a1b2c3', 'promo_2026'])(
    'accepts the regular slug "%s"',
    (slug) => {
      expect(isReservedSlug(slug)).toBe(false);
    },
  );
});

describe('getReservedSlugReason', () => {
  it('explains why a slug was rejected', () => {
    expect(getReservedSlugReason('dashboard')).toBe('Slug reservado por el sistema');
    expect(getReservedSlugReason('api/keys')).toBe('Slug bajo prefijo reservado');
    expect(getReservedSlugReason('..')).toBe('Slug inválido o riesgoso');
    expect(getReservedSlugReason('')).toBe('Slug vacío');
  });

  it('returns null for an acceptable slug', () => {
    expect(getReservedSlugReason('abc1234')).toBeNull();
  });
});
