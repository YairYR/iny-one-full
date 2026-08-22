import { type NextRequest, MiddlewareConfig, NextResponse } from 'next/server'
import { updateSession } from "@/lib/middlewares/session";
import { checkWebhook } from "@/lib/middlewares/webhooks";
import { ROUTES } from "@/lib/routes";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // i18n por URL: /es/* fuerza la versión en español (indexable por Google).
  // El header lo consume src/i18n/request.ts. Se borra el valor entrante para
  // que un cliente no pueda inyectarlo directamente.
  request.headers.delete('x-iny-locale');
  if (path === '/es' || path.startsWith('/es/')) {
    request.headers.set('x-iny-locale', 'es');
  }

  if (path === '/api/webhooks') {
    return checkWebhook(request);
  }

  if (isShortRoute(path)) {
    return NextResponse.next();
  }

  return updateSession(request);
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
] as const;

function isShortRoute(path: string) {
  if (path === '/' || path === '/es' || path === '/en' || UPDATABLE_SESSION.includes(path as never)) {
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
