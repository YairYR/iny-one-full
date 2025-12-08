import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { REDIRECT_TO_COOKIE_NAME } from "@/constants";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const user = await getCurrentUserDTO();
  if(user) return redirect("/dashboard");

  const cookieStore = await cookies();
  const supabase = await createClient();

  const goTo = new URL(process.env.SITE_URL ?? "https://www.iny.one");
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
    return redirect(data.url);
  }

  console.error(error);
  return redirect("/#auth_error");
}