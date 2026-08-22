import { ShorterRepository } from "@/infra/db/shorter.repository";
import { PlanName } from "@/lib/types";
import { TtlCache } from "@/lib/cache/ttl-cache";
import { logger } from "@/lib/logger";

export type RateLimitPlan = PlanName | 'freeAnonymous';

/** Links que cada plan puede crear por mes. */
export const RATE_LIMITS: Record<RateLimitPlan, number> = {
  freeAnonymous: 5,
  free: 50,
  basic: 1000,
  pro: 10000,
};

/**
 * Plan aplicado a un usuario autenticado cuyo plan no se pudo determinar
 * (metadata del JWT ausente o con un valor desconocido). Se elige el más
 * restrictivo de los planes autenticados para no dejar la cuota abierta.
 */
const FALLBACK_AUTHENTICATED_PLAN: PlanName = 'free';

/** Bucket para peticiones anónimas sin IP atribuible (p. ej. en local). */
const UNKNOWN_CLIENT = 'unknown';

/**
 * Vigencia del consumo cacheado. Corto a propósito: el contador vive por
 * instancia, así que una ventana breve acota cuánto puede desviarse del valor
 * real cuando hay varias instancias sirviendo tráfico en paralelo.
 */
const USAGE_TTL_MS = 60_000;

const log = logger.child({ module: 'rate-limits' });

/**
 * Contador de consumo. La implementación por defecto vive en memoria; sustituir
 * esta interfaz por una respaldada en Redis es el único cambio necesario para
 * tener conteo exacto y compartido entre instancias.
 */
export interface UsageStore {
  get(key: string): number | undefined;
  set(key: string, used: number): void;
  increment(key: string, delta?: number): void;
}

export class MemoryUsageStore implements UsageStore {
  private readonly cache: TtlCache<number>;

  constructor(ttlMs: number = USAGE_TTL_MS, maxEntries?: number) {
    this.cache = new TtlCache<number>(ttlMs, maxEntries);
  }

  get(key: string): number | undefined {
    return this.cache.get(key);
  }

  set(key: string, used: number): void {
    this.cache.set(key, used);
  }

  increment(key: string, delta = 1): void {
    this.cache.update(key, (current) => current + delta);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const defaultUsageStore = new MemoryUsageStore();

export type RateLimitResult = {
  allowed: boolean;
  /** Clave del bucket; necesaria para registrar el consumo tras crear el link. */
  key: string;
  plan: RateLimitPlan;
  limit: number;
  used: number;
  remaining: number;
};

export type RateLimitInput = {
  userId: string | null;
  plan: PlanName | null;
  ip: string | null;
  repo: ShorterRepository;
  store?: UsageStore;
};

export function resolveRateLimitPlan(userId: string | null, plan: PlanName | null): RateLimitPlan {
  if (!userId) return 'freeAnonymous';
  if (plan !== null && Object.hasOwn(RATE_LIMITS, plan)) return plan;

  log.warn('unknown plan for authenticated user, applying fallback', {
    plan,
    fallback: FALLBACK_AUTHENTICATED_PLAN,
  });
  return FALLBACK_AUTHENTICATED_PLAN;
}

export function usageKey(userId: string | null, ip: string | null): string {
  return userId ? `user:${userId}` : `ip:${ip ?? UNKNOWN_CLIENT}`;
}

/**
 * Comprueba si el cliente puede crear otro link.
 *
 * El consumo se resuelve desde la caché cuando está disponible; sólo se consulta
 * la base de datos en el primer acceso de cada ventana, lo que evita un COUNT
 * por cada petición.
 */
export async function checkRateLimit({
  userId,
  plan,
  ip,
  repo,
  store = defaultUsageStore,
}: RateLimitInput): Promise<RateLimitResult> {
  const effectivePlan = resolveRateLimitPlan(userId, plan);
  const limit = RATE_LIMITS[effectivePlan];
  const key = usageKey(userId, ip);

  const cached = store.get(key);
  const used = cached ?? (await loadUsage({ userId, ip, repo }));

  if (used === null) {
    // No se pudo medir el consumo. Se permite la petición: el insert posterior
    // es la barrera real y fallará igualmente si la base de datos no responde.
    return { allowed: true, key, plan: effectivePlan, limit, used: 0, remaining: limit };
  }

  if (cached === undefined) store.set(key, used);

  return {
    allowed: used < limit,
    key,
    plan: effectivePlan,
    limit,
    used,
    remaining: Math.max(0, limit - used),
  };
}

/** Registra un link creado para que la caché no quede por debajo del consumo real. */
export function recordRateLimitUsage(
  result: Pick<RateLimitResult, 'key'>,
  store: UsageStore = defaultUsageStore,
): void {
  store.increment(result.key);
}

async function loadUsage({
  userId,
  ip,
  repo,
}: Pick<RateLimitInput, 'userId' | 'ip' | 'repo'>): Promise<number | null> {
  if (userId) {
    const { count, error } = await repo.countLinksByUserInLastMonth(userId);
    if (error) {
      log.error('failed to count links by user', { error });
      return null;
    }
    return count ?? 0;
  }

  if (ip) {
    const { count, error } = await repo.countLinksByIpInLastMonth(ip);
    if (error) {
      log.error('failed to count links by ip', { error });
      return null;
    }
    return count ?? 0;
  }

  // Sin usuario ni IP no hay nada que consultar en base de datos: el consumo se
  // contabiliza únicamente en memoria para esta instancia.
  log.warn('anonymous request without a resolvable client ip');
  return 0;
}
