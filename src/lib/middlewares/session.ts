import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { CART_COOKIE_NAME, REDIRECT_TO_COOKIE_NAME } from "@/constants";
import { ROUTES } from "@/lib/routes";
import { localizedPath, unlocalizedPath } from "@/i18n/routes";

const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/about',
  '/plans',
  '/cart',
  '/piscolas',
  '/auth/login',
  '/auth/register',
  '/auth/callback',

  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.PLANS,
  ROUTES.CART,
  ROUTES.PISCOLAS,
  ROUTES.UTM_BUILDER,
  ROUTES.QR_GENERATOR,
  ROUTES.BITLY_ALTERNATIVE,
  ROUTES.API_DOCS,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.DASHBOARD_DEMO,
]);

const PUBLIC_PREFIXES = [
  '/api',
  '/error',
  '/ui/auth',
  '/auth/',
  '/cart/',
];

function normalizePathname(pathname: string) {
  return unlocalizedPath(pathname);
}

const isPublicPath = (pathname: string) => {
  const normalized = normalizePathname(pathname);

  if (PUBLIC_EXACT_PATHS.has(normalized)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => normalized.startsWith(prefix));
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;
  const normalized = normalizePathname(pathname);
  const locale = pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en';

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = normalized === ROUTES.DASHBOARD ? localizedPath(ROUTES.DASHBOARD_DEMO, locale) : ROUTES.LOGIN;
    const response = NextResponse.redirect(url);
    if (normalized === ROUTES.DASHBOARD) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  if (pathname.startsWith('/cart/')) {
    const value = pathname
      .replace('/cart/', '')
      .split('/')[0];

    request.cookies.set(CART_COOKIE_NAME, value);
    supabaseResponse.cookies.set(CART_COOKIE_NAME, value);

    if (!user) {
      request.cookies.set(REDIRECT_TO_COOKIE_NAME, '/cart');
      supabaseResponse.cookies.set(REDIRECT_TO_COOKIE_NAME, '/cart');
    }
  }

  return supabaseResponse;
}
