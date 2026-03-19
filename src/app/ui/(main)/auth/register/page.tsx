import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { redirect } from "next/navigation";
import RegisterForm from "@/features/auth/components/RegisterForm";

export default async function RegisterPage() {
  const user = await getCurrentUserDTO();
  if(user) return redirect("/dashboard");

  return <RegisterForm />;
}