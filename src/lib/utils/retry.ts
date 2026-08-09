import { logger } from "@/lib/logger";

const log = logger.child({ module: 'retry' });

/**
 * Reintenta ejecutar una función asíncrona hasta N veces.
 *
 * @param fn - Función async a ejecutar (debe lanzar error si falla)
 * @param retries - Número máximo de intentos (por defecto 3)
 * @param delayMs - Retraso inicial entre intentos (por defecto 100 ms)
 * @param backoff - Multiplicador aplicado al retraso tras cada intento fallido.
 *                  Por defecto 2 (backoff exponencial); usar 1 para mantener un
 *                  intervalo constante.
 * @returns El valor retornado por la función si tiene éxito
 * @throws El último error si todos los intentos fallan
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 100,
  backoff: number = 2
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  let currentDelay = delayMs;

  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt >= retries) break;

      log.warn('attempt failed, retrying', { attempt, retries, delayMs: currentDelay, error });

      await sleep(currentDelay);
      currentDelay *= backoff;
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* INACTIVO — sin importaciones ni referencias en el repositorio (rev. 2026-08-09).
 * No se elimina por si retoma uso en una build futura; hoy no tiene efecto en
 * producción. Al reactivarlo: descomentar y cubrirlo con tests.
 */
// export async function retryWithCancel<T>(
//   fn: () => Promise<T>,
//   retries = 3,
//   delayMs = 100,
//   signal?: AbortSignal
// ): Promise<T> {
//   let attempt = 0;
//   let lastError: unknown;
//
//   while (attempt < retries) {
//     if (signal?.aborted) throw new Error('Operación cancelada');
//
//     try {
//       return await fn();
//     } catch (err) {
//       lastError = err;
//       attempt++;
//       if (attempt >= retries) break;
//
//       await new Promise<void>((resolve, reject) => {
//         const timer = setTimeout(resolve, delayMs);
//         if (signal) {
//           signal.addEventListener('abort', () => {
//             clearTimeout(timer);
//             reject(new Error('Cancelado'));
//           });
//         }
//       });
//     }
//   }
//
//   throw lastError;
// }
