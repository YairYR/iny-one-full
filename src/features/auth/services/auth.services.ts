import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { AuthenticationError, ProviderAuthenticationError, ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/responses";
import { REDIRECT_TO_COOKIE_NAME } from "@/constants";

const schemaLogin = z.object({
  email: z.email(),
  password: z.string(),
}).or(z.object({
  provider: z.string(),
}));

const schemaRegister = z.object({
  email: z.email(),
  password: z.string(),
  name: z.string(),
});

export async function handleLogin(request: NextRequest) {
  const bodyNoValidated = await request.json();
  const body = schemaLogin.safeParse(bodyNoValidated);

  if(!body.success || body.error) {
    throw new ValidationError();
  }

  const cookieList = request.cookies;
  const supabase = await createClient();

  // OAuth2.0
  if('provider' in body.data) {
    if(body.data.provider !== 'google') {
      throw new ValidationError("Provider not found");
    }
    const goTo = new URL(process.env.SITE_URL ?? "https://www.iny.one");
    goTo.pathname = "/auth/callback";
    if(cookieList.has(REDIRECT_TO_COOKIE_NAME)) {
      const next = cookieList.get(REDIRECT_TO_COOKIE_NAME)!.value;
      goTo.searchParams.set("next", next);
      cookieList.delete(REDIRECT_TO_COOKIE_NAME);
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: goTo.toString(),
      }
    });

    if(data.url) {
      const response = successResponse({
        provider: data.provider,
        url: data.url,
      });
      response.cookies.delete(REDIRECT_TO_COOKIE_NAME);
      return response;
    }

    console.error(error);
    throw new ProviderAuthenticationError();
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: body.data.email,
    password: body.data.password,
  });

  if (error) {
    console.error(error)
    throw new AuthenticationError();
  }

  const response = successResponse({});
  response.cookies.delete(REDIRECT_TO_COOKIE_NAME);
  return response;
}

export async function handleRegister(request: NextRequest) {
  const bodyNoValidated = await request.json();
  const body = schemaRegister.safeParse(bodyNoValidated);

  if(!body.success || body.error) {
    throw new ValidationError();
  }
  
  const { name, email, password } = body.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password, options: {
      data: {
        name: name,
        display_name: name,
      }
    } });

  if (error) {
    console.error(error)
    throw new ProviderAuthenticationError();
  }

  return successResponse({});
}

export async function handleConfirm(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  let next = '/error'

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    })
    if (error) {
      console.error(error)
    } else {
      const paramNext = request.nextUrl.searchParams.get("next");
      if(paramNext?.startsWith("/")) {
        next = paramNext;
      } else {
        next = '/'
      }
    }
  }

  return NextResponse.redirect(next);
}