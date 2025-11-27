import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CallbackPage({ searchParams }: { searchParams: { code: string; next?: string; } }) {
  const code = searchParams['code'];
  let next = searchParams['next'] ?? '';
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/dashboard';
  }

  console.log('next', next);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if(!error) {
      return redirect(next);
    }
  }

  return redirect('/auth/login?error=callback_failed');
}