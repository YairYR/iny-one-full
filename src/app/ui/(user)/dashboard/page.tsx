import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { DashboardExample } from "@/features/dashboard/components/DashboardExample";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { getDefaultTeamAccess } from "@/features/authorization/helpers/access";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | iny.one",
  description: "Manage your short links and view your analytics.",
  openGraph: {
    title: "Dashboard | iny.one",
    description: "Manage your short links and view your analytics.",
    url: ROUTES.DASHBOARD,
  },
};

export default async function DashboardPage() {
  const user = await getCurrentUserDTO();
  if (!user) {
    return redirect(ROUTES.DASHBOARD_DEMO);
  }

  const access = await getDefaultTeamAccess();
  if (!access.team_id) {
    return <DashboardExample audience="setup" />;
  }

  return (
    <UserDashboard />
  );
}
