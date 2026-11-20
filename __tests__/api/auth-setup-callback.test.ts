/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

const exchangeCodeForSession = jest.fn();
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({ auth: { exchangeCodeForSession } }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GET } = require('@/app/(main)/auth/callback/route') as typeof import('@/app/(main)/auth/callback/route');

it('continues through setup while preserving the original destination', async () => {
  exchangeCodeForSession.mockResolvedValue({ error: null });
  const response = await GET(new NextRequest('https://iny.one/auth/callback?code=abc&next=%2Fcart'));
  const location = new URL(response.headers.get('location')!);
  expect(location.pathname).toBe('/auth/setup');
  expect(location.searchParams.get('next')).toBe('/cart');
});

it('does not continue to setup when exchanging the code fails', async () => {
  exchangeCodeForSession.mockResolvedValue({ error: { message: 'invalid' } });
  const response = await GET(new NextRequest('https://iny.one/auth/callback?code=bad'));
  expect(new URL(response.headers.get('location')!).pathname).toBe('/auth/login');
});
