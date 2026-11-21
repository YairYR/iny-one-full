/**
 * @jest-environment node
 */
const query = {
  from: jest.fn(),
  select: jest.fn(),
  in: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  order: jest.fn(),
};

jest.mock('@/infra/db/supabase_service', () => ({
  get supabase_service() { return query; },
}));

import { getStatsRepository } from '@/infra/db/stats.repository';
import { supabase_service } from '@/infra/db/supabase_service';

beforeEach(() => {
  jest.clearAllMocks();
  for (const method of Object.values(query)) method.mockReturnValue(query);
});

it('filters historical click counts by calendar date, not row creation time', async () => {
  await getStatsRepository(supabase_service).getClicksBetweenDates(
    ['link-1'],
    new Date('2026-01-01T12:00:00Z'),
    new Date('2026-01-06T12:00:00Z'),
  );
  expect(query.from).toHaveBeenCalledWith('short_links_daily_stats');
  expect(query.gte).toHaveBeenCalledWith('date', '2026-01-01');
  expect(query.lte).toHaveBeenCalledWith('date', '2026-01-06');
  expect(query.order).toHaveBeenCalledWith('date', { ascending: true });
});
