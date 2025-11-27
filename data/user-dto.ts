import 'server-only';

import { cache } from "react";
import { UserRepository } from "@/infra/db/user.repository";
import { UserClient } from "@/lib/types";

export const getCurrentUserDTO = cache(async () => {
  // select public.custom_access_token_hook('{"user_id":"4fe166ec-0b6a-46fa-b067-48c527212eb5","claims":{}}')

  const { data } = await UserRepository.getCurrentUser();
  if(!data.user) {
    return null;
  }

  const user: UserClient = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.name ?? data.user.user_metadata?.display_name ?? null,
    picture: data.user.user_metadata?.picture ?? null,
    created_at: data.user.created_at,
    role: data.role
  };

  return user;
});

export const isLoggedIn = cache(async () => {
  const user = await getCurrentUserDTO();
  return !!user;
});

