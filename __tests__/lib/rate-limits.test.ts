import {
  checkRateLimit,
  MemoryUsageStore,
  RATE_LIMITS,
  recordRateLimitUsage,
  resolveRateLimitPlan,
  usageKey,
} from '@/lib/utils/rate-limits';
import type { ShorterRepository } from '@/infra/db/shorter.repository';

type CountResult = { count: number | null; error: unknown };

function repoStub(overrides: Partial<Record<'byUser' | 'byIp', CountResult>> = {}) {
  const byUser = overrides.byUser ?? { count: 0, error: null };
  const byIp = overrides.byIp ?? { count: 0, error: null };

  const countLinksByUserInLastMonth = jest.fn().mockResolvedValue(byUser);
  const countLinksByIpInLastMonth = jest.fn().mockResolvedValue(byIp);

  return {
    repo: { countLinksByUserInLastMonth, countLinksByIpInLastMonth } as unknown as ShorterRepository,
    countLinksByUserInLastMonth,
    countLinksByIpInLastMonth,
  };
}

describe('resolveRateLimitPlan', () => {
  it('treats a request without user as anonymous', () => {
    expect(resolveRateLimitPlan(null, 'pro')).toBe('freeAnonymous');
  });

  it('honours the plan of an authenticated user', () => {
    expect(resolveRateLimitPlan('user-1', 'pro')).toBe('pro');
  });

  // Regresión: antes, un usuario autenticado sin plan en su metadata salía del
  // `else if` sin comprobación alguna y creaba links sin límite.
  it('falls back to the free plan when the plan is missing', () => {
    expect(resolveRateLimitPlan('user-1', null)).toBe('free');
  });

  it('falls back to the free plan when the plan is unknown', () => {
    expect(resolveRateLimitPlan('user-1', 'enterprise' as never)).toBe('free');
  });
});

describe('usageKey', () => {
  it('buckets by user when there is a session', () => {
    expect(usageKey('user-1', '1.2.3.4')).toBe('user:user-1');
  });

  it('buckets by ip for anonymous requests', () => {
    expect(usageKey(null, '1.2.3.4')).toBe('ip:1.2.3.4');
  });

  it('uses a dedicated bucket when the ip cannot be resolved', () => {
    expect(usageKey(null, null)).toBe('ip:unknown');
  });
});

describe('checkRateLimit', () => {
  let store: MemoryUsageStore;

  beforeEach(() => {
    store = new MemoryUsageStore();
  });

  it('allows a request below the limit', async () => {
    const { repo } = repoStub({ byUser: { count: 3, error: null } });

    const result = await checkRateLimit({ userId: 'user-1', plan: 'free', ip: null, repo, store });

    expect(result).toMatchObject({
      allowed: true,
      plan: 'free',
      limit: RATE_LIMITS.free,
      used: 3,
      remaining: RATE_LIMITS.free - 3,
    });
  });

  it('denies a request once the limit is reached', async () => {
    const { repo } = repoStub({ byIp: { count: RATE_LIMITS.freeAnonymous, error: null } });

    const result = await checkRateLimit({ userId: null, plan: null, ip: '1.2.3.4', repo, store });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  // El objetivo del rediseño: dejar de ejecutar un COUNT por cada petición.
  it('queries the database once and serves later checks from cache', async () => {
    const { repo, countLinksByIpInLastMonth } = repoStub({ byIp: { count: 1, error: null } });
    const input = { userId: null, plan: null, ip: '1.2.3.4', repo, store } as const;

    await checkRateLimit(input);
    await checkRateLimit(input);
    await checkRateLimit(input);

    expect(countLinksByIpInLastMonth).toHaveBeenCalledTimes(1);
  });

  it('counts links created during the cached window', async () => {
    const { repo } = repoStub({ byIp: { count: RATE_LIMITS.freeAnonymous - 1, error: null } });
    const input = { userId: null, plan: null, ip: '1.2.3.4', repo, store } as const;

    const first = await checkRateLimit(input);
    expect(first.allowed).toBe(true);

    recordRateLimitUsage(first, store);

    const second = await checkRateLimit(input);
    expect(second.allowed).toBe(false);
  });

  it('uses the user bucket instead of the ip bucket when there is a session', async () => {
    const { repo, countLinksByUserInLastMonth, countLinksByIpInLastMonth } = repoStub();

    await checkRateLimit({ userId: 'user-1', plan: 'basic', ip: '1.2.3.4', repo, store });

    expect(countLinksByUserInLastMonth).toHaveBeenCalledWith('user-1');
    expect(countLinksByIpInLastMonth).not.toHaveBeenCalled();
  });

  it('allows the request but does not cache when the count fails', async () => {
    const { repo, countLinksByIpInLastMonth } = repoStub({
      byIp: { count: null, error: { message: 'db down' } },
    });
    const input = { userId: null, plan: null, ip: '1.2.3.4', repo, store } as const;

    const result = await checkRateLimit(input);
    expect(result.allowed).toBe(true);

    await checkRateLimit(input);
    expect(countLinksByIpInLastMonth).toHaveBeenCalledTimes(2);
  });

  it('applies the anonymous limit in memory when there is no ip', async () => {
    const { repo, countLinksByIpInLastMonth } = repoStub();
    const input = { userId: null, plan: null, ip: null, repo, store } as const;

    for (let created = 0; created < RATE_LIMITS.freeAnonymous; created++) {
      const result = await checkRateLimit(input);
      expect(result.allowed).toBe(true);
      recordRateLimitUsage(result, store);
    }

    expect((await checkRateLimit(input)).allowed).toBe(false);
    expect(countLinksByIpInLastMonth).not.toHaveBeenCalled();
  });
});
