import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { z } from "zod";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { createClient } from "@/lib/supabase/server";
import { getTeamRepository } from "@/infra/db/team.repository";
import { hasTeamPermission } from "@/features/authorization/helpers/access";
import { localizedPath } from "@/i18n/routes";
import { ROUTES } from "@/lib/routes";
import LinkDetailsView from "@/features/dashboard/components/LinkDetailsView";
import type { UserUrlStats } from "@/features/dashboard/types/types";

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

  const [canRead, canViewStats, canViewSensitive, canEdit] = await Promise.all([
    hasTeamPermission(result.data.team_id, 'links.read'),
    hasTeamPermission(result.data.team_id, 'stats.view'),
    hasTeamPermission(result.data.team_id, 'stats.view_sensitive'),
    hasTeamPermission(result.data.team_id, 'links.update'),
  ]);
  if (!canRead || !canViewStats) notFound();

  const rangeValue = typeof params.range === "string" ? params.range : "7";
  const range = canViewSensitive && (rangeValue === "30" || rangeValue === "90") ? Number(rangeValue) : 7;
  const editData = await teamRepository.getLinkForEdit(parsedId.data);

  const link: UserUrlStats = {
    link_id: result.data.link_id,
    slug: result.data.slug,
    alias: result.data.name ?? null,
    destination: result.data.destination,
    created_at: result.data.created_at,
    clicks: result.data.clicks,
    utm_source: editData.data?.utms?.utm_source ?? null,
    utm_medium: editData.data?.utms?.utm_medium ?? null,
    utm_campaign: editData.data?.utms?.utm_campaign ?? null,
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
