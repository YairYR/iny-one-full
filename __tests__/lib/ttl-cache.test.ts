import { TtlCache } from '@/lib/cache/ttl-cache';

describe('TtlCache', () => {
  let now = 0;
  const clock = () => now;

  beforeEach(() => {
    now = 0;
  });

  it('returns a stored value while it is still valid', () => {
    const cache = new TtlCache<number>(1_000, 10, clock);
    cache.set('a', 1);

    now = 999;
    expect(cache.get('a')).toBe(1);
  });

  it('expires a value once the ttl elapses', () => {
    const cache = new TtlCache<number>(1_000, 10, clock);
    cache.set('a', 1);

    now = 1_000;
    expect(cache.get('a')).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it('updates a value in place', () => {
    const cache = new TtlCache<number>(1_000, 10, clock);
    cache.set('a', 1);
    cache.update('a', (current) => current + 5);

    expect(cache.get('a')).toBe(6);
  });

  it('ignores updates on missing or expired keys', () => {
    const cache = new TtlCache<number>(1_000, 10, clock);
    cache.update('missing', (current) => current + 1);
    expect(cache.get('missing')).toBeUndefined();

    cache.set('a', 1);
    now = 2_000;
    cache.update('a', (current) => current + 1);
    expect(cache.get('a')).toBeUndefined();
  });

  it('does not extend the ttl when updating', () => {
    const cache = new TtlCache<number>(1_000, 10, clock);
    cache.set('a', 1);

    now = 900;
    cache.update('a', (current) => current + 1);

    now = 1_000;
    expect(cache.get('a')).toBeUndefined();
  });

  it('evicts the oldest entry when it exceeds the size cap', () => {
    const cache = new TtlCache<number>(1_000, 2, clock);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);

    expect(cache.size).toBe(2);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('c')).toBe(3);
  });

  it('deletes and clears entries', () => {
    const cache = new TtlCache<number>(1_000, 10, clock);
    cache.set('a', 1);
    cache.set('b', 2);

    cache.delete('a');
    expect(cache.get('a')).toBeUndefined();

    cache.clear();
    expect(cache.size).toBe(0);
  });
});
