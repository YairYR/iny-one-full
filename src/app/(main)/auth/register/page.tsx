import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { redirect } from "next/navigation";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { getLocale } from "next-intl/server";
import { localizedPath } from "@/i18n/routes";

export default async function RegisterPage() {
  const user = await getCurrentUserDTO();
  if(user) return redirect(localizedPath("/dashboard", await getLocale()));

  return <RegisterForm />;
}