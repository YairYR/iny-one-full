import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DashboardExample } from "@/features/dashboard/components/DashboardExample";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('DashboardPage');
  const title = `${t('example.title')} | iny.one`;
  const description = t('example.visitor');
  return {
    title,
    description,
    alternates: { canonical: ROUTES.DASHBOARD_DEMO },
    openGraph: { title, description, url: ROUTES.DASHBOARD_DEMO, siteName: "iny.one", type: "website", images: ["/og-image.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
    robots: { index: true, follow: true },
  };
}

export default function DashboardDemoPage() {
  return <DashboardExample audience="visitor" />;
}
