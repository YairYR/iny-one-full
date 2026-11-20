import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { DashboardExample } from "@/features/dashboard/components/DashboardExample";
import { ROUTES } from "@/lib/routes";
import { buildPageMetadata, normalizeLocale } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('DashboardPage');
  const title = `${t('example.title')} | iny.one`;
  const description = t('example.visitor');
  return {
    ...buildPageMetadata({ title, description, path: ROUTES.DASHBOARD_DEMO, locale: normalizeLocale(await getLocale()) }),
    robots: { index: true, follow: true },
  };
}

export default function DashboardDemoPage() {
  return <DashboardExample audience="visitor" />;
}
