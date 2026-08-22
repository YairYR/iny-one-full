/**
 * Códigos de error de PostgreSQL relevantes para la aplicación.
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PG_ERROR = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  CHECK_VIOLATION: '23514',
} as const;

/**
 * `true` si el error corresponde a la violación de un índice único.
 *
 * PostgREST propaga el código nativo de PostgreSQL en `error.code`, de modo que
 * este predicado sirve tanto para errores del cliente de Supabase como para
 * errores levantados por funciones RPC.
 */
export function isUniqueViolation(error: unknown): boolean {
  return hasPostgresCode(error, PG_ERROR.UNIQUE_VIOLATION);
}

function hasPostgresCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
  );
}
