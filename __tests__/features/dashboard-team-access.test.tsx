/**
 * @jest-environment node
 */
export {};

const getCurrentUserDTO = jest.fn();
const getDefaultTeamAccess = jest.fn();
jest.mock('@/data/dto/user-dto', () => ({ getCurrentUserDTO }));
jest.mock('@/features/authorization/helpers/access', () => ({ getDefaultTeamAccess }));
jest.mock('@/features/dashboard/containers/UserDashboard', () => ({ UserDashboard: () => null }));
jest.mock('@/features/dashboard/components/DashboardExample', () => ({ DashboardExample: () => null }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const DashboardPage = (require('@/app/ui/(user)/dashboard/page') as typeof import('@/app/ui/(user)/dashboard/page')).default;

beforeEach(() => {
  jest.clearAllMocks();
  getCurrentUserDTO.mockResolvedValue({ id: 'user-1' });
});

it('shows the visitor preview without querying team data', async () => {
  getCurrentUserDTO.mockResolvedValue(null);
  const result = await DashboardPage();
  expect(result.type.name).toBe('DashboardExample');
  expect(result.props.audience).toBe('visitor');
  expect(getDefaultTeamAccess).not.toHaveBeenCalled();
});

it('shows the setup preview when the default team is absent', async () => {
  getDefaultTeamAccess.mockResolvedValue({ team_id: null, permitted: false });
  const result = await DashboardPage();
  expect(result.type.name).toBe('DashboardExample');
  expect(result.props.audience).toBe('setup');
});

it('shows the dashboard when a default team exists', async () => {
  getDefaultTeamAccess.mockResolvedValue({ team_id: 'team-1', permitted: false });
  const result = await DashboardPage();
  expect(result.type.name).toBe('UserDashboard');
});
