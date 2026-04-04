import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ROUTES } from '@/lib/routes';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iny.one';

function sanitizeNext(next: string | null) {
  if (!next || !next.startsWith('/')) {
    return ROUTES.DASHBOARD;
  }

  // no exponer rutas internas
  if (next.startsWith('/ui/')) {
    return ROUTES.DASHBOARD;
  }

  // evita callback recursivo
  if (next.startsWith('/auth/callback')) {
    return ROUTES.DASHBOARD;
  }

  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const next = sanitizeNext(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${SITE_URL}/auth/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('OAuth callback exchange failed:', error.message);
    return NextResponse.redirect(`${SITE_URL}/auth/login?error=oauth_callback`);
  }

  return NextResponse.redirect(`${SITE_URL}${next}`);
}
