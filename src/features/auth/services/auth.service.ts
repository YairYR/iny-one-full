import { loginUser } from "@/core/use-cases/auth";

export async function handleLogin(email: string, password: string) {
  return loginUser(email, password);
}
