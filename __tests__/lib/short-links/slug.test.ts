import {
  generateSlug,
  MAX_SLUG_GENERATION_ATTEMPTS,
  SLUG_SIZE,
  SlugGenerationError,
} from '@/lib/short-links/slug';
import { isReservedSlug } from '@/lib/reserved-slugs';

describe('generateSlug', () => {
  it('produces a slug of the requested length', () => {
    expect(generateSlug()).toHaveLength(SLUG_SIZE);
    expect(generateSlug(10)).toHaveLength(10);
  });

  it('never returns a reserved slug', () => {
    for (let index = 0; index < 200; index++) {
      expect(isReservedSlug(generateSlug())).toBe(false);
    }
  });

  it('retries until it finds a candidate outside the denylist', () => {
    const generate = jest.fn()
      .mockReturnValueOnce('dashboard')
      .mockReturnValueOnce('login')
      .mockReturnValueOnce('abc1234');

    expect(generateSlug(SLUG_SIZE, generate)).toBe('abc1234');
    expect(generate).toHaveBeenCalledTimes(3);
  });

  it('lowercases the generated candidate', () => {
    expect(generateSlug(SLUG_SIZE, () => 'AbCdEfG')).toBe('abcdefg');
  });

  it('throws once the attempts are exhausted', () => {
    const generate = jest.fn().mockReturnValue('admin');

    expect(() => generateSlug(SLUG_SIZE, generate)).toThrow(SlugGenerationError);
    expect(generate).toHaveBeenCalledTimes(MAX_SLUG_GENERATION_ATTEMPTS);
  });
});
