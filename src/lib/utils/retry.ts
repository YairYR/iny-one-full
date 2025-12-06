/**
 * Reintenta ejecutar una función asíncrona hasta N veces.
 *
 * @param fn - Función async a ejecutar (debe lanzar error si falla)
 * @param retries - Número máximo de intentos (por defecto 3)
 * @param delayMs - Retraso inicial entre intentos (por defecto 100 ms)
 * @param backoff - Multiplicador de incremento del delay (por defecto 0)
 * @returns El valor retornado por la función si tiene éxito
 * @throws El último error si todos los intentos fallan
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 100,
  backoff: number = 0
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < retries) {
    try {
      return await fn(); // Intenta ejecutar la función
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt >= retries) break;

      console.warn(
        `Intento ${attempt} fallido. Reintentando en ${delayMs}ms...`,
        error
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      delayMs *= backoff; // Incrementa el delay (backoff exponencial)
    }
  }

  throw lastError;
}

export async function retryWithCancel<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 100,
  signal?: AbortSignal
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < retries) {
    if (signal?.aborted) throw new Error('Operación cancelada');

    try {
      return await fn();
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt >= retries) break;

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, delayMs);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new Error('Cancelado'));
          });
        }
      });
    }
  }

  throw lastError;
}

