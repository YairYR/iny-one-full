import { redirect } from "next/navigation";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import SetupForm from "@/features/auth/components/SetupForm";
import { loadPersonalSetup } from "@/features/auth/load-personal-setup";
import { ROUTES } from "@/lib/routes";

export default async function AccountSettingsPage() {
  const user = await getCurrentUserDTO();
  if (!user) redirect(ROUTES.LOGIN);

  const initial = await loadPersonalSetup(user.name ?? null, false);
  return (
    <div className="px-4 py-8">
      <SetupForm mode="settings" next={ROUTES.DASHBOARD} {...initial} />
    </div>
  );
}
