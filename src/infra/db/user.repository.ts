import supabase from "@/infra/db/supabase";

export const UserRepository = {
  async findByEmail(email: string) {
    return supabase.from("users_profiles")
      .select("*")
      .eq("email", email)
      .limit(1)
      .single();
  }
}