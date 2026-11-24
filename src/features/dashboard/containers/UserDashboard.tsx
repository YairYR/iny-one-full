'use client';

import React from "react";
import dynamic from "next/dynamic";
import { Kpi, LinkDetailModal, LinksTable } from "@/features/dashboard/components";
import Link from "@/components/LocalizedLink";
import { ROUTES } from "@/lib/routes";
import InfoPopover from "@/components/Popover/InfoPopover";
import { useUserDashboard } from "@/features/dashboard/hooks/useUserDashboard";
import { useFormatter } from "next-intl";
import { DashboardExample, ExampleChart, TrafficList } from "@/features/dashboard/components/DashboardExample";
import { DASHBOARD_CHART_HEIGHT, DashboardCard } from "@/features/dashboard/components/DashboardCard";

const ChartSkeleton = () => (
  <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />
);
const Line = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Line), { ssr: false, loading: ChartSkeleton });
const Bar = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Bar), { ssr: false, loading: ChartSkeleton });
const Pie = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Pie), { ssr: false, loading: ChartSkeleton });

export function UserDashboard({ canViewSensitiveStats = false, canEditLinks = false, canViewStats = false }: Readonly<{
  canViewSensitiveStats?: boolean;
  canEditLinks?: boolean;
  canViewStats?: boolean;
}>) {
  const {
    t, stats, kpis, insights, linksRequest, countChartOptions, page, pageSize, totalPages, setPage, setPageSize,
    clicks_week, top_by_clicks, clicks_top, graffic_traffic, traffic, modal,
    onClickEdit, onClickStats, onClickQr, onCloseModal,
  } = useUserDashboard();
  const format = useFormatter();
  // Una sola serie, ya nombrada por el título de la tarjeta: la leyenda sólo resta alto.
  const chartOptions = { ...countChartOptions, plugins: { legend: { display: false } } };
  const number = (value: number | undefined) => value === undefined ? t('noData') : format.number(value);
  const trafficName = (name: string) => name === 'Direct' ? t('traffic.direct') : name === 'Others' ? t('traffic.other') : name;
  const isEmpty = linksRequest.data?.pagination.total === 0 && kpis.data && insights.data
    && !linksRequest.error && !kpis.error && !insights.error;

  const status = (request: { error: unknown; isLoading: boolean; data: unknown; mutate: () => Promise<unknown> }) => (
    <>
      {request.error ? (
        <div role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <p>{request.data ? t('refreshError') : t('sectionError')}</p>
          <button type="button" className="mt-2 underline focus-visible:outline-2 focus-visible:outline-indigo-600" onClick={() => void request.mutate()}>{t('retry')}</button>
        </div>
      ) : request.isLoading && !request.data ? <p role="status" className="p-4 text-sm text-gray-500">{t('loading')}</p> : null}
    </>
  );

  if (isEmpty) return <DashboardExample audience="empty" />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('subtitle')}</p>
          </div>
          <Link prefetch={false} href={ROUTES.HOME} className="inline-flex justify-center rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{t("button.newLink")}</Link>
        </header>

        <div>
          {status(kpis)}
          {kpis.data && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi emphasized title={t("panel.totalLinks.title")} value={number(stats.general.totalLinks)} />
            <Kpi title={t("panel.totalClicks.title")} value={number(stats.general.totalClicks)} />
            <Kpi title={t("panel.clicksLast24h.title")} value={number(stats.general.clicksLast24h)} />
            <Kpi title={t("panel.topCountry.title")} value={stats.general.topCountry ?? t('noData')} />
          </div>}
        </div>

        {/* Tres gráficos en una fila en escritorio; la tabla va a todo el ancho para mostrar más columnas. */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <DashboardCard
            title={<>
              {t("panel.weekActivity.title")}{" "}
              <InfoPopover anchor="bottom start" label={t('popover.utcLabel')}>
                <p>{t("popover.info.utc.0")}</p><p>{t("popover.info.utc.1")}</p>
                <Link target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Coordinated_Universal_Time" className="text-indigo-600 underline hover:text-indigo-700">Wikipedia</Link>
              </InfoPopover>
            </>}
            subtitle={t("panel.weekActivity.subtitle")}>
            {kpis.data && !kpis.error && stats.week?.clicks.every((clicks) => clicks === 0) ? <>
              <p className="mb-2 text-sm text-gray-500">{t('example.noActivity')}</p>
              <ExampleChart kind="week" />
            </> : kpis.data ? <>
              <div className={`${DASHBOARD_CHART_HEIGHT} w-full`}><Line data={clicks_week} options={chartOptions} aria-hidden="true" /></div>
              <ul className="sr-only">{stats.week?.days.map((day, i) => <li key={day}>{day}: {number(stats.week?.clicks[i])}</li>)}</ul>
            </> : <p className="text-sm text-gray-500">{kpis.error ? t('sectionError') : t('loading')}</p>}
          </DashboardCard>

          <DashboardCard tone="subtle" title={t("panel.performancePerLink.title")} subtitle={t("panel.performancePerLink.subtitle", { top: top_by_clicks })}>
            {status(insights)}
            {insights.data && (!insights.error && stats.topLinks.every((link) => link.clicks === 0) ? <>
              <p className="mb-2 text-sm text-gray-500">{stats.topLinks.length ? t('example.noLinkActivity') : t('noLinksChart')}</p>
              <ExampleChart kind="performance" />
            </> : stats.topLinks.length ? <>
              <div className={`${DASHBOARD_CHART_HEIGHT} w-full`}><Bar data={clicks_top} options={chartOptions} aria-hidden="true" /></div>
              <ul className="sr-only">{stats.topLinks.slice(0, top_by_clicks).map((link) => <li key={link.slug}>{link.slug}: {number(link.clicks)}</li>)}</ul>
            </> : null)}
          </DashboardCard>

          <DashboardCard title={t("panel.sourceTraffic.title")} className="md:col-span-2 xl:col-span-1">
            {status(insights)}
            {insights.data && (graffic_traffic ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:flex-col xl:items-stretch">
                <div className="h-40 sm:w-1/2 xl:w-full lg:h-[clamp(8rem,17dvh,11rem)]"><Pie data={{ ...graffic_traffic, labels: traffic.map((item) => trafficName(item.name)) }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} aria-hidden="true" /></div>
                <TrafficList items={traffic.map((item) => ({ label: trafficName(item.name), value: item.value }))} format={format.number} />
              </div>
            ) : !insights.error && <>
              <p className="mb-2 text-sm text-gray-500">{t('noTraffic')}</p>
              <ExampleChart kind="traffic" />
            </>)}
          </DashboardCard>
        </div>

        <div>
          {linksRequest.error && status(linksRequest)}
          <LinksTable links={stats.links} total={stats.pagination?.total ?? 0}
            isLoading={Boolean(linksRequest.isLoading)}
            page={page} totalPages={totalPages} onPageChange={setPage}
            pageSize={pageSize} onPageSizeChange={setPageSize}
            onOpen={onClickStats} onEdit={onClickEdit} onQr={onClickQr}
            permissions={{ canEdit: canEditLinks, canViewStats }} />
        </div>
      </div>
      <LinkDetailModal modal={modal} onClose={onCloseModal} canViewSensitiveStats={canViewSensitiveStats} />
    </div>
  );
}
