import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { redirect } from "next/navigation";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { ROUTES } from "@/lib/routes";

export default async function DashboardPage() {
  const user = await getCurrentUserDTO();
  if (!user) {
    return redirect(ROUTES.LOGIN);
  }

  return (
    <UserDashboard />
  );
}
