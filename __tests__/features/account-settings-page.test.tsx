/**
 * @jest-environment node
 */
export {};

const getCurrentUserDTO = jest.fn();
const loadPersonalSetup = jest.fn();
const redirect = jest.fn(() => { throw new Error('redirect'); });
jest.mock('@/data/dto/user-dto', () => ({ getCurrentUserDTO }));
jest.mock('@/features/auth/load-personal-setup', () => ({ loadPersonalSetup }));
jest.mock('next/navigation', () => ({ redirect }));
jest.mock('@/features/auth/components/SetupForm', () => () => null);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const AccountSettingsPage = (require('@/app/ui/(user)/account/settings/page') as typeof import('@/app/ui/(user)/account/settings/page')).default;

beforeEach(() => {
  jest.clearAllMocks();
  getCurrentUserDTO.mockResolvedValue({ id: 'user-1', name: 'Jane' });
  loadPersonalSetup.mockResolvedValue({
    initialFullName: 'Saved Name', initialTeamName: 'Studio', initialCountry: 'AR', initialTimezone: 'UTC',
  });
});

it('loads the signed-in user’s saved settings into the shared form', async () => {
  const result = await AccountSettingsPage();
  expect(loadPersonalSetup).toHaveBeenCalledWith('Jane', false);
  expect(result.props.children.props).toMatchObject({
    mode: 'settings', initialFullName: 'Saved Name', initialTeamName: 'Studio', initialCountry: 'AR', initialTimezone: 'UTC',
  });
});

it('redirects anonymous visitors before loading settings', async () => {
  getCurrentUserDTO.mockResolvedValue(null);
  await expect(AccountSettingsPage()).rejects.toThrow('redirect');
  expect(redirect).toHaveBeenCalledWith('/auth/login');
  expect(loadPersonalSetup).not.toHaveBeenCalled();
});

it('surfaces errors loading saved settings', async () => {
  loadPersonalSetup.mockRejectedValue(new Error('database unavailable'));
  await expect(AccountSettingsPage()).rejects.toThrow('database unavailable');
});
