import { NextRequest } from "next/server";
import { handleConfirm, handleLogin, handleRegister } from "@/features/auth/services/auth.services";

export async function GET(request: NextRequest, ctx: RouteContext<'/api/auth/[slug]'>) {
  const { slug } = await ctx.params;
  if (slug === 'confirm') {
    return handleConfirm(request);
  } else {
    return new Response('Not Found', { status: 404 });
  }
}

export async function POST(request: NextRequest, ctx: RouteContext<'/api/auth/[slug]'>) {
  const { slug } = await ctx.params;
  if (slug === 'login') {
    return handleLogin(request);
  } else if (slug === 'register') {
    return handleRegister(request);
  } else {
    return new Response('Not Found', { status: 404 });
  }
}