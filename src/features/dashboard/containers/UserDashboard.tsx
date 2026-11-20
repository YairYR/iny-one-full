'use client';

import React from "react";
import dynamic from "next/dynamic";
import { Kpi, LinkDetailModal, LinksTable } from "@/features/dashboard/components";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import InfoPopover from "@/components/Popover/InfoPopover";
import { useUserDashboard } from "@/features/dashboard/hooks/useUserDashboard";
import { useFormatter } from "next-intl";

const ChartSkeleton = () => (
  <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />
);
const Line = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Line), { ssr: false, loading: ChartSkeleton });
const Bar = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Bar), { ssr: false, loading: ChartSkeleton });
const Pie = dynamic(() => import("@/features/dashboard/components/charts").then((m) => m.Pie), { ssr: false, loading: ChartSkeleton });

export function UserDashboard() {
  const {
    t, stats, kpis, insights, linksRequest, countChartOptions, page, totalPages, setPage,
    clicks_week, top_by_clicks, clicks_top, graffic_traffic, traffic, modal,
    onClickEdit, onClickStats, onClickQr, onCloseModal,
  } = useUserDashboard();
  const format = useFormatter();
  const number = (value: number | undefined) => value === undefined ? t('noData') : format.number(value);
  const trafficName = (name: string) => name === 'Direct' ? t('traffic.direct') : name === 'Others' ? t('traffic.other') : name;

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('subtitle')}</p>
          </div>
          <Link prefetch={false} href={ROUTES.HOME} className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{t("button.newLink")}</Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div>
              {status(kpis)}
              {kpis.data && <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Kpi title={t("panel.totalLinks.title")} value={number(stats.general.totalLinks)} />
                <Kpi title={t("panel.totalClicks.title")} value={number(stats.general.totalClicks)} />
                <Kpi title={t("panel.clicksLast24h.title")} value={number(stats.general.clicksLast24h)} />
                <Kpi title={t("panel.topCountry.title")} value={stats.general.topCountry ?? t('noData')} />
              </div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-lg font-semibold">
                    {t("panel.weekActivity.title")}{" "}
                    <InfoPopover anchor="bottom start" label={t('popover.utcLabel')}>
                      <p>{t("popover.info.utc.0")}</p><p>{t("popover.info.utc.1")}</p>
                      <Link target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Coordinated_Universal_Time" className="text-blue-700 underline">Wikipedia</Link>
                    </InfoPopover>
                  </h2>
                  <span className="text-sm text-gray-500">{t("panel.weekActivity.subtitle")}</span>
                </div>
                {kpis.data ? <>
                  <div className="h-52 w-full"><Line data={clicks_week} options={countChartOptions} aria-hidden="true" /></div>
                  <ul className="sr-only">{stats.week?.days.map((day, i) => <li key={day}>{day}: {number(stats.week?.clicks[i])}</li>)}</ul>
                </> : <p className="text-sm text-gray-500">{kpis.error ? t('sectionError') : t('loading')}</p>}
              </section>

              <section className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h2 className="text-lg font-semibold">{t("panel.performancePerLink.title")}</h2>
                  <span className="text-sm text-gray-500">{t("panel.performancePerLink.subtitle", { top: top_by_clicks })}</span>
                </div>
                {status(insights)}
                {insights.data && (stats.topLinks.length ? <>
                  <div className="h-52 w-full"><Bar data={clicks_top} options={countChartOptions} aria-hidden="true" /></div>
                  <ul className="sr-only">{stats.topLinks.slice(0, top_by_clicks).map((link) => <li key={link.slug}>{link.slug}: {number(link.clicks)}</li>)}</ul>
                  <p className="mt-3 text-xs text-gray-500">{t('table.links.clicksNote')}</p>
                </> : <p className="text-sm text-gray-500">{t('noLinksChart')}</p>)}
              </section>
            </div>

            <div>
              {status(linksRequest)}
              {linksRequest.data && <LinksTable links={stats.links} total={stats.pagination?.total ?? 0}
                page={page} totalPages={totalPages} onPageChange={setPage}
                onOpen={onClickStats} onEdit={onClickEdit} onQr={onClickQr} />}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-3">{t("panel.sourceTraffic.title")}</h2>
              {status(insights)}
              {insights.data && (graffic_traffic ? <>
                <div className="h-44 w-full"><Pie data={{ ...graffic_traffic, labels: traffic.map((item) => trafficName(item.name)) }} options={{ maintainAspectRatio: false }} aria-hidden="true" /></div>
                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  {traffic.map((item) => <li key={item.name} className="flex justify-between gap-2"><span>{trafficName(item.name)}</span><span>{format.number(item.value)}%</span></li>)}
                </ul>
              </> : <p className="text-sm text-gray-500">{t('noTraffic')}</p>)}
            </section>
          </aside>
        </div>
      </div>
      <LinkDetailModal modal={modal} onClose={onCloseModal} />
    </div>
  );
}
