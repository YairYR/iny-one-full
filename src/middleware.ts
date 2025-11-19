import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from "@/lib/middlewares/session";
import { checkWebhook } from "@/lib/middlewares/webhooks";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if(path === '/api/webhooks') {
    return checkWebhook(request);
  }

  if (isShortRoute(path)) {
    // la solicitud probablemente irá a `src/app/[short]/route.ts`
    console.log('short route detected:', path);
    // aquí puedes añadir lógica específica, p.ej. headers, logging, etc.
    const res = NextResponse.next();
    // ejemplo: añadir X-Robots-Tag antes de la posible redirección
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  return updateSession(request);
}

function isShortRoute(path: string) {
  // excluir root, prefijos reservados y archivos con extensión
  if (path === '/' || path === '/es' || path === '/en') return false;
  if (/^\/(api|_next|favicon\.ico|site\.webmanifest)/.test(path)) return false;
  // una única segmentación sin punto ni subdirectorios, permite opcional trailing slash
  return /^\/[^\/.?#]+\/?$/.test(path);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}