import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { createClient } from "@/lib/supabase/server";
import { getTeamRepository } from "@/infra/db/team.repository";
import { getShorterRepository } from "@/infra/db/shorter.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import logger from "@/lib/logger";
import { hasTeamPermissions } from "@/features/authorization/helpers/access";
import { localizedPath } from "@/i18n/routes";
import { ROUTES } from "@/lib/routes";
import LinkDetailsView from "@/features/dashboard/components/LinkDetailsView";
import type { UserUrlStats } from "@/features/dashboard/types/types";

const log = logger.child({ route: 'dashboard/link/details' });

export const metadata: Metadata = {
  title: "Link details | iny.one",
  description: "Detailed analytics for a short link.",
  robots: { index: false, follow: false },
};

export default async function LinkDetailsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ id?: string | string[]; range?: string | string[] }> }>) {
  const params = await searchParams;
  const id = typeof params.id === "string" ? params.id : undefined;
  const parsedId = z.uuid().safeParse(id);
  if (!parsedId.success) notFound();

  const user = await getCurrentUserDTO();
  if (!user) redirect(localizedPath(ROUTES.LOGIN, await getLocale()));

  const supabase = await createClient();
  const teamRepository = getTeamRepository(supabase);
  const result = await teamRepository.getLinkById(parsedId.data);
  if (result.error || !result.data?.team_id) notFound();

  const {
    "links.read": canRead,
    "stats.view": canViewStats,
    "stats.view_sensitive": canViewSensitive,
    "links.update": canEdit
  } = await hasTeamPermissions(result.data.team_id, [
      'links.read',
      'stats.view',
      'stats.view_sensitive',
      'links.update'
  ]);

  if (!canRead || !canViewStats) notFound();

  const rangeValue = typeof params.range === "string" ? params.range : "7";
  const range = canViewSensitive && (rangeValue === "30" || rangeValue === "90") ? Number(rangeValue) : 7;
  // `utms` tiene RLS sin políticas: con la sesión del usuario el embebido llega
  // vacío y el panel mostraba siempre «—». Se lee con service role, y sólo
  // después de comprobar los permisos del equipo del enlace.
  const utms = await getShorterRepository(supabase_service).getUtmsByLinkId(parsedId.data);
  if (utms.error) log.error(utms.error, 'failed to read link UTM values for %s', parsedId.data);

  const link: UserUrlStats = {
    link_id: result.data.link_id,
    slug: result.data.slug,
    alias: result.data.name ?? null,
    destination: result.data.destination,
    created_at: result.data.created_at,
    clicks: result.data.clicks,
    utm_source: utms.data?.utm_source ?? null,
    utm_medium: utms.data?.utm_medium ?? null,
    utm_campaign: utms.data?.utm_campaign ?? null,
  };

  return (
    <LinkDetailsView
      link={link}
      initialRange={range}
      canViewSensitiveStats={canViewSensitive}
      canEdit={canEdit}
    />
  );
}
