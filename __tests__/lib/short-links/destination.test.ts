import { buildDestination, sanitizeUtmValue } from '@/lib/short-links/destination';

describe('sanitizeUtmValue', () => {
  it('strips characters outside the url-safe set', () => {
    expect(sanitizeUtmValue('summer sale!/2026')).toBe('summersale2026');
  });

  it('returns null for empty input and for values that sanitize to nothing', () => {
    expect(sanitizeUtmValue('')).toBeNull();
    expect(sanitizeUtmValue(null)).toBeNull();
    expect(sanitizeUtmValue(undefined)).toBeNull();
    expect(sanitizeUtmValue('!!!')).toBeNull();
  });
});

describe('buildDestination', () => {
  const noUtm = { source: null, medium: null, campaign: null };

  // Regresión: la implementación anterior recorría todos los parámetros de la
  // query y reasignaba cada uno con `utm[nombre]`, de modo que cualquier
  // parámetro ajeno a los UTM terminaba con el valor literal "undefined".
  it('preserves query parameters that are not utm', () => {
    const { destination } = buildDestination(
      'https://example.com/search?q=hello&page=2',
      noUtm,
      'free',
    );

    const url = new URL(destination);
    expect(url.searchParams.get('q')).toBe('hello');
    expect(url.searchParams.get('page')).toBe('2');
  });

  it('keeps non-utm parameters intact while applying utm', () => {
    const { destination } = buildDestination(
      'https://example.com/product?id=42&ref=partner',
      { source: 'instagram', medium: 'social', campaign: 'launch' },
      'free',
    );

    const url = new URL(destination);
    expect(url.searchParams.get('id')).toBe('42');
    expect(url.searchParams.get('ref')).toBe('partner');
    expect(url.searchParams.get('utm_source')).toBe('instagram');
    expect(url.searchParams.get('utm_medium')).toBe('social');
    expect(url.searchParams.get('utm_campaign')).toBe('launch');
  });

  it('drops utm parameters the plan does not allow', () => {
    const { destination, utm } = buildDestination(
      'https://example.com?utm_term=shoes&utm_id=123',
      { source: 'newsletter' },
      'free',
    );

    const url = new URL(destination);
    expect(url.searchParams.has('utm_term')).toBe(false);
    expect(url.searchParams.has('utm_id')).toBe(false);
    // El valor se resuelve igualmente para persistirlo, aunque no viaje en la URL.
    expect(utm.term).toBe('shoes');
  });

  it('keeps the extra utm parameters available to paid plans', () => {
    const { destination } = buildDestination(
      'https://example.com',
      { source: 'ads', medium: 'cpc', campaign: 'q3', term: 'running', content: 'banner', id: 'abc' },
      'pro',
    );

    const url = new URL(destination);
    expect(url.searchParams.get('utm_term')).toBe('running');
    expect(url.searchParams.get('utm_content')).toBe('banner');
    expect(url.searchParams.get('utm_id')).toBe('abc');
  });

  it('lets explicit utm values win over the ones already in the url', () => {
    const { utm } = buildDestination(
      'https://example.com?utm_source=old',
      { source: 'new' },
      'free',
    );

    expect(utm.source).toBe('new');
  });

  it('falls back to the utm already present in the url', () => {
    const { utm } = buildDestination(
      'https://example.com?utm_source=newsletter&utm_medium=email',
      { source: null, medium: null },
      'free',
    );

    expect(utm.source).toBe('newsletter');
    expect(utm.medium).toBe('email');
  });

  it('sanitizes utm values before writing them to the url', () => {
    const { destination } = buildDestination(
      'https://example.com',
      { source: 'black friday!' },
      'free',
    );

    expect(new URL(destination).searchParams.get('utm_source')).toBe('blackfriday');
  });

  it('removes unknown utm parameters', () => {
    const { destination } = buildDestination(
      'https://example.com?utm_whatever=1&keep=2',
      noUtm,
      'free',
    );

    const url = new URL(destination);
    expect(url.searchParams.has('utm_whatever')).toBe(false);
    expect(url.searchParams.get('keep')).toBe('2');
  });

  // Regresión: `decodeURI` lanza URIError ante un `%` suelto, lo que convertía
  // la creación del link en un 500.
  it('does not throw on urls with malformed percent sequences', () => {
    expect(() => buildDestination('https://example.com/100%discount', noUtm, 'free')).not.toThrow();
  });
});
