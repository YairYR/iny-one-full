'use client';

import React, { useState } from "react";
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
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import LinkDetailModal from "@/features/dashboard/components/LinkDetailModal";
import {
  IAlert,
  ILinkDateStats,
  ILinkStats, IRefererStat,
  UserUrl,
  UserUrlStats
} from "@/features/dashboard/types/types";
import Kpi from "@/features/dashboard/components/Kpi";
import LinksTable from "@/features/dashboard/components/LinksTable";
import Alerts from "@/features/dashboard/components/Alerts";
import { calcUserStats } from "@/features/dashboard/helpers/stats";
import { useTranslations } from "next-intl";

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
);

export function UserDashboard(props: Readonly<Props>) {
  const t = useTranslations('DashboardPage');
  const [selectedLink, setSelectedLink] = useState<UserUrlStats|undefined>();

  const { urls, clicksLast24h } = props;

  const {
    general,
    stats,
    links,
    week,
    traffic: trafficSources,
  } = calcUserStats(urls, props.stats, props.weekStats, props.refererStats);
  const traffic = Object.values(trafficSources);

  const clicks_week = {
    labels: [
      t('week.monday'),
      t('week.tuesday'),
      t('week.wednesday'),
      t('week.thursday'),
      t('week.friday'),
      t('week.saturday'),
      t('week.sunday')
    ],
    datasets: [
      {
        label: "Clicks",
        data: week.clicks,
        fill: true,
      },
    ],
  };

  // const alerts: IAlert[] = useMemo(() => [
  //   { id: 1, title: "Enlace /promo tuvo +200 clics en 24h", message: "Revisa la campaña vinculada a /promo — posiblemente necesita más presupuesto." },
  // ], []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white px-4 py-2 rounded shadow-sm">Crear link</button>
            {/*<button className="bg-indigo-600 text-white px-4 py-2 rounded">Exportar CSV</button>*/}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main column */}
          <section className="lg:col-span-2 space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Kpi title="Total enlaces" value={general.totalLinks} />
              <Kpi title="Total clicks" value={general.totalClicks} />
              <Kpi title="Clicks últimas 24h" value={clicksLast24h ?? '-'} />
              <Kpi title="Top País" value={general.topCountry} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Actividad semanal</h3>
                  <div className="text-sm text-gray-500">Última semana</div>
                </div>
                <div className="h-52 w-full">
                  <Line data={clicks_week} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Rendimiento por enlace</h3>
                  <div className="text-sm text-gray-500">Top 4</div>
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
            <LinksTable links={links} onOpen={(l) => setSelectedLink(l)} />
          </section>

          {/* Right / Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Fuentes de tráfico</h3>
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

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Acciones rápidas</h3>
              <div className="flex flex-col gap-2">
                <button className="py-2 px-3 bg-gray-100 rounded text-sm">Editar alias</button>
                <button className="py-2 px-3 bg-gray-100 rounded text-sm">Activar/desactivar link</button>
              </div>
            </div>
          </aside>
        </main>

      </div>

      <LinkDetailModal link={selectedLink} onClose={() => setSelectedLink(undefined)} />
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
