import 'server-only';

import { getCurrentUser } from "@/lib/utils/query";
import { createClient } from "@/utils/supabase/app-server";
import { cache } from "react";

export const getCurrentUserDTO = cache(async () => {
  const supabase = await createClient();
  const { user } = await getCurrentUser(supabase);
  return user;
});

export const isLoggedIn = cache(async () => {
  const user = await getCurrentUserDTO();
  return !!user;
});

