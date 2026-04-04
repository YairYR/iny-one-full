import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CART_COOKIE_NAME, REDIRECT_TO_COOKIE_NAME } from "@/constants";
import { ROUTES } from "@/lib/routes";

const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/about',
  '/plans',
  '/cart',
  '/piscolas',

  // internas mientras existan rewrites/compatibilidad
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.PLANS,
  ROUTES.CART,
  ROUTES.PISCOLAS,
]);

const PUBLIC_PREFIXES = [
  '/api',
  '/error',
  '/ui/auth',
  '/cart/',
  '/es',
  '/en',
];

function normalizePathname(pathname: string) {
  if (pathname === '/es' || pathname === '/en') return '/';

  if (pathname.startsWith('/es/')) {
    return pathname.replace(/^\/es/, '');
  }

  if (pathname.startsWith('/en/')) {
    return pathname.replace(/^\/en/, '');
  }

  return pathname;
}

const isPublicPath = (pathname: string) => {
  const normalized = normalizePathname(pathname);

  if (PUBLIC_EXACT_PATHS.has(normalized)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(url);
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
