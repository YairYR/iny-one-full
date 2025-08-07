import { NextRequest, MiddlewareConfig, NextResponse } from 'next/server';
import { ALLOWED_ORIGINS } from "@/constants";

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const origin = request.headers.get('Origin') ?? request.headers.get('origin') ?? '';
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  const isPreflight = request.method === 'OPTIONS';

  if(isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  const response = NextResponse.next();

  console.log({ ALLOWED_ORIGINS });

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if(isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if(path.startsWith('/api/')) {
    return Response.json({}, { status: 401, statusText: 'Not Allowed' });
  }

  return response;
}

export const config: MiddlewareConfig = {
  matcher: '/api/:path*',
}