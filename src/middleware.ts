import { type NextRequest, MiddlewareConfig, NextResponse } from 'next/server'
import { updateSession } from "@/lib/middlewares/session";
import { checkWebhook } from "@/lib/middlewares/webhooks";
import { ROUTES } from "@/lib/routes";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

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
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.PISCOLAS,
] as const;

function isShortRoute(path: string) {
  // excluir rutas públicas conocidas
  if (path === '/' || path === '/es' || path === '/en' || UPDATABLE_SESSION.includes(path as never)) {
    return false;
  }

  // excluir prefijos reservados y archivos especiales
  if (/^\/(api|_next|favicon\.ico|site\.webmanifest|sitemap\.xml|robots\.txt|\.well-known)/.test(path)) {
    return false;
  }

  // excluir cualquier archivo con extensión
  if (/\.[a-z0-9]+$/i.test(path)) {
    return false;
  }

  // una única segmentación sin punto ni subdirectorios, permite slash final opcional
  return /^\/[^/.?#]+\/?$/.test(path);
}

export const config: MiddlewareConfig = {
  matcher: [
    '/((?!api|_next|favicon\\.ico|site\\.webmanifest|sitemap\\.xml|robots\\.txt|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|webmanifest)$).*)'
  ],
}
