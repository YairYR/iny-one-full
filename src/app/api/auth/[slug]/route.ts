import { NextRequest } from "next/server";
import { handleConfirm, handleLogin, handleRegister } from "@/features/auth/services/auth.services";
import { withErrorHandling } from "@/lib/api/http";
import { Api404Error } from "@/lib/api/errors";

export const GET = withErrorHandling(async (request: NextRequest, ctx: RouteContext<'/api/auth/[slug]'>) => {
  const { slug } = await ctx.params;
  if (slug === 'confirm') {
    return handleConfirm(request);
  } else {
    return new Response('Not Found', { status: 404 });
  }
})

export const POST = withErrorHandling(async (request: NextRequest, ctx: RouteContext<'/api/auth/[slug]'>) => {
  const { slug } = await ctx.params;
  if (slug === 'login') {
    return handleLogin(request);
  } else if (slug === 'register') {
    return handleRegister(request);
  } else {
    throw new Api404Error();
  }
})
