import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { createClient } from "@/utils/supabase/app-server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api/errors";
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
    throw new ApiError("VALIDATION_ERROR", "Invalid request", { status: 400 });
  }

  const supabase = await createClient();

  // OAuth2.0
  if('provider' in body.data) {
    if(body.data.provider !== 'google') {
      throw new ApiError("PROVIDER_NOT_FOUND", "Provider not found", { status: 400 });
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
    throw new ApiError("OAUTH_ERROR", "OAuth error", { status: 402 });
  }

  // Email and password
  // ...

  const { error } = await supabase.auth.signInWithPassword({
    email: body.data.email,
    password: body.data.password,
  });

  if (error) {
    console.error(error)
    throw new ApiError("AUTH_ERROR", "Incorrect email or password", { status: 402 });
  }

  return successResponse({});
}

export async function handleRegister(request: NextRequest) {
  const bodyNoValidated = await request.json();
  const body = schemaRegister.safeParse(bodyNoValidated);

  if(!body.success || body.error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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
    return NextResponse.json({
      error: error.message,
    }, { status: 402 });
  }

  return NextResponse.json({ ok: true });
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