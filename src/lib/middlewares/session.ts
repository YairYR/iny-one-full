import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { CART_COOKIE_NAME, REDIRECT_TO_COOKIE_NAME } from "@/constants";
import { ROUTES } from "@/lib/routes";

const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/ui',
  '/plans',
  '/ui/plans',
  '/cart',
  '/ui/cart',
  '/piscolas',
  '/ui/piscolas',
  '/robots.txt',
  '/sitemap.xml',
]);

const PUBLIC_PREFIXES = [
  '/api',
  '/login',
  '/auth',
  '/ui/auth',
  '/error',
  '/cart/',
  '/ui/cart/',
];

const isPublicPath = (pathname: string) => {
  if (PUBLIC_EXACT_PATHS.has(pathname)) {
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

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    console.log('redirect to auth', request.nextUrl.pathname);
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname.startsWith('/cart/')) {
    const value = request.nextUrl.pathname
      .replace('/cart/', '')
      .split('/')[0];

    request.cookies.set(CART_COOKIE_NAME, value);
    supabaseResponse.cookies.set(CART_COOKIE_NAME, value);

    if (!user) {
      request.cookies.set(REDIRECT_TO_COOKIE_NAME, ROUTES.CART);
      supabaseResponse.cookies.set(REDIRECT_TO_COOKIE_NAME, ROUTES.CART);
    }
  }

  return supabaseResponse;
}
