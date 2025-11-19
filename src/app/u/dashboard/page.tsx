import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { createClient } from "@/utils/supabase/app-server";
import { getCurrentUser, getStatsUrls, getUserUrls } from "@/lib/utils/query";
import { redirect } from "next/navigation";
import { ILinkStats } from "@/features/dashboard/types/types";

function DashboardPage({ urls, stats }: { urls: UserUrl[], stats: ILinkStats[] }) {
  return (
    <>
      <h1>Hello!</h1>

      <div className="p-6">
        <UserDashboard urls={urls} stats={stats} />
      </div>
    </>
  )
}

type UserUrl = {
  slug: string;
  destination: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  clicks: number | null;
}

export default async function index() {
  const supabase = await createClient();
  const { user, raw } = await getCurrentUser(supabase);

  if(!user || !raw) {
    return redirect("/auth/login");
  }

  const { data: _urls } = await getUserUrls(raw.id);
  const urls: UserUrl[] = (_urls ?? []) as UserUrl[];
  const { data: _stats } = await getStatsUrls(urls.map(item => item.slug));
  const stats: ILinkStats[] = _stats ?? [];

  return (
    // <AppProvider user={user}>
      <DashboardPage urls={urls} stats={stats}/>
    // </AppProvider>
  )
}
