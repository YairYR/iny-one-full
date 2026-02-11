import { ShorterRepository } from "@/infra/db/shorter.repository";
import { UserRepository } from "@/infra/db/user.repository";
import { PlanName } from "@/lib/types";

export type RateLimitConfig = { [Key in PlanName]: number } & { freeAnonymous: number };

export const RATE_LIMITS: RateLimitConfig = {
  freeAnonymous: 5,
  free: 50,
  basic: 1000,
  pro: 10000,
};

export async function checkRateLimit(
  user_id: string | null,
  user_plan: string | null,
  ip: string,
  shorterRepo: ShorterRepository,
): Promise<{ allowed: boolean; message?: string }> {
  if (!user_id) {
    const { count } = await shorterRepo.countLinksByIpInLastMonth(ip);
    if (count !== null && count >= RATE_LIMITS.freeAnonymous) {
      return {
        allowed: false,
        message: `Límite alcanzado: ${RATE_LIMITS.freeAnonymous} links/mes. Inicia sesión para más.`
      };
    }
  } else if (user_plan && user_plan in RATE_LIMITS) {
    const { count } = await shorterRepo.countLinksByUserInLastMonth(user_id);
    // @ts-expect-error plan es una key de RATE_LIMITS, pero TypeScript no lo infiere correctamente
    if(count !== null && count >= RATE_LIMITS[user_plan]) {
      return {
        allowed: false,
        // @ts-expect-error plan es una key de RATE_LIMITS, pero TypeScript no lo infiere correctamente
        message: `Límite alcanzado para el plan ${user_plan}: ${RATE_LIMITS[user_plan]} links/mes. Considera actualizar tu plan.`
      };
    }
  }

  return { allowed: true };
}