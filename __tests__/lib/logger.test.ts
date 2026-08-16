import { logger } from '@/lib/logger';

describe('logger', () => {
  const spies = {
    info: jest.spyOn(console, 'info').mockImplementation(() => {}),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
    error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    debug: jest.spyOn(console, 'debug').mockImplementation(() => {}),
  };

  const originalLevel = process.env.LOG_LEVEL;

  beforeAll(() => {
    // jest.setup silencia el logger para el resto de la suite.
    process.env.LOG_LEVEL = 'debug';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.LOG_LEVEL = originalLevel;
    Object.values(spies).forEach((spy) => spy.mockRestore());
  });

  /** Contexto con el que se llamó al último log (segundo argumento en dev). */
  function lastContext(spy: jest.SpyInstance): Record<string, unknown> {
    return spy.mock.calls.at(-1)?.[1] as Record<string, unknown>;
  }

  it('routes each level to its console method', () => {
    logger.info('a');
    logger.warn('b');
    logger.error('c');

    expect(spies.info).toHaveBeenCalledTimes(1);
    expect(spies.warn).toHaveBeenCalledTimes(1);
    expect(spies.error).toHaveBeenCalledTimes(1);
  });

  it('merges the bindings of a child logger into every event', () => {
    logger.child({ route: 'api/shorten' }).info('created', { slug: 'abc1234' });

    expect(lastContext(spies.info)).toMatchObject({ route: 'api/shorten', slug: 'abc1234' });
  });

  it('redacts sensitive keys at any depth', () => {
    logger.child({ ip: '1.2.3.4' }).warn('blocked', {
      user: { email: 'someone@example.com', id: 'user-1' },
      authorization: 'Bearer token',
    });

    const context = lastContext(spies.warn);
    expect(context.ip).toBe('[redacted]');
    expect(context.authorization).toBe('[redacted]');
    expect(context.user).toEqual({ email: '[redacted]', id: 'user-1' });
  });

  it('serializes errors with name, message and postgres code', () => {
    const error = Object.assign(new Error('duplicate key'), { code: '23505' });

    logger.error('insert failed', { error });

    expect(lastContext(spies.error).error).toMatchObject({
      name: 'Error',
      message: 'duplicate key',
      code: '23505',
    });
  });

  it('truncates deeply nested structures instead of recursing forever', () => {
    const deep = { a: { b: { c: { d: { e: 'too deep' } } } } };

    logger.info('deep', deep);

    expect(JSON.stringify(lastContext(spies.info))).toContain('[truncated]');
  });

  it('handles circular-free objects with arrays and dates', () => {
    logger.info('payload', { items: [1, 2, 3], at: new Date('2026-01-01T00:00:00.000Z') });

    expect(lastContext(spies.info)).toMatchObject({
      items: [1, 2, 3],
      at: '2026-01-01T00:00:00.000Z',
    });
  });
});
