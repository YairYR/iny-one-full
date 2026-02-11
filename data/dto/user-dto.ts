import 'server-only';

import { cache } from "react";
import { getUserRepository } from "@/infra/db/user.repository";
import { UserClient } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUserDTO = cache(async () => {
  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);
  const { data } = await userRepo.getCurrentUser();
  if(!data.user) {
    return null;
  }

  const user: UserClient = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.name ?? data.user.user_metadata?.display_name ?? data.user.user_metadata?.full_name ?? null,
    picture: data.user.user_metadata?.picture ?? data.user.user_metadata?.avatar_url ?? null,
    created_at: data.user.created_at,
    role: data.role,
    plan: data.plan,
  };

  return user;
});

export const isLoggedIn = cache(async () => {
  const user = await getCurrentUserDTO();
  return !!user;
});

