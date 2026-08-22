import { safeDecodeURI } from '@/lib/utils/url';
import { isUniqueViolation, PG_ERROR } from '@/infra/db/db-errors';

describe('safeDecodeURI', () => {
  it('decodes a well-formed uri', () => {
    expect(safeDecodeURI('https://example.com/hello%20world')).toBe('https://example.com/hello world');
  });

  // Regresión: `decodeURI` lanza URIError ante un `%` que no abre una secuencia
  // válida, lo que devolvía un 500 al resolver el link.
  it('returns the input untouched when the uri is malformed', () => {
    expect(safeDecodeURI('https://example.com/100%discount')).toBe('https://example.com/100%discount');
  });
});

describe('isUniqueViolation', () => {
  it('recognises the postgres unique violation code', () => {
    expect(isUniqueViolation({ code: PG_ERROR.UNIQUE_VIOLATION })).toBe(true);
  });

  it.each([
    ['another postgres error', { code: '23503' }],
    ['an error without code', new Error('boom')],
    ['null', null],
    ['undefined', undefined],
    ['a string', 'error'],
  ])('rejects %s', (_label, error) => {
    expect(isUniqueViolation(error)).toBe(false);
  });
});
