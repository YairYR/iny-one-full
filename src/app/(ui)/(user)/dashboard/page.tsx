import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { redirect } from "next/navigation";
import { getCurrentUserDTO } from "@/data/dto/user-dto";

export default async function DashboardPage() {
  const user = await getCurrentUserDTO();
  if (!user) {
    return redirect("/auth/login");
  }

  return (
    <UserDashboard />
  );
}
