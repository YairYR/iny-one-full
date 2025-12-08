import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { cookies } from "next/headers";
import { REDIRECT_TO_COOKIE_NAME } from "@/constants";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUserDTO();
  if(user) return NextResponse.redirect("/dashboard");

  const cookieStore = await cookies();
  const supabase = await createClient();

  const goTo = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.iny.one");
  goTo.pathname = "/auth/callback";
  if(cookieStore.has(REDIRECT_TO_COOKIE_NAME)) {
    const next = cookieStore.get(REDIRECT_TO_COOKIE_NAME)!.value;
    goTo.searchParams.set("next", next);
    cookieStore.delete(REDIRECT_TO_COOKIE_NAME);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: goTo.toString(),
    }
  });

  if(data.url) {
    return NextResponse.redirect(data.url);
  }

  console.error(error);
  return NextResponse.redirect("/#auth_error");
}