import LoginForm from "@/features/auth/components/LoginForm";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { REDIRECT_TO_COOKIE_NAME } from "@/constants";

export default async function LoginPage() {
  const user = await getCurrentUserDTO();
  if(user) return redirect("/dashboard");

  const cookieList = await cookies();

  const nextPage = cookieList.get(REDIRECT_TO_COOKIE_NAME)?.value;
  return <LoginForm nextPage={nextPage} />;
}