import { MiddlewareConfig, type NextRequest, NextResponse } from 'next/server'
import { updateSession } from "@/lib/middlewares/session";
import { ROUTES } from "@/lib/routes";
import { checkRequestRateLimit } from "@/lib/middlewares/rate_limit";
import { isLocalizedPath } from "@/i18n/routes";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  request.headers.delete('x-iny-locale');
  if (isLocalizedPath(path)) {
    request.headers.set('x-iny-locale', path === '/es' || path.startsWith('/es/') ? 'es' : 'en');
  } else if (path === '/piscolas') {
    request.headers.set('x-iny-locale', 'es');
  } else if (path.startsWith('/auth/') || path === '/cart') {
    const locale = request.nextUrl.searchParams.get('lang');
    if (locale === 'en' || locale === 'es') request.headers.set('x-iny-locale', locale);
  }

  /* INACTIVO — este guard nunca llegó a ejecutarse (rev. 2026-08-23).
   *
   * El `matcher` de abajo excluye todo lo que empieza por `api`, así que el
   * middleware jamás se invoca para `/api/webhooks` y esta rama era código
   * muerto: un control de seguridad que aparentaba estar puesto.
   *
   * No se reactiva a propósito. Comprobaba cabeceras `x-vercel-internal-bot-*`,
   * que no aportan nada sobre la verificación criptográfica de la firma —ya
   * endurecida en `src/app/api/webhooks/utils.ts` con la validación del host del
   * certificado— y sí pueden romper todos los webhooks si Vercel no las envía.
   *
   * if (path === '/api/webhooks') {
   *   return checkWebhook(request);
   * }
   */

  if (isShortRoute(path)) {
    const rateLimitResponse = await checkRequestRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.next();
  }

  const response = await updateSession(request);
  const locale = request.headers.get('x-iny-locale');
  if (locale && request.cookies.get('iny-locale')?.value !== locale) {
    response.cookies.set('iny-locale', locale, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  }
  return response;
}

const UPDATABLE_SESSION = [
  '/',
  '/about',
  '/piscolas',
  '/plans',
  '/cart',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.PISCOLAS,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.DASHBOARD,
] as const;

function isShortRoute(path: string) {
  if (isLocalizedPath(path) || path === '/en' || UPDATABLE_SESSION.includes(path as never)) {
    return false;
  }

  if (/^\/(api|_next|favicon\.ico|site\.webmanifest|sitemap\.xml|robots\.txt|\.well-known)/.test(path)) {
    return false;
  }

  if (/\.[a-z0-9]+$/i.test(path)) {
    return false;
  }

  return /^\/[^/.?#]+\/?$/.test(path);
}

export const config: MiddlewareConfig = {
  matcher: [
    '/((?!api|_next|favicon\\.ico|site\\.webmanifest|sitemap\\.xml|robots\\.txt|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|webmanifest)$).*)'
  ],
}
