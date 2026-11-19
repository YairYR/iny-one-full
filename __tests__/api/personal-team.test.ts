/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const getCurrentUser = jest.fn();
const completePersonalSetup = jest.fn();

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/user.repository', () => ({
  getUserRepository: () => ({ getCurrentUser }),
}));
jest.mock('@/infra/db/team.repository', () => ({
  getTeamRepository: () => ({ completePersonalSetup }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require('@/app/api/v1/teams/personal/route') as typeof import('@/app/api/v1/teams/personal/route');

function request(name: string, extra: Record<string, unknown> = {}) {
  return new NextRequest('https://iny.one/api/v1/teams/personal', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, fullName: '  Jane Doe  ', country: 'US', timezone: 'America/New_York', ...extra }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  getCurrentUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  completePersonalSetup.mockResolvedValue({ data: 'team-1', error: null });
});

it('configures the personal team with a trimmed name', async () => {
  const response = await POST(request('  My team  '), undefined);
  expect(response.status).toBe(200);
  expect(completePersonalSetup).toHaveBeenCalledWith({
    teamName: 'My team', fullName: 'Jane Doe', country: 'US', timezone: 'America/New_York',
  });
  expect((await response.json()).data.teamId).toBe('team-1');
});

it('requires a valid name and an authenticated user', async () => {
  expect((await POST(request('  '), undefined)).status).toBe(422);
  getCurrentUser.mockResolvedValue({ data: { user: null } });
  expect((await POST(request('My team'), undefined)).status).toBe(401);
  expect(completePersonalSetup).not.toHaveBeenCalled();
});

it('surfaces database errors', async () => {
  completePersonalSetup.mockResolvedValue({ data: null, error: { message: 'database unavailable' } });
  expect((await POST(request('My team'), undefined)).status).toBe(500);
});

it('rejects invalid countries and timezones', async () => {
  expect((await POST(request('Team', { country: 'ZZ' }), undefined)).status).toBe(422);
  expect((await POST(request('Team', { timezone: 'Mars/Olympus' }), undefined)).status).toBe(422);
  expect(completePersonalSetup).not.toHaveBeenCalled();
});
