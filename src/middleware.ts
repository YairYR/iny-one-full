import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = ['https://iny.one'];

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function middleware(req: NextRequest) {
  console.log('middleware');
  const origin = req.headers.get('origin') ?? '';
  const isAllowedOrigin = allowedOrigins.includes(origin);

  console.log('Origin', origin);
  console.log('headers', req.headers);

  const isPreflight = req.method === 'OPTIONS';

  if(isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  const res = NextResponse.next();

  if(isAllowedOrigin) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  if(!isAllowedOrigin) {
    return Response.json({}, { status: 401, statusText: 'Not Allowed' });
  }

  return res;
}

export const config = {
  matcher: '/api/:path*',
}