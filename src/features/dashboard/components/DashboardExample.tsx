'use client';

import dynamic from "next/dynamic";
import { useMemo } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Link from "@/components/LocalizedLink";
import { useFormatter, useTranslations } from "next-intl";
import { Kpi } from "@/features/dashboard/components/Kpi";
import { LinksTable } from "@/features/dashboard/components/LinksTable";
import { DASHBOARD_CHART_HEIGHT, DashboardCard, ExampleBadge } from "@/features/dashboard/components/DashboardCard";
import type { UserUrl } from "@/features/dashboard/types/types";
import { ROUTES } from "@/lib/routes";
import { DASHBOARD_CATEGORY_COLORS, DASHBOARD_CHART_COLORS } from "@/features/dashboard/helpers/chart-palette";

dayjs.extend(utc);

const ChartSkeleton = () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />;
const Line = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Line), { ssr: false, loading: ChartSkeleton });
const Bar = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Bar), { ssr: false, loading: ChartSkeleton });
const Pie = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Pie), { ssr: false, loading: ChartSkeleton });

type ChartKind = 'week' | 'performance' | 'traffic';
type Audience = 'visitor' | 'empty' | 'setup';

/*
 * Un único juego de datos ficticios y coherente entre sí: los clics por enlace
 * suman el total, el último día de la semana es el de las últimas 24 h y el
 * gráfico de rendimiento usa los mismos slugs que la tabla. Si no cuadran, el
 * ejemplo deja de servir para entender cómo se lee el panel real.
 */
const EXAMPLE_LINKS = [
  { slug: 'demo-launch', alias: 'launch', destination: 'https://example.com/launch', clicks: 62, daysAgo: 3, utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'launch' },
  { slug: 'demo-news', alias: 'newsletter', destination: 'https://example.com/blog?utm_source=newsletter', clicks: 35, daysAgo: 9, utm_source: 'newsletter', utm_medium: 'email', utm_campaign: null },
  { slug: 'demo-social', alias: 'social', destination: 'https://example.com/promo', clicks: 21, daysAgo: 14, utm_source: null, utm_medium: null, utm_campaign: null },
  { slug: 'demo-pricing', alias: null, destination: 'https://example.com/pricing', clicks: 0, daysAgo: 20, utm_source: null, utm_medium: null, utm_campaign: null },
] as const;
const EXAMPLE_WEEK = [4, 7, 5, 12, 9, 15, 11];
const EXAMPLE_TRAFFIC = [45, 35, 20];
const EXAMPLE_TOTAL_CLICKS = EXAMPLE_LINKS.reduce((sum, link) => sum + link.clicks, 0);

export function ExampleChart({ kind, showBadge = true }: Readonly<{ kind: ChartKind; showBadge?: boolean }>) {
  const t = useTranslations('DashboardPage');
  const format = useFormatter();
  const performance = EXAMPLE_LINKS.filter((link) => link.clicks > 0);
  const labels = kind === 'week'
    ? [t('week.monday'), t('week.tuesday'), t('week.wednesday'), t('week.thursday'), t('week.friday'), t('week.saturday'), t('week.sunday')]
    : kind === 'performance'
      ? performance.map((link) => link.slug)
      : [t('traffic.direct'), 'Google', t('traffic.other')];
  const values = kind === 'week' ? EXAMPLE_WEEK : kind === 'performance' ? performance.map((link) => link.clicks) : EXAMPLE_TRAFFIC;
  const data = {
    labels,
    datasets: [{
      label: kind === 'traffic' ? '%' : t('table.links.headers.clicks'),
      data: values,
      fill: kind === 'week',
      tension: 0.25,
      borderColor: DASHBOARD_CHART_COLORS.indigo,
      backgroundColor: kind === 'week'
        ? DASHBOARD_CHART_COLORS.indigoFill
        : [...DASHBOARD_CATEGORY_COLORS.slice(0, values.length)],
    }],
  };
  const options = { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } };

  return (
    <div>
      {showBadge && <div className="mb-2"><ExampleBadge /></div>}
      {kind === 'traffic' ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:flex-col xl:items-stretch">
          <div className="h-40 sm:w-1/2 xl:w-full lg:h-[clamp(8rem,17dvh,11rem)]"><Pie data={data} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} aria-hidden="true" /></div>
          <TrafficList items={labels.map((label, index) => ({ label, value: values[index] }))} format={format.number} />
        </div>
      ) : (
        <div className={`${DASHBOARD_CHART_HEIGHT} w-full`}>
          {kind === 'week' && <Line data={data} options={options} aria-hidden="true" />}
          {kind === 'performance' && <Bar data={data} options={options} aria-hidden="true" />}
        </div>
      )}
      {kind !== 'traffic' && <ul className="sr-only">
        {labels.map((label, index) => <li key={label}>{label}: {format.number(values[index])}</li>)}
      </ul>}
    </div>
  );
}

/** Leyenda accesible del gráfico de tráfico; la comparten el panel real y el de ejemplo. */
export function TrafficList({ items, format }: Readonly<{ items: { label: string; value: number }[]; format: (value: number) => string }>) {
  return (
    <ul className="min-w-0 flex-1 space-y-1 text-sm text-gray-600">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: DASHBOARD_CATEGORY_COLORS[index % DASHBOARD_CATEGORY_COLORS.length] }} />
            <span className="truncate">{item.label}</span>
          </span>
          <span className="font-medium text-gray-900">{format(item.value)}%</span>
        </li>
      ))}
    </ul>
  );
}

export function DashboardExample({ audience }: Readonly<{ audience: Audience }>) {
  const t = useTranslations('DashboardPage');
  const format = useFormatter();
  const cta = audience === 'visitor'
    ? { href: ROUTES.REGISTER, label: t('example.register') }
    : audience === 'setup'
      ? { href: '/auth/setup', label: t('example.setupAction') }
      : { href: ROUTES.HOME, label: t('button.newLink') };

  const links = useMemo<UserUrl[]>(() => {
    const today = dayjs().utc().startOf('day').hour(14);
    return EXAMPLE_LINKS.map((link, index) => ({
      link_id: `00000000-0000-4000-8000-00000000000${index + 1}`,
      slug: link.slug,
      alias: link.alias ? t(`example.links.${link.alias}`) : null,
      destination: link.destination,
      created_at: today.subtract(link.daysAgo, 'day').toISOString(),
      utm_source: link.utm_source,
      utm_medium: link.utm_medium,
      utm_campaign: link.utm_campaign,
      clicks: link.clicks,
    }));
  }, [t]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <header>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-gray-500">{t('subtitle')}</p>
        </header>

        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="note">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900">{t('example.title')} <ExampleBadge /></h2>
            <p className="mt-0.5 text-sm text-gray-700">{t(`example.${audience}`)}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {audience === 'setup' && <Link href={ROUTES.HOME} className="font-medium text-indigo-700 underline focus-visible:outline-2 focus-visible:outline-indigo-600">{t('button.newLink')}</Link>}
            <Link href={cta.href} className="inline-flex rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{cta.label}</Link>
          </div>
        </div>

        <section aria-label={t('example.label')} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi example emphasized title={t('panel.totalLinks.title')} value={format.number(EXAMPLE_LINKS.length)} />
          <Kpi example title={t('panel.totalClicks.title')} value={format.number(EXAMPLE_TOTAL_CLICKS)} />
          <Kpi example title={t('panel.clicksLast24h.title')} value={format.number(EXAMPLE_WEEK[EXAMPLE_WEEK.length - 1])} />
          <Kpi example title={t('panel.topCountry.title')} value="CL" />
        </section>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DashboardCard example title={t('panel.weekActivity.title')} subtitle={t('panel.weekActivity.subtitle')}>
            <ExampleChart kind="week" showBadge={false} />
          </DashboardCard>
          <DashboardCard example tone="subtle" title={t('panel.performancePerLink.title')}>
            <ExampleChart kind="performance" showBadge={false} />
          </DashboardCard>
          <DashboardCard example title={t('panel.sourceTraffic.title')} className="md:col-span-2 xl:col-span-1">
            <ExampleChart kind="traffic" showBadge={false} />
          </DashboardCard>
        </div>

        <LinksTable links={links} total={links.length} page={1} totalPages={1} onPageChange={() => undefined}
          onEdit={() => undefined} readOnlyReason={t('example.actionUnavailable')} badge={<ExampleBadge />} />
      </div>
    </div>
  );
}
