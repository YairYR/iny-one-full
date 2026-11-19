import { redirect } from "next/navigation";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import SetupForm from "@/features/auth/components/SetupForm";
import { headers } from "next/headers";
import { getClientCountryCode } from "@/lib/utils/geolocation";
import { isCountryCode, isTimeZone } from "@/features/auth/setup-options";
import { getTeamRepository } from "@/infra/db/team.repository";
import { createClient } from "@/lib/supabase/server";
import * as z from "zod";
import { logger } from "@/lib/logger";

const log = logger.child({ module: 'auth/setup' });
const setupSchema = z.object({
  full_name: z.string().nullable(),
  country: z.string().nullable(),
  timezone: z.string().nullable(),
  team_name: z.string().nullable(),
});

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
  const requestHeaders = await headers();
  const country = getClientCountryCode(requestHeaders)?.toUpperCase() ?? '';
  const timezone = requestHeaders.get('x-vercel-ip-timezone') ?? '';
  const result = await getTeamRepository(await createClient()).getPersonalSetup();
  const profile = setupSchema.safeParse(result.data);
  if (result.error || !profile.success) {
    log.error({ error: result.error, validation: profile.error }, 'failed to load setup');
    throw new Error('Unable to load account setup');
  }
  const savedCountry = profile.data.country ?? country;
  const savedTimezone = profile.data.timezone ?? timezone;
  return <SetupForm next={next} initialFullName={profile.data.full_name ?? user.name ?? ''}
    initialTeamName={profile.data.team_name}
    initialCountry={isCountryCode(savedCountry) ? savedCountry : ''}
    initialTimezone={isTimeZone(savedTimezone) ? savedTimezone : ''} />;
}
