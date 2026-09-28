'use server';
import 'server-only';

import { cache } from "react";
import { getUserRepository } from "@/infra/db/user.repository";
import { PlanName, UserClient } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import {hideEmail} from "@/lib/utils/hide-information";
import { getEffectiveService } from "@/features/authorization/helpers/access";

export const getCurrentUserDTO = cache(async () => {
  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);
  const { data } = await userRepo.getCurrentUser();
  if(!data.user) {
    return null;
  }

  const user: UserClient = {
    id: data.user.id,
    email: hideEmail(data.user.email!),
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

export const hasSubscription = cache(async function hasSubscription() {
  const service = await getEffectiveService();

  if (!service || !service[0] || service[0].anonymous || !service[0].plan_key) {
    return false;
  }

  const plan = service[0].plan_key as PlanName;
  return plan !== 'free' ;
});
