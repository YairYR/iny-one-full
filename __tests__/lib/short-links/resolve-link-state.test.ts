import { resolveLinkState, type LinkRow } from '@/lib/short-links/resolve-link-state';

const NOW = new Date('2026-08-09T12:00:00.000Z');

const link = (overrides: Partial<LinkRow> = {}): LinkRow => ({
  destination: 'https://example.com',
  expires_at: null,
  status: true,
  ...overrides,
});

describe('resolveLinkState', () => {
  it('redirects an active link without expiry', () => {
    expect(resolveLinkState(link(), NOW)).toBe('active');
  });

  it('redirects a link whose expiry is still in the future', () => {
    expect(resolveLinkState(link({ expires_at: '2026-12-01T00:00:00.000Z' }), NOW)).toBe('active');
  });

  it('treats a missing row as not found', () => {
    expect(resolveLinkState(null, NOW)).toBe('not-found');
  });

  it('treats a row without destination as not found', () => {
    expect(resolveLinkState(link({ destination: null }), NOW)).toBe('not-found');
  });

  it('marks a link past its expiry as expired', () => {
    expect(resolveLinkState(link({ expires_at: '2026-08-01T00:00:00.000Z' }), NOW)).toBe('expired');
  });

  it('expires exactly at the boundary', () => {
    expect(resolveLinkState(link({ expires_at: NOW.toISOString() }), NOW)).toBe('expired');
  });

  // Tras la primera visita el resolver escribe status = false. La fila sigue
  // ahí, y hay que reconocerla como caducada en vez de como inexistente.
  it('keeps recognising an already deactivated expired link', () => {
    const deactivated = link({ expires_at: '2026-08-01T00:00:00.000Z', status: false });
    expect(resolveLinkState(deactivated, NOW)).toBe('expired');
  });

  // Sin fecha de caducidad no sabemos por qué se desactivó, así que no procede
  // insinuar que el slug existió.
  it('hides a deactivated link that never had an expiry', () => {
    expect(resolveLinkState(link({ status: false }), NOW)).toBe('not-found');
  });

  it('ignores an unparseable expiry instead of throwing', () => {
    expect(resolveLinkState(link({ expires_at: 'no es una fecha' }), NOW)).toBe('active');
  });

  it('defaults to the current time when none is given', () => {
    expect(resolveLinkState(link({ expires_at: '2000-01-01T00:00:00.000Z' }))).toBe('expired');
  });
});
