import 'server-only';

/**
 * Executes a callback function only if the application is running in production mode.
 * @param callback
 */
export async function executeIfProduction<T>(callback: () => Promise<T>) {
  if (process.env.NODE_ENV === 'production') {
    return callback();
  }
}
