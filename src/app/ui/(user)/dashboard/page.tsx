import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { DashboardExample } from "@/features/dashboard/components/DashboardExample";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { getDefaultTeamAccess } from "@/features/authorization/helpers/access";

export default async function DashboardPage() {
  const user = await getCurrentUserDTO();
  if (!user) {
    return <DashboardExample audience="visitor" />;
  }

  const access = await getDefaultTeamAccess();
  if (!access.team_id) {
    return <DashboardExample audience="setup" />;
  }

  return (
    <UserDashboard />
  );
}
