import { createClient } from "@/lib/supabase/server";
import { successResponse } from "@/lib/api/responses";

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return successResponse({});
}