import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { createClient } from "@/utils/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { AuthenticationError, ProviderAuthenticationError, ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/responses";

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

  const supabase = await createClient();

  // OAuth2.0
  if('provider' in body.data) {
    if(body.data.provider !== 'google') {
      throw new ValidationError("Provider not found");
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      }
    });

    if(data.url) {
      return successResponse({
        provider: data.provider,
        url: data.url,
      });
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

  return successResponse({});
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