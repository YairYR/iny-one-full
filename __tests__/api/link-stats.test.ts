/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const isLoggedIn = jest.fn();
const hasTeamPermissions = jest.fn();
const getLinkById = jest.fn();
const getClicksBetweenDates = jest.fn();
const getClicksToday = jest.fn();
const getLinkBreakdown = jest.fn();

jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/data/dto/user-dto', () => ({ isLoggedIn }));
jest.mock('@/features/authorization/helpers/access', () => ({ hasTeamPermissions }));
jest.mock('@/infra/db/team.repository', () => ({ getTeamRepository: () => ({ getLinkById }) }));
jest.mock('@/infra/db/stats.repository', () => ({
  getStatsRepository: () => ({ getClicksBetweenDates, getClicksToday, getLinkBreakdown }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/api/v1/dashboard/links/[link_id]/route') as typeof import('@/app/api/v1/dashboard/links/[link_id]/route');

const linkId = 'c0a80123-4567-4890-8123-456789abcdef';
const call = (id = linkId, range = '') =>
  GET(new NextRequest(`https://iny.one/api/v1/dashboard/links/${id}${range}`), {
    params: Promise.resolve({ link_id: id }),
  });

describe('GET /api/v1/dashboard/links/[link_id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isLoggedIn.mockResolvedValue(true);
    getLinkById.mockResolvedValue({ data: { team_id: 'team-1' }, error: null });
    hasTeamPermissions.mockResolvedValue({
      'links.read': true,
      'stats.view': true,
      'stats.view_sensitive': true,
      'links.update': true,
    });
    getClicksBetweenDates.mockResolvedValue({ data: [{ date: '2026-01-01', total_clicks: 1 }] });
    getClicksToday.mockResolvedValue({ count: 2 });
    getLinkBreakdown.mockResolvedValue({ data: {} });
  });

  it('returns the daily stats to the owner of the link', async () => {
    const response = await call();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.link_id).toBe(linkId);
    expect(payload.data.stats).toEqual([
      { date: '2026-01-01', total_clicks: 1 },
      expect.objectContaining({ total_clicks: 2 }),
    ]);
  });

  it('rejects an anonymous request', async () => {
    isLoggedIn.mockResolvedValue(false);

    const response = await call();

    expect(response.status).toBe(401);
    expect(getClicksBetweenDates).not.toHaveBeenCalled();
  });

  it('rejects a link the current user cannot read', async () => {
    hasTeamPermissions.mockResolvedValue({
      'links.read': false,
      'stats.view': false,
      'stats.view_sensitive': false,
      'links.update': false,
    });

    const response = await call();

    expect(response.status).toBe(404);
    expect(getClicksBetweenDates).not.toHaveBeenCalled();
  });

  it('checks permission for the team that owns the link', async () => {
    await call();
    expect(hasTeamPermissions).toHaveBeenCalledWith('team-1', [
      'links.read',
      'stats.view',
      'stats.view_sensitive',
      'links.update',
    ]);
  });

  it('requires statistics permission even if the link is readable', async () => {
    hasTeamPermissions.mockResolvedValue({
      'links.read': true,
      'stats.view': false,
      'stats.view_sensitive': false,
      'links.update': true,
    });
    expect((await call()).status).toBe(404);
    expect(getClicksBetweenDates).not.toHaveBeenCalled();
  });

  it('distinguishes a failed link lookup from a missing link', async () => {
    getLinkById.mockResolvedValue({ data: null, error: { message: 'unavailable' } });
    const response = await call();
    expect(response.status).toBe(500);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(hasTeamPermissions).not.toHaveBeenCalled();
  });

  it.each([
    ['week', getClicksBetweenDates, { data: null, error: { message: 'unavailable' } }],
    ['today', getClicksToday, { count: null, error: { message: 'unavailable' } }],
    ['breakdown', getLinkBreakdown, { data: null, error: { message: 'unavailable' } }],
  ])('returns an error when %s statistics fail', async (_label, mock, result) => {
    mock.mockResolvedValue(result);
    expect((await call()).status).toBe(500);
  });

  it('returns an error when successful queries omit required data', async () => {
    getClicksToday.mockResolvedValue({ count: null, error: null });
    expect((await call()).status).toBe(500);
  });

  it('returns zero for an explicitly empty current day', async () => {
    getClicksToday.mockResolvedValue({ count: 0, error: null });
    const response = await call();
    expect(response.status).toBe(200);
    expect((await response.json()).data.stats.at(-1).total_clicks).toBe(0);
  });

  it('rejects an invalid link id', async () => {
    const response = await call('not-a-uuid');

    expect(response.status).toBe(422);
    expect(isLoggedIn).not.toHaveBeenCalled();
  });

  it('allows 30-day statistics only with sensitive statistics permission', async () => {
    hasTeamPermissions.mockResolvedValue({
      'links.read': true,
      'stats.view': true,
      'stats.view_sensitive': false,
      'links.update': true,
    });
    expect((await call(linkId, '?range=30')).status).toBe(403);
    expect(getClicksBetweenDates).not.toHaveBeenCalled();
  });

  it('returns 30-day ranges with sensitive statistics permission', async () => {
    const response = await call(linkId, '?range=30');
    expect(response.status).toBe(200);
    expect(getClicksBetweenDates).toHaveBeenCalledWith(
      [linkId],
      expect.any(Date),
      expect.any(Date),
    );
  });

  it('rejects unsupported ranges', async () => {
    expect((await call(linkId, '?range=365')).status).toBe(422);
  });
});
