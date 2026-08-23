/**
 * INACTIVO — sin consumidores en el repositorio (rev. 2026-08-23).
 *
 * Se deja operativa y corregida en lugar de comentada porque son ocho líneas y
 * el fallo era de los que sólo aparecen en producción: `localPart[0]` era
 * `undefined` con un correo que empezara por `@`, y `"*".repeat(-1)` lanza
 * `RangeError`.
 *
 * Enmascara la parte local conservando sólo la inicial. No conserva la longitud
 * original a propósito: filtrarla es dar pistas de más sobre la dirección.
 */
export function hideEmail(email: string): string | null {
  const trimmed = email?.trim();
  if (!trimmed) return null;

  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;

  const localPart = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);

  return `${localPart[0]}${"*".repeat(3)}@${domain}`;
}
