/**
 * @jest-environment node
 */
export {};

const getCurrentUserDTO = jest.fn();
const getLinkById = jest.fn();
const getLinkForEdit = jest.fn();
const hasTeamPermission = jest.fn();

jest.mock('@/data/dto/user-dto', () => ({ getCurrentUserDTO }));
jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn().mockResolvedValue({}) }));
jest.mock('@/infra/db/team.repository', () => ({
  getTeamRepository: () => ({ getLinkById, getLinkForEdit }),
}));
jest.mock('@/features/authorization/helpers/access', () => ({ hasTeamPermission }));
jest.mock('@/features/dashboard/components/LinkDetailsView', () => ({
  default: ({ link, initialRange, canViewSensitiveStats, canEdit }: {
    link: unknown;
    initialRange: number;
    canViewSensitiveStats: boolean;
    canEdit: boolean;
  }) => ({
    type: 'LinkDetailsView',
    props: { link, initialRange, canViewSensitiveStats, canEdit },
  }),
}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => { throw new Error('not-found'); }),
  redirect: jest.fn(() => { throw new Error('redirect'); }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { default: LinkDetailsPage } = require('@/app/(user)/dashboard/link/details/page') as typeof import('@/app/(user)/dashboard/link/details/page');

const id = 'c0a80123-4567-4890-8123-456789abcdef';

beforeEach(() => {
  jest.clearAllMocks();
  getCurrentUserDTO.mockResolvedValue({ id: 'user-1' });
  getLinkById.mockResolvedValue({
    data: {
      link_id: id,
      team_id: 'team-1',
      slug: 'promo',
      name: 'Promo',
      destination: 'https://example.com',
      clicks: 42,
      created_at: '2026-01-01T00:00:00Z',
    },
    error: null,
  });
  getLinkForEdit.mockResolvedValue({
    data: { utms: { utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'enero' } },
    error: null,
  });
  hasTeamPermission.mockImplementation((_team, permission) => Promise.resolve(
    permission === 'links.read' || permission === 'stats.view',
  ));
});

it('renders the full details for an authorized link', async () => {
  const result = await LinkDetailsPage({ searchParams: Promise.resolve({ id, range: '30' }) });
  expect(result.props.initialRange).toBe(7);
  expect(result.props.canViewSensitiveStats).toBe(false);
  expect(result.props.link).toMatchObject({ link_id: id, slug: 'promo', utm_source: 'instagram' });
});

it('allows 30 and 90 day ranges for sensitive statistics permission', async () => {
  hasTeamPermission.mockResolvedValue(true);
  const result = await LinkDetailsPage({ searchParams: Promise.resolve({ id, range: '90' }) });
  expect(result.props.initialRange).toBe(90);
  expect(result.props.canViewSensitiveStats).toBe(true);
  expect(result.props.canEdit).toBe(true);
});

it('rejects invalid ids', async () => {
  await expect(LinkDetailsPage({ searchParams: Promise.resolve({ id: 'nope' }) })).rejects.toThrow('not-found');
});
