import LoginForm from "@/features/auth/components/LoginForm";
import { getCurrentUserDTO } from "@/data/user-dto";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getCurrentUserDTO();
  if(user) return redirect("/dashboard");

  return <LoginForm />;
}