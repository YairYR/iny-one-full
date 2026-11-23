'use client';

import dynamic from "next/dynamic";
import Link from "@/components/LocalizedLink";
import { useFormatter, useTranslations } from "next-intl";
import { Kpi } from "@/features/dashboard/components/Kpi";
import { ROUTES } from "@/lib/routes";
import { DASHBOARD_CATEGORY_COLORS, DASHBOARD_CHART_COLORS } from "@/features/dashboard/helpers/chart-palette";

const ChartSkeleton = () => <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />;
const Line = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Line), { ssr: false, loading: ChartSkeleton });
const Bar = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Bar), { ssr: false, loading: ChartSkeleton });
const Pie = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Pie), { ssr: false, loading: ChartSkeleton });

type ChartKind = 'week' | 'performance' | 'traffic';
type Audience = 'visitor' | 'empty' | 'setup';

export function ExampleChart({ kind }: Readonly<{ kind: ChartKind }>) {
  const t = useTranslations('DashboardPage');
  const format = useFormatter();
  const labels = kind === 'week'
    ? [t('week.monday'), t('week.tuesday'), t('week.wednesday'), t('week.thursday'), t('week.friday'), t('week.saturday'), t('week.sunday')]
    : kind === 'performance'
      ? ['ejemplo-a', 'ejemplo-b', 'ejemplo-c']
      : [t('traffic.direct'), 'Google', t('traffic.other')];
  const values = kind === 'week' ? [4, 7, 5, 12, 9, 15, 11] : kind === 'performance' ? [62, 35, 21] : [45, 35, 20];
  const data = {
    labels,
    datasets: [{
      label: kind === 'traffic' ? '%' : t('table.links.headers.clicks'),
      data: values,
      fill: kind === 'week',
      borderColor: kind === 'performance' ? DASHBOARD_CHART_COLORS.cyan : DASHBOARD_CHART_COLORS.indigo,
      backgroundColor: kind === 'traffic'
        ? [...DASHBOARD_CATEGORY_COLORS.slice(0, 3)]
        : kind === 'week'
          ? DASHBOARD_CHART_COLORS.indigoFill
          : DASHBOARD_CHART_COLORS.cyan,
    }],
  };
  const options = { maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } };
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-indigo-700">{t('example.label')}</p>
      <div className="h-52 w-full">
        {kind === 'week' && <Line data={data} options={options} aria-hidden="true" />}
        {kind === 'performance' && <Bar data={data} options={options} aria-hidden="true" />}
        {kind === 'traffic' && <Pie data={data} options={{ maintainAspectRatio: false }} aria-hidden="true" />}
      </div>
      <ul className={kind === 'traffic' ? 'mt-3 space-y-1 text-sm text-gray-600' : 'sr-only'}>
        {labels.map((label, index) => <li key={label}>{label}: {format.number(values[index])}{kind === 'traffic' ? '%' : ''}</li>)}
      </ul>
    </div>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-gray-500">{t('subtitle')}</p>
        </header>
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <h2 className="font-semibold text-gray-900">{t('example.title')}</h2>
          <p className="mt-1 text-sm text-gray-700">{t(`example.${audience}`)}</p>
          <Link href={cta.href} className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{cta.label}</Link>
          {audience === 'setup' && <Link href={ROUTES.HOME} className="ml-4 inline-flex rounded-lg px-2 py-2 font-medium text-indigo-700 underline focus-visible:outline-2 focus-visible:outline-indigo-600">{t('button.newLink')}</Link>}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section aria-label={t('example.label')}>
              <p className="mb-2 text-sm font-medium text-indigo-700">{t('example.label')}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Kpi emphasized title={t('panel.totalLinks.title')} value={format.number(3)} />
                <Kpi title={t('panel.totalClicks.title')} value={format.number(118)} />
                <Kpi title={t('panel.clicksLast24h.title')} value={format.number(11)} />
                <Kpi title={t('panel.topCountry.title')} value="CL" />
              </div>
            </section>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <section className="rounded-xl border border-gray-200 bg-surface p-4">
                <h2 className="mb-3 text-lg font-semibold">{t('panel.weekActivity.title')}</h2>
                <ExampleChart kind="week" />
              </section>
              <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h2 className="mb-3 text-lg font-semibold">{t('panel.performancePerLink.title')}</h2>
                <ExampleChart kind="performance" />
              </section>
            </div>
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-surface">
              <div className="border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold">{t('table.links.title')}</h2>
                <p className="mt-1 text-sm font-medium text-indigo-700">{t('example.label')}</p>
              </div>
              <ul className="divide-y divide-gray-200">
                {['ejemplo-a', 'ejemplo-b', 'ejemplo-c'].map((slug, index) => (
                  <li key={slug} className="flex flex-wrap justify-between gap-2 p-4 text-sm">
                    <span className="font-medium">iny.one/{slug}</span>
                    <span className="text-gray-600">{t('table.links.headers.clicks')}: {format.number([62, 35, 21][index])}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <aside>
            <section className="rounded-xl border border-gray-200 bg-surface p-4">
              <h2 className="mb-3 text-lg font-semibold">{t('panel.sourceTraffic.title')}</h2>
              <ExampleChart kind="traffic" />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
