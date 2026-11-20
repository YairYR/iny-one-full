import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { redirect } from "next/navigation";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { ROUTES } from "@/lib/routes";
import { getDefaultTeamAccess } from "@/features/authorization/helpers/access";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUserDTO();
  if (!user) {
    return redirect(ROUTES.LOGIN);
  }

  const access = await getDefaultTeamAccess();
  if (!access.team_id) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Your team is not set up yet</h1>
        <p className="mt-3">Name your personal team or create your first short link to get started.</p>
        <div className="mt-4 flex gap-4">
          <Link href="/auth/setup" className="text-indigo-600 underline">Set up your team</Link>
          <Link href="/" className="text-indigo-600 underline">Create a short link</Link>
        </div>
      </div>
    );
  }

  return (
    <UserDashboard />
  );
}
