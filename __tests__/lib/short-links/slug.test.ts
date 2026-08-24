import {
  generateSlug,
  isValidCustomSlug,
  normalizeCustomSlug,
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

describe('slug elegido por el usuario', () => {
  it('acepta formas válidas', () => {
    for (const slug of ['abc', 'promo-julio', 'promo_2026', 'a1b', 'a'.repeat(32)]) {
      expect(isValidCustomSlug(slug)).toBe(true);
    }
  });

  it('rechaza longitudes fuera de rango', () => {
    expect(isValidCustomSlug('ab')).toBe(false);
    expect(isValidCustomSlug('a'.repeat(33))).toBe(false);
  });

  it('rechaza separadores en los extremos y caracteres no permitidos', () => {
    for (const slug of ['-promo', 'promo-', '_promo', 'promo_', 'pro mo', 'promo.json', 'promó', 'pro/mo']) {
      expect(isValidCustomSlug(slug)).toBe(false);
    }
  });

  // El resolver compara en minúsculas contra lo que se guardó, y lo guardado
  // se normaliza aquí. Mayúsculas que llegan del formulario no deben crear un
  // segundo enlace visualmente idéntico al que ya existe.
  it('normaliza a minúsculas y recorta espacios', () => {
    expect(normalizeCustomSlug('  Promo-Julio  ')).toBe('promo-julio');
  });

  it('la normalización deja pasar el resultado a la validación', () => {
    expect(isValidCustomSlug(normalizeCustomSlug(' PROMO_2026 '))).toBe(true);
  });
});
