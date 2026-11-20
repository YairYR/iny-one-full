/**
 * @jest-environment node
 */
export {};

const getCurrentUserDTO = jest.fn();
const getDefaultTeamAccess = jest.fn();
const redirect = jest.fn(() => { throw new Error('redirect'); });
jest.mock('@/data/dto/user-dto', () => ({ getCurrentUserDTO }));
jest.mock('@/features/authorization/helpers/access', () => ({ getDefaultTeamAccess }));
jest.mock('next/navigation', () => ({ redirect }));
jest.mock('@/features/dashboard/containers/UserDashboard', () => ({ UserDashboard: () => null }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const DashboardPage = (require('@/app/ui/(user)/dashboard/page') as typeof import('@/app/ui/(user)/dashboard/page')).default;

beforeEach(() => {
  jest.clearAllMocks();
  getCurrentUserDTO.mockResolvedValue({ id: 'user-1' });
});

it('redirects an anonymous visitor without querying team data', async () => {
  getCurrentUserDTO.mockResolvedValue(null);
  await expect(DashboardPage()).rejects.toThrow('redirect');
  expect(redirect).toHaveBeenCalledWith('/auth/login');
  expect(getDefaultTeamAccess).not.toHaveBeenCalled();
});

it('shows setup when the default team is absent', async () => {
  getDefaultTeamAccess.mockResolvedValue({ team_id: null, permitted: false });
  const result = await DashboardPage();
  expect(result.props.children[0].props.children).toBe('Your team is not set up yet');
});

it('shows the dashboard when a default team exists', async () => {
  getDefaultTeamAccess.mockResolvedValue({ team_id: 'team-1', permitted: false });
  const result = await DashboardPage();
  expect(result.type.name).toBe('UserDashboard');
});
