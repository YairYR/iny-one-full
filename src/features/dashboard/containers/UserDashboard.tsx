'use client';

import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  Filler
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  ILinkDateStats,
  ILinkStats, IRefererStat,
  UserUrl,
} from "@/features/dashboard/types/types";
import { Kpi, LinksTable, LinkDetailModal, ILinkDetails } from "@/features/dashboard/components";
import { calcUserStats } from "@/features/dashboard/helpers/stats";
import { useTranslations } from "next-intl";
import Link from "next/link";
import InfoPopover from "@/components/Popover/InfoPopover";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  Filler
);

export function UserDashboard(props: Readonly<Props>) {
  const t = useTranslations('DashboardPage');
  const [modal, setModal] = useState<ILinkDetails>({
    title: '',
    open: false,
    mode: null,
    link: null,
  });

  const { urls, clicksLast24h } = props;

  const {
    general,
    stats,
    links,
    week,
    traffic: trafficSources,
  } = useMemo(() => calcUserStats(urls, props.stats, props.weekStats, props.refererStats), []);
  const traffic = Object.values(trafficSources);

  const clicks_week = {
    labels: week.daysKey.map((key) => t(key as never)),
    datasets: [
      {
        label: "Clicks",
        data: week.clicks,
        fill: true,
      },
    ],
  };

  const infoUTC = [
    t("popover.info.utc.0"),
    t("popover.info.utc.1"),
    <Link
      key={'utc-link-ref'}
      target="_blank"
      href={'https://en.wikipedia.org/wiki/Coordinated_Universal_Time'}
      className="relative inline-block text-blue-700 cursor-pointer"
    >Wikipedia</Link>
  ];

  const onClickEdit = (link: UserUrl) => {
    const alias = link.alias ?? `/${link.slug}`;
    setModal({
      title: t('modal.edit.title', { alias }),
      open: true,
      mode: 'edit',
      link: link
    });
  }

  const onClickStats = (link: UserUrl) => {
    const alias = link.alias ?? `/${link.slug}`;
    setModal({
      title: t("modal.stats.title", { alias }),
      open: true,
      mode: 'stats',
      link: link,
    });
  }

  const onCloseModal = () => {
    setModal({
      title: '',
      open: false,
      mode: null,
      link: null,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="bg-white px-4 py-2 rounded shadow-sm cursor-pointer">{t("button.newLink")}</Link>
            {/*<button className="bg-indigo-600 text-white px-4 py-2 rounded">Exportar CSV</button>*/}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main column */}
          <section className="lg:col-span-2 space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Kpi title={t("panel.totalLinks.title")} value={general.totalLinks} />
              <Kpi title={t("panel.totalClicks.title")} value={general.totalClicks} />
              <Kpi title={t("panel.clicksLast24h.title")} value={clicksLast24h ?? '-'} />
              <Kpi title={t("panel.topCountry.title")} value={general.topCountry} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    {t("panel.weekActivity.title")}{" "}
                    <InfoPopover keys={'panel-week-activity'} messages={infoUTC} anchor="bottom start" />
                  </h3>
                  <div className="text-sm text-gray-500">{t("panel.weekActivity.subtitle")}</div>
                </div>
                <div className="h-52 w-full">
                  <Line data={clicks_week} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{t("panel.performancePerLink.title")}</h3>
                  <div className="text-sm text-gray-500">{t("panel.performancePerLink.subtitle", { top: 4 })}</div>
                </div>
                <div className="h-52 w-full">
                  <Bar
                    data={{
                      labels: stats.map(l => l.slug),
                      datasets: [{ label: 'Clicks', data: stats.map(l => l.total_clicks) }] }}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>

            {/* Links table */}
            <LinksTable
              t={t}
              links={links}
              onOpen={onClickStats}
              onEdit={onClickEdit}
            />
          </section>

          {/* Right / Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">{t("panel.sourceTraffic.title")}</h3>
              <div className="h-44 w-full">
                <Pie data={{
                  labels: traffic.map((item) => item.name),
                  datasets: [ { label: '%', data: traffic.map((item) => item.value) }]
                }} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            {/*<div className="bg-white p-4 rounded-xl shadow-sm">*/}
            {/*  <h3 className="text-lg font-semibold mb-3">Tendencias</h3>*/}
            {/*  <ul className="text-sm text-gray-700 space-y-2">*/}
            {/*    <li>Enlace <strong>/sale</strong> subió 30% en la última semana</li>*/}
            {/*    <li>Peak de tráfico: 18:00 - 20:00</li>*/}
            {/*    <li>Día más activo: Sábado</li>*/}
            {/*  </ul>*/}
            {/*</div>*/}

            {/*<div className="bg-white p-4 rounded-xl shadow-sm">*/}
            {/*  <h3 className="text-lg font-semibold mb-3">Alertas</h3>*/}
            {/*  <Alerts alerts={alerts} />*/}
            {/*</div>*/}

            {/*<div className="bg-white p-4 rounded-xl shadow-sm">*/}
            {/*  <h3 className="text-lg font-semibold mb-3">Acciones rápidas</h3>*/}
            {/*  <div className="flex flex-col gap-2">*/}
            {/*    <button className="py-2 px-3 bg-gray-100 rounded text-sm">Editar alias</button>*/}
            {/*    <button className="py-2 px-3 bg-gray-100 rounded text-sm">Activar/desactivar link</button>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </aside>
        </main>

      </div>

      <LinkDetailModal modal={modal} onClose={onCloseModal} />
    </div>
  );
}

interface Props {
  urls: UserUrl[];
  stats: ILinkStats[];
  refererStats?: IRefererStat[];
  clicksLast24h?: number|null;
  weekStats: {
    stats: ILinkDateStats[];
    start: Date;
    end: Date;
    totalDays: number;
  }
}
