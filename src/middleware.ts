import { type NextRequest } from 'next/server'
import { updateSession } from "@/lib/middlewares/session";
import { checkWebhook } from "@/lib/middlewares/webhooks";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // PayPal webhooks
  if(path === '/api/webhooks') {
    return checkWebhook(request);
  }

  return updateSession(request);
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