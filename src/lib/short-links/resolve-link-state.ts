export type LinkRow = {
  destination: string | null;
  expires_at: string | null;
  status: boolean | null;
};

export type LinkState = 'not-found' | 'expired' | 'active';

/**
 * Decide qué responder ante un slug, a partir de la fila encontrada.
 *
 * Se separa del route handler porque es la única lógica con ramas del resolver
 * y conviene poder probarla sin montar una petición.
 *
 * - `expired` sólo para enlaces que caducaron por tiempo. Es lo que habilita la
 *   pantalla de reconversión, así que debe distinguirse de un slug inexistente.
 * - Un enlace desactivado sin fecha de caducidad se trata como inexistente: no
 *   sabemos por qué se desactivó y no procede insinuar que existió.
 */
export function resolveLinkState(link: LinkRow | null, now: Date = new Date()): LinkState {
  if (!link?.destination) return 'not-found';

  const expiresAt = link.expires_at ? new Date(link.expires_at) : null;
  const hasValidExpiry = expiresAt !== null && !Number.isNaN(expiresAt.getTime());

  if (hasValidExpiry && expiresAt.getTime() <= now.getTime()) return 'expired';

  // `status` a false lo escribe el propio resolver la primera vez que alguien
  // visita un enlace ya caducado, así que sigue siendo un caducado.
  if (link.status === false) return hasValidExpiry ? 'expired' : 'not-found';

  return 'active';
}
