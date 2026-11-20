import { headers } from "next/headers";
import * as z from "zod";
import { getClientCountryCode } from "@/lib/utils/geolocation";
import { isCountryCode, isTimeZone } from "@/features/auth/setup-options";
import { getTeamRepository } from "@/infra/db/team.repository";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const log = logger.child({ module: 'auth/personal-setup' });
const setupSchema = z.object({
  full_name: z.string().nullable(),
  country: z.string().nullable(),
  timezone: z.string().nullable(),
  team_name: z.string().nullable(),
});

export async function loadPersonalSetup(userName: string | null, useLocationDefaults = true) {
  const requestHeaders = useLocationDefaults ? await headers() : null;
  const country = requestHeaders ? getClientCountryCode(requestHeaders)?.toUpperCase() ?? '' : '';
  const timezone = requestHeaders?.get('x-vercel-ip-timezone') ?? '';
  const result = await getTeamRepository(await createClient()).getPersonalSetup();
  const profile = setupSchema.safeParse(result.data);
  if (result.error || !profile.success) {
    log.error({ error: result.error, validation: profile.error }, 'failed to load setup');
    throw new Error('Unable to load account setup');
  }
  const savedCountry = profile.data.country ?? country;
  const savedTimezone = profile.data.timezone ?? timezone;
  return {
    initialFullName: profile.data.full_name ?? userName ?? '',
    initialTeamName: profile.data.team_name,
    initialCountry: isCountryCode(savedCountry) ? savedCountry : '',
    initialTimezone: isTimeZone(savedTimezone) ? savedTimezone : '',
  };
}
