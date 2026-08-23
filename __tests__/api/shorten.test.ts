/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { ERROR } from '@/lib/api/error-codes';
import { PG_ERROR } from '@/infra/db/db-errors';
import { RATE_LIMITS, defaultUsageStore } from '@/lib/utils/rate-limits';

const create = jest.fn();
const isSafeDomain = jest.fn();
const countLinksByIpInLastMonth = jest.fn();
const countLinksByUserInLastMonth = jest.fn();
const getCurrentUser = jest.fn();
const bloomHas = jest.fn();

jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/lib/utils/check_domain', () => ({ loadBloom: () => ({ has: bloomHas }) }));
jest.mock('@/infra/db/shorter.repository', () => ({
  getShorterRepository: () => ({
    create,
    isSafeDomain,
    countLinksByIpInLastMonth,
    countLinksByUserInLastMonth,
  }),
}));
jest.mock('@/infra/db/user.repository', () => ({
  getUserRepository: () => ({ getCurrentUser }),
}));

// Se importa después de registrar los mocks para que la ruta reciba los dobles.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require('@/app/api/v1/shorten/route') as typeof import('@/app/api/v1/shorten/route');

type ShortenBody = {
  url: string;
  utm?: { source: string; medium: string; campaign: string };
  slug?: string;
};

function request(body: ShortenBody, headers: Record<string, string> = {}) {
  return new NextRequest('https://iny.one/api/v1/shorten', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ utm: { source: '', medium: '', campaign: '' }, ...body }),
  });
}

const anonymous = { 'x-forwarded-for': '203.0.113.10' };

describe('POST /api/v1/shorten', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    defaultUsageStore.clear();

    bloomHas.mockReturnValue(false);
    create.mockResolvedValue({ error: null });
    isSafeDomain.mockResolvedValue({ data: true, error: null });
    countLinksByIpInLastMonth.mockResolvedValue({ count: 0, error: null });
    countLinksByUserInLastMonth.mockResolvedValue({ count: 0, error: null });
    getCurrentUser.mockResolvedValue({ data: { user: null, role: null, plan: null } });
  });

  it('creates a short link and returns its url', async () => {
    const response = await POST(request({ url: 'https://example.com' }), undefined);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data.short).toMatch(/^https:\/\/iny\.one\/[a-z0-9_-]{7}$/i);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('rejects a payload that is not a valid url', async () => {
    const response = await POST(request({ url: 'not a url' }), undefined);
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.error.code).toBe(ERROR.VALIDATION_ERROR);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects the shortener own domain', async () => {
    const response = await POST(request({ url: 'https://iny.one/abc1234' }), undefined);

    expect(response.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a domain flagged as unsafe', async () => {
    bloomHas.mockReturnValue(true);
    isSafeDomain.mockResolvedValue({ data: false, error: null });

    const response = await POST(request({ url: 'https://malware.example' }), undefined);

    expect(response.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });

  it('skips the database check when the bloom filter clears the domain', async () => {
    await POST(request({ url: 'https://example.com' }), undefined);

    expect(isSafeDomain).not.toHaveBeenCalled();
  });

  // Regresión: una colisión de nanoid devolvía un 500 sin reintentar.
  it('retries with a fresh slug when the insert hits a unique violation', async () => {
    create
      .mockResolvedValueOnce({ error: { code: PG_ERROR.UNIQUE_VIOLATION } })
      .mockResolvedValueOnce({ error: null });

    const response = await POST(request({ url: 'https://example.com' }), undefined);

    expect(response.status).toBe(200);
    expect(create).toHaveBeenCalledTimes(2);

    const [first, second] = create.mock.calls.map(([input]) => input.slug);
    expect(first).not.toBe(second);
  });

  it('gives up after exhausting the slug attempts', async () => {
    create.mockResolvedValue({ error: { code: PG_ERROR.UNIQUE_VIOLATION } });

    const response = await POST(request({ url: 'https://example.com' }), undefined);

    expect(response.status).toBe(500);
    expect(create).toHaveBeenCalledTimes(5);
  });

  it('does not retry on an error that is not a collision', async () => {
    create.mockResolvedValue({ error: { code: '42P01', message: 'relation does not exist' } });

    const response = await POST(request({ url: 'https://example.com' }), undefined);

    expect(response.status).toBe(500);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('returns 429 once the anonymous quota is spent', async () => {
    countLinksByIpInLastMonth.mockResolvedValue({
      count: RATE_LIMITS.freeAnonymous,
      error: null,
    });

    const response = await POST(request({ url: 'https://example.com' }, anonymous), undefined);
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error.code).toBe(ERROR.RATE_LIMIT_EXCEEDED);
    expect(create).not.toHaveBeenCalled();
  });

  it('counts the created link so the next request sees the updated quota', async () => {
    countLinksByIpInLastMonth.mockResolvedValue({
      count: RATE_LIMITS.freeAnonymous - 1,
      error: null,
    });

    const first = await POST(request({ url: 'https://example.com' }, anonymous), undefined);
    expect(first.status).toBe(200);

    const second = await POST(request({ url: 'https://example.org' }, anonymous), undefined);
    expect(second.status).toBe(429);

    // La segunda petición se resuelve desde la caché, sin volver a contar en base de datos.
    expect(countLinksByIpInLastMonth).toHaveBeenCalledTimes(1);
  });

  // Regresión: un usuario autenticado sin plan en su metadata no pasaba por
  // ninguna comprobación de cuota.
  it('applies the free quota to an authenticated user with no plan', async () => {
    getCurrentUser.mockResolvedValue({ data: { user: { id: 'user-1' }, role: null, plan: null } });
    countLinksByUserInLastMonth.mockResolvedValue({ count: RATE_LIMITS.free, error: null });

    const response = await POST(request({ url: 'https://example.com' }), undefined);

    expect(response.status).toBe(429);
    expect(create).not.toHaveBeenCalled();
  });

  // Regresión: cada parámetro ajeno a los UTM se sobreescribía con "undefined".
  it('keeps the destination query parameters intact', async () => {
    await POST(
      request({
        url: 'https://example.com/search?q=zapatillas&page=3',
        utm: { source: 'instagram', medium: 'social', campaign: 'verano' },
      }),
      undefined,
    );

    const destination = new URL(create.mock.calls[0][0].destination);
    expect(destination.searchParams.get('q')).toBe('zapatillas');
    expect(destination.searchParams.get('page')).toBe('3');
    expect(destination.searchParams.get('utm_source')).toBe('instagram');
  });

  it('stores an expiry only for anonymous links', async () => {
    await POST(request({ url: 'https://example.com' }), undefined);
    expect(create.mock.calls[0][0].expires).toMatchObject({ expires_in_days: 180 });

    jest.clearAllMocks();
    defaultUsageStore.clear();
    create.mockResolvedValue({ error: null });
    bloomHas.mockReturnValue(false);
    countLinksByUserInLastMonth.mockResolvedValue({ count: 0, error: null });
    getCurrentUser.mockResolvedValue({ data: { user: { id: 'user-1' }, role: null, plan: 'pro' } });

    await POST(request({ url: 'https://example.com' }), undefined);
    expect(create.mock.calls[0][0].expires).toBeUndefined();
  });
});

describe('POST /api/v1/shorten · nombre elegido por el usuario', () => {
  const authenticated = { data: { user: { id: 'user-1' }, role: null, plan: { id: null, name: 'free', isFree: true } } };

  beforeEach(() => {
    jest.clearAllMocks();
    defaultUsageStore.clear();

    bloomHas.mockReturnValue(false);
    create.mockResolvedValue({ error: null });
    isSafeDomain.mockResolvedValue({ data: true, error: null });
    countLinksByIpInLastMonth.mockResolvedValue({ count: 0, error: null });
    countLinksByUserInLastMonth.mockResolvedValue({ count: 0, error: null });
    getCurrentUser.mockResolvedValue(authenticated);
  });

  it('uses the slug the user chose', async () => {
    const response = await POST(request({ url: 'https://example.com', slug: 'promo-julio' }), undefined);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.short).toBe('https://iny.one/promo-julio');
    expect(create.mock.calls[0][0].slug).toBe('promo-julio');
  });

  it('normalises the chosen slug to lowercase', async () => {
    await POST(request({ url: 'https://example.com', slug: 'Promo-Julio' }), undefined);

    expect(create.mock.calls[0][0].slug).toBe('promo-julio');
  });

  // El nombre propio es la contrapartida de registrarse: sin sesión no se da.
  it('rejects a chosen slug from an anonymous request', async () => {
    getCurrentUser.mockResolvedValue({ data: { user: null, role: null, plan: null } });

    const response = await POST(
      request({ url: 'https://example.com', slug: 'promo-julio' }, anonymous),
      undefined,
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe(ERROR.SESSION_NOT_FOUND);
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a slug that collides with a reserved route', async () => {
    const response = await POST(request({ url: 'https://example.com', slug: 'dashboard' }), undefined);

    expect(response.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });

  it.each(['ab', 'a'.repeat(33), '-promo', 'promo-', 'pro mo', 'promo.json'])(
    'rejects the malformed slug %p',
    async (slug) => {
      const response = await POST(request({ url: 'https://example.com', slug }), undefined);

      expect(response.status).toBe(422);
      expect(create).not.toHaveBeenCalled();
    },
  );

  // Reintentar con otro nombre le daría un enlace que no pidió: se devuelve
  // conflicto para que elija.
  it('returns 409 and does not retry when the chosen slug is taken', async () => {
    create.mockResolvedValue({ error: { code: PG_ERROR.UNIQUE_VIOLATION } });

    const response = await POST(request({ url: 'https://example.com', slug: 'promo-julio' }), undefined);
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error.code).toBe(ERROR.DUPLICATE_ENTRY);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('falls back to a random slug when none is chosen', async () => {
    const response = await POST(request({ url: 'https://example.com' }), undefined);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.short).toMatch(/^https:\/\/iny\.one\/[a-z0-9_-]{7}$/i);
  });

  // Un slug vacío es "no elegí nombre", no "quiero uno": no debe exigir sesión.
  it('treats an empty slug as no slug at all', async () => {
    getCurrentUser.mockResolvedValue({ data: { user: null, role: null, plan: null } });

    const response = await POST(request({ url: 'https://example.com', slug: '  ' }, anonymous), undefined);

    expect(response.status).toBe(200);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('does not spend quota on a slug it is going to reject', async () => {
    getCurrentUser.mockResolvedValue({ data: { user: null, role: null, plan: null } });

    await POST(request({ url: 'https://example.com', slug: 'promo-julio' }, anonymous), undefined);

    expect(countLinksByIpInLastMonth).not.toHaveBeenCalled();
  });
});
