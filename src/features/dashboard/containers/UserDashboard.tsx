'use client';

import React from "react";
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
import { Kpi, LinksTable, LinkDetailModal } from "@/features/dashboard/components";
import Link from "next/link";
import InfoPopover from "@/components/Popover/InfoPopover";
import { useUserDashboard } from "@/features/dashboard/hooks/useUserDashboard";

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

export function UserDashboard() {
  const {
    t,
    stats,
    clicks_week,
    top_by_clicks,
    clicks_top,
    graffic_traffic,
    infoUTC,
    modal,
    onClickEdit,
    onClickStats,
    onCloseModal,
  } = useUserDashboard();

  const { general, links } = stats || {};

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
              <Kpi title={t("panel.totalLinks.title")} value={general?.totalLinks ?? ''} />
              <Kpi title={t("panel.totalClicks.title")} value={general?.totalClicks ?? ''} />
              <Kpi title={t("panel.clicksLast24h.title")} value={stats?.general.clicksLast24h ?? '-'} />
              <Kpi title={t("panel.topCountry.title")} value={general?.topCountry ?? ''} />
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
                  <div className="text-sm text-gray-500">{t("panel.performancePerLink.subtitle", { top: top_by_clicks })}</div>
                </div>
                <div className="h-52 w-full">
                  <Bar
                    data={clicks_top}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>

            {/* Links table */}
            <LinksTable
              t={t}
              links={links ?? []}
              onOpen={onClickStats}
              onEdit={onClickEdit}
            />
          </section>

          {/* Right / Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">{t("panel.sourceTraffic.title")}</h3>
              <div className="h-44 w-full">
                {graffic_traffic && <Pie data={graffic_traffic} options={{ maintainAspectRatio: false }}/>}
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
