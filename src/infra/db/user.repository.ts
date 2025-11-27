import supabase from "@/infra/db/supabase";
import { createClient } from "@/utils/supabase/app-server";
import { jwtDecode, JwtPayload } from "jwt-decode";

export const UserRepository = {
  async findByEmail(email: string) {
    return supabase.from("users_profiles")
      .select("*")
      .eq("email", email)
      .limit(1)
      .single();
  },

  async getCurrentUser() {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();

    const { data: { session } } = await client.auth.getSession();
    const jwt = session ? jwtDecode<SessionDecoded>(session.access_token) : null;

    return {
      data: {
        user,
        role: jwt?.user_role ?? null
      }
    };
  },

  async getCurrentUserId() {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    return user?.id ?? null;
  }
}

interface SessionDecoded extends JwtPayload {
  user_role: string|null;
}