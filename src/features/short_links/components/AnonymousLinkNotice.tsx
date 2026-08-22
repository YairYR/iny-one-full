import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { isLoggedIn } from "@/data/dto/user-dto";
import { ANONYMOUS_LINK_TTL_DAYS } from "@/lib/short-links/expiry";
import { ROUTES } from "@/lib/routes";

/**
 * Avisa de que los enlaces creados sin cuenta caducan, y sólo a quien no ha
 * iniciado sesión: para un usuario autenticado el plazo no aplica y el mensaje
 * sería ruido.
 *
 * El plazo sale de la misma constante que usa /api/v1/shorten al fijar
 * `expires_at`, para que el aviso no pueda prometer algo distinto.
 */
export default async function AnonymousLinkNotice() {
  if (await isLoggedIn()) return null;

  const t = await getTranslations('HomePage');

  return (
    <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-gray-500">
      <ClockIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
      <span>
        {t('anonymousNotice', { days: ANONYMOUS_LINK_TTL_DAYS })}{' '}
        <Link
          href={ROUTES.REGISTER}
          className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
        >
          {t('anonymousNoticeCta')}
        </Link>
      </span>
    </p>
  );
}
