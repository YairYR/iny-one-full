import { createClient } from "@/utils/supabase/app-server";
import { redirect } from "next/navigation";

export default async function LogoutPage() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}