import { ALLOWED_PARAMS } from "@/lib/routes";
import { PlanName, UtmParams, UtmValues } from "@/lib/types";
import { safeDecodeURI } from "@/lib/utils/url";

export type DestinationPlan = PlanName | 'freeAnonymous';

/**
 * Plan con el que se filtran los UTM, a partir del contexto de acceso.
 *
 * Antes salía de `user_metadata.user_plan`, es decir del JWT, que a su vez
 * viene de `users_profiles.plan`. Nada actualiza esa tabla cuando una
 * suscripción se activa, así que quien pagaba el plan Básico seguía sin
 * `utm_content` ni `utm_term` —justo lo que ese plan promete— hasta que
 * alguien la tocaba a mano. Ahora sale del `plan_key` del servicio efectivo,
 * el mismo origen que decide la cuota.
 *
 * Un `plan_key` desconocido cae a `free`, nunca a `freeAnonymous`: un usuario
 * con sesión no puede quedar por debajo del plan gratuito por un dato raro.
 */
export function toDestinationPlan(planKey: string | null, anonymous: boolean): DestinationPlan {
  if (anonymous) return 'freeAnonymous';

  if (planKey && planKey !== 'freeAnonymous' && Object.hasOwn(ALLOWED_PARAMS, planKey)) {
    return planKey as PlanName;
  }

  return 'free';
}

/** Parámetros UTM soportados, en el orden en que se escriben en la URL. */
export const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content', 'id'] as const;

const UTM_PREFIX = 'utm_';

/**
 * Normaliza un valor UTM al conjunto de caracteres seguro para una query string.
 * Devuelve `null` cuando el valor está vacío o queda vacío tras limpiarlo.
 */
export function sanitizeUtmValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const sanitized = value.replaceAll(/[^a-zA-Z0-9-_]/g, '');
  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Construye la URL de destino aplicando los UTM permitidos por el plan.
 *
 * - Los valores explícitos de `utm` tienen prioridad sobre los que ya venían en
 *   la URL original.
 * - Los UTM no permitidos para el plan se eliminan.
 * - **Cualquier otro parámetro de la URL se conserva intacto.**
 */
export function buildDestination(
  url: string,
  utm: Partial<UtmValues>,
  plan: DestinationPlan,
): { destination: string; utm: UtmValues } {
  const destination = new URL(url);
  const allowed = new Set<string>(ALLOWED_PARAMS[plan]);

  const resolved = resolveUtm(destination, utm);

  for (const key of UTM_KEYS) {
    const param = `${UTM_PREFIX}${key}`;
    const value = resolved[key];

    if (value !== null && allowed.has(param)) destination.searchParams.set(param, value);
    else destination.searchParams.delete(param);
  }

  // Un UTM desconocido (utm_ algo que no está en UTM_KEYS) tampoco debe llegar
  // al destino: se elimina sobre una copia de las claves para no mutar mientras
  // se itera el iterador vivo de `searchParams`.
  for (const param of [...destination.searchParams.keys()]) {
    if (param.startsWith(UTM_PREFIX) && !allowed.has(param)) destination.searchParams.delete(param);
  }

  return {
    destination: safeDecodeURI(destination.toString()),
    utm: resolved,
  };
}

function resolveUtm(destination: URL, utm: Partial<UtmValues>): UtmValues {
  return UTM_KEYS.reduce((resolved, key) => {
    const explicit = sanitizeUtmValue(utm[key]);
    resolved[key] = explicit ?? sanitizeUtmValue(destination.searchParams.get(`${UTM_PREFIX}${key}`));
    return resolved;
  }, {} as UtmValues) satisfies Record<keyof UtmParams, string | null>;
}
