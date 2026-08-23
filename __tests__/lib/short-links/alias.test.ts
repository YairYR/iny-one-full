import { ALIAS_MAX_LENGTH, isValidAlias, normalizeAlias } from '@/lib/short-links/alias';

describe('alias', () => {
  // Regresión: la regla anterior sólo admitía [a-zA-Z0-9_- /#], así que en un
  // producto de público mayoritariamente chileno «Campaña de julio» se
  // rechazaba. El alias es una etiqueta del panel, no parte de ninguna URL.
  it('acepta ñ, acentos y espacios', () => {
    for (const alias of ['Campaña de julio', 'Promoción Navidad', 'Año nuevo', 'Ñuñoa · retail']) {
      expect(isValidAlias(alias)).toBe(true);
    }
  });

  it('acepta el alias vacío, que significa quitar la etiqueta', () => {
    expect(isValidAlias('')).toBe(true);
    expect(normalizeAlias('')).toBeNull();
    expect(normalizeAlias('   ')).toBeNull();
  });

  it('rechaza ángulos y caracteres de control', () => {
    expect(isValidAlias('promo<script>')).toBe(false);
    expect(isValidAlias('promo>')).toBe(false);
    expect(isValidAlias(`promo${String.fromCharCode(10)}salto`)).toBe(false);
    expect(isValidAlias(`promo${String.fromCharCode(27)}[31m`)).toBe(false);
    expect(isValidAlias(`promo${String.fromCharCode(127)}`)).toBe(false);
  });

  it('rechaza etiquetas más largas del máximo', () => {
    expect(isValidAlias('a'.repeat(ALIAS_MAX_LENGTH))).toBe(true);
    expect(isValidAlias('a'.repeat(ALIAS_MAX_LENGTH + 1))).toBe(false);
  });

  it('recorta los espacios sobrantes al guardar', () => {
    expect(normalizeAlias('  Campaña de julio  ')).toBe('Campaña de julio');
  });
});
