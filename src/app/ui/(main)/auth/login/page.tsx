import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { redirect } from "next/navigation";
import LoginForm from "@/features/auth/components/LoginForm";
import { getLocale } from "next-intl/server";
import { localizedPath } from "@/i18n/routes";

export default async function LoginPage() {
  const user = await getCurrentUserDTO();

  if (user) {
    return redirect(localizedPath("/dashboard", await getLocale()));
  }

  return <LoginForm />;
}
