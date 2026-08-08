/**
 * `decodeURI` que no lanza ante secuencias porcentuales inválidas.
 *
 * Una URL como `https://example.com/100%discount` es aceptada por `new URL()`
 * pero hace que `decodeURI` lance `URIError`. Sin esta guarda, un destino con un
 * `%` suelto convierte la petición en un 500.
 */
export function safeDecodeURI(value: string): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}
