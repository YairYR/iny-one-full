import { retry } from '@/lib/utils/retry';

describe('retry', () => {
  // `retry` avisa de cada intento fallido; los tests provocan fallos a propósito,
  // así que se silencia la salida para no ensuciar el reporte.
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  afterAll(() => {
    warnSpy.mockRestore();
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /** Ejecuta la promesa dejando que los timers pendientes avancen. */
  async function run<T>(promise: Promise<T>): Promise<T> {
    const settled = promise.then(
      (value) => ({ ok: true as const, value }),
      (error) => ({ ok: false as const, error }),
    );
    await jest.runAllTimersAsync();
    const result = await settled;
    if (!result.ok) throw result.error;
    return result.value;
  }

  it('returns the value without retrying when the call succeeds', async () => {
    const fn = jest.fn().mockResolvedValue('ok');

    await expect(run(retry(fn))).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries until the call succeeds', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue('ok');

    await expect(run(retry(fn))).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('rethrows the last error once the attempts run out', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));

    await expect(run(retry(fn, 3))).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  /** Retrasos con los que `retry` programó cada espera entre intentos. */
  async function collectDelays(call: () => Promise<unknown>): Promise<number[]> {
    const spy = jest.spyOn(globalThis, 'setTimeout');
    try {
      await expect(run(call())).rejects.toThrow('boom');
      return spy.mock.calls.map(([, delay]) => delay ?? 0);
    } finally {
      spy.mockRestore();
    }
  }

  // Regresión: el multiplicador venía por defecto en 0, así que el primer
  // reintento ponía el retraso a 0 y anulaba el backoff exponencial.
  it('grows the delay exponentially by default', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(collectDelays(() => retry(fn, 4, 100))).resolves.toEqual([100, 200, 400]);
  });

  it('keeps a constant delay when the multiplier is 1', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('boom'));

    await expect(collectDelays(() => retry(fn, 3, 50, 1))).resolves.toEqual([50, 50]);
  });
});
