import { redirect } from "next/navigation";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import SetupForm from "@/features/auth/components/SetupForm";
import { loadPersonalSetup } from "@/features/auth/load-personal-setup";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUserDTO();
  if (!user) redirect('/auth/login');

  const { next: requested } = await searchParams;
  const next = requested && requested.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\')
    && !requested.startsWith('/auth/') && !requested.startsWith('/ui/')
    ? requested : '/dashboard';
  const initial = await loadPersonalSetup(user.name ?? null);
  return <SetupForm next={next} {...initial} />;
}
