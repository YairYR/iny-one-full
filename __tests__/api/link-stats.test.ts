/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { ERROR } from '@/lib/api/error-codes';

const getCurrentUserDTO = jest.fn();
const isOwner = jest.fn();
const getDayStatsBetweenDates = jest.fn();

jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/data/dto/user-dto', () => ({ getCurrentUserDTO }));
jest.mock('@/infra/db/user.repository', () => ({ getUserRepository: () => ({ isOwner }) }));
jest.mock('@/infra/db/stats.repository', () => ({
  getStatsRepository: () => ({ getDayStatsBetweenDates }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/api/dashboard/stats/[slug]/route') as typeof import('@/app/api/dashboard/stats/[slug]/route');

const call = (slug: string) =>
  GET(new NextRequest(`https://iny.one/api/dashboard/stats/${slug}`), {
    params: Promise.resolve({ slug }),
  });

describe('GET /api/dashboard/stats/[slug]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCurrentUserDTO.mockResolvedValue({ id: 'user-1' });
    isOwner.mockResolvedValue({ data: { slug: 'abc1234' }, error: null });
    getDayStatsBetweenDates.mockResolvedValue({ data: [{ slug: 'abc1234', date: '2026-01-01' }] });
  });

  it('returns the daily stats to the owner of the link', async () => {
    const response = await call('abc1234');
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual([{ slug: 'abc1234', date: '2026-01-01' }]);
  });

  // Regresión: la ruta leía con el service role (que salta RLS) y no comprobaba
  // ni sesión ni pertenencia, así que cualquiera que conociera un slug podía
  // consultar la analítica de un link ajeno.
  it('rejects an anonymous request', async () => {
    getCurrentUserDTO.mockResolvedValue(null);

    const response = await call('abc1234');
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe(ERROR.SESSION_NOT_FOUND);
    expect(getDayStatsBetweenDates).not.toHaveBeenCalled();
  });

  it('rejects a link that belongs to someone else', async () => {
    isOwner.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const response = await call('abc1234');
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error.code).toBe(ERROR.RESOURCE_NOT_FOUND);
    expect(getDayStatsBetweenDates).not.toHaveBeenCalled();
  });

  it('checks ownership against the session user, not the request', async () => {
    await call('abc1234');

    expect(isOwner).toHaveBeenCalledWith('user-1', 'abc1234');
  });

  it('rejects an empty slug', async () => {
    const response = await call('');

    expect(response.status).toBe(422);
    expect(isOwner).not.toHaveBeenCalled();
  });
});
