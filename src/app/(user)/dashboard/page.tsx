import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { DashboardExample } from "@/features/dashboard/components/DashboardExample";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { getDefaultTeamAccess } from "@/features/authorization/helpers/access";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { localizedPath } from "@/i18n/routes";

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
    return redirect(localizedPath(ROUTES.DASHBOARD_DEMO, await getLocale()));
  }

  const sensitiveAccess = await getDefaultTeamAccess('stats.view_sensitive');
  if (!sensitiveAccess.team_id) {
    return <DashboardExample audience="setup" />;
  }
  const [editAccess, statsAccess] = await Promise.all([
    getDefaultTeamAccess('links.update'),
    getDefaultTeamAccess('stats.view'),
  ]);

  return (
    <UserDashboard
      canViewSensitiveStats={sensitiveAccess.permitted}
      canEditLinks={editAccess.permitted}
      canViewStats={statsAccess.permitted}
    />
  );
}
