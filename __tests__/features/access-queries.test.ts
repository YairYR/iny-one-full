/**
 * @jest-environment node
 */
const rpc = jest.fn();
jest.mock('server-only', () => ({}));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({ rpc }) }));
jest.mock('@/infra/db/supabase_service', () => ({ supabase_service: {} }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  getLinkCreationAccess,
  getDefaultTeamAccess,
  resolveTeamSelector,
} = require('@/features/authorization/helpers/access') as typeof import('@/features/authorization/helpers/access');

beforeEach(() => jest.clearAllMocks());

it('returns only link creation access from the dedicated RPC', async () => {
  const data = { anonymous: true, plan_key: null, default_team_id: null, monthly_limit: 5 };
  rpc.mockResolvedValue({ data, error: null });
  expect(await getLinkCreationAccess()).toEqual(data);
  expect(rpc).toHaveBeenCalledWith('get_link_creation_access');
});

it('rejects malformed or unavailable creation access', async () => {
  rpc.mockResolvedValueOnce({ data: { anonymous: true }, error: null })
    .mockResolvedValueOnce({ data: null, error: { message: 'unavailable' } });
  await expect(getLinkCreationAccess()).rejects.toThrow();
  await expect(getLinkCreationAccess()).rejects.toThrow('Failed to load link creation access');
});

it('checks only the requested default-team permission', async () => {
  rpc.mockResolvedValue({ data: [{ team_id: 'team-1', permitted: false }], error: null });
  expect(await getDefaultTeamAccess('stats.view')).toEqual({ team_id: 'team-1', permitted: false });
  expect(rpc).toHaveBeenCalledWith('get_default_team_access', { p_permission: 'stats.view' });
});

it('rejects missing results and database errors when checking teams', async () => {
  rpc.mockResolvedValueOnce({ data: [], error: null })
    .mockResolvedValueOnce({ data: null, error: { message: 'unavailable' } });
  await expect(getDefaultTeamAccess()).rejects.toThrow('Invalid default team access response');
  await expect(getDefaultTeamAccess()).rejects.toThrow('Failed to load default team access');
});

it('resolves default and explicit team selectors for reusable authorization', async () => {
  rpc.mockResolvedValueOnce({
    data: [{ team_id: 'team-1', permitted: true }],
    error: null,
  });
  await expect(resolveTeamSelector('default', 'links.read')).resolves.toEqual({
    teamId: 'team-1',
    permitted: true,
  });

  const teamId = '550e8400-e29b-41d4-a716-446655440000';
  rpc.mockResolvedValueOnce({ data: true, error: null });
  await expect(resolveTeamSelector(teamId, 'links.read')).resolves.toEqual({
    teamId,
    permitted: true,
  });
  expect(rpc).toHaveBeenLastCalledWith('has_team_permission', {
    p_team_id: teamId,
    p_permission: 'links.read',
  });
});

it('rejects team selectors that are neither default nor a UUID', async () => {
  await expect(resolveTeamSelector('personal', 'links.read')).rejects.toThrow();
  expect(rpc).not.toHaveBeenCalled();
});
