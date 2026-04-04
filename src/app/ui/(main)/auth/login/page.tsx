import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { redirect } from "next/navigation";
import LoginForm from "@/features/auth/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUserDTO();

  if (user) {
    return redirect("/dashboard");
  }

  return <LoginForm />;
}
