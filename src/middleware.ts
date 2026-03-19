import { type NextRequest, MiddlewareConfig, NextResponse } from 'next/server'
import { updateSession } from "@/lib/middlewares/session";
import { checkWebhook } from "@/lib/middlewares/webhooks";
import { ROUTES } from "@/lib/routes";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/api/webhooks') {
    return checkWebhook(request);
  }

  if (path.startsWith("/_next/") || path.startsWith("/.well-known/")) {
    return NextResponse.next();
  }

  if (isShortRoute(path)) {
    // Agrega el header "X-Robots-Tag" a los path que no esten definidos
    return NextResponse.next({
      headers: {
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  }

  return updateSession(request);
}

const ALLOWED_ROBOT_INDEX = [
  '/sitemap.xml',
  '/robots.txt',
  '/about',
  '/about/',
  '/piscolas',
  '/piscolas/',
  ROUTES.HOME,
  ROUTES.HOME + '/',
  ROUTES.ABOUT,
  ROUTES.ABOUT + '/',
  ROUTES.PISCOLAS,
  ROUTES.PISCOLAS + '/',
] as const;

function isShortRoute(path: string) {
  // excluir root, prefijos reservados y archivos con extensión
  if (path === '/' || path === '/es' || path === '/en' || ALLOWED_ROBOT_INDEX.includes(path)) return false;
  if (/^\/(api|_next|favicon\.ico|site\.webmanifest)/.test(path)) return false;
  // una única segmentación sin punto ni subdirectorios, permite opcional trailing slash
  return /^\/[^/.?#]+\/?$/.test(path);
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
     '/((?!_next/static|_next/image|favicon\\.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ],
}
