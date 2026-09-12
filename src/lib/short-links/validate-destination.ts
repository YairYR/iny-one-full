import { parse as parseUrl } from "tldts";
import { ValidationError } from "@/lib/api/errors";
import { loadBloom } from "@/lib/utils/check_domain";
import type { ShorterRepository } from "@/infra/db/shorter.repository";
import { logger } from "@/lib/logger";

const log = logger.child({ module: 'validate-destination' });

/** Dominios que nunca pueden ser destino de un link. */
export const BLOCKED_DOMAINS = new Set(['iny.one', 'localhost']);

export type ValidatedDestination = {
  /** URL con protocolo garantizado, lista para `buildDestination`. */
  target: string;
  /** Dominio registrable, tal y como se guarda en `short_links.domain`. */
  domain: string;
};

/**
 * Única puerta de entrada de un destino al sistema.
 *
 * La usan tanto la creación como la edición **a propósito**: si la edición no
 * pasara por aquí, el blocklist de dominios sería evitable en dos pasos —crear
 * un enlace hacia un destino limpio y repuntarlo después hacia uno bloqueado—,
 * y el control aparentaría estar puesto sin estarlo. Cualquier ruta nueva que
 * escriba `short_links.destination` tiene que llamar a esta función.
 *
 * @throws {ValidationError} si el destino no es utilizable o está bloqueado.
 */
export async function validateDestination(
  rawUrl: string,
  repo: ShorterRepository,
): Promise<ValidatedDestination> {
  const target = withProtocol(rawUrl.trim());
  const urlInfo = parseUrl(target);

  if (urlInfo.domain === null || urlInfo.isIp || BLOCKED_DOMAINS.has(urlInfo.domain)) {
    log.info({ domain: urlInfo.domain, isIp: urlInfo.isIp }, 'rejected destination url');
    throw new ValidationError("Invalid url provided");
  }

  await assertDomainIsAllowed(urlInfo.domain, repo);

  return { target, domain: urlInfo.domain };
}

/** Añade `https://` a una URL que llega sin protocolo. */
export function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * El filtro de Bloom descarta la mayoría de dominios sin tocar la base de datos;
 * sólo los positivos (incluidos los falsos positivos) se confirman contra ella.
 */
async function assertDomainIsAllowed(domain: string, repo: ShorterRepository): Promise<void> {
  if (!loadBloom().has(domain)) return;

  const { data, error } = await repo.isSafeDomain(domain);

  if (error) {
    log.error(error, 'domain safety check failed for %s', domain);
    throw new ValidationError("Error when validating url");
  }

  if (data === false) {
    log.warn('blocked banned domain %s', domain);
    throw new ValidationError("Error when validating url");
  }
}
