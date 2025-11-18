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
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import LinkDetailModal from "@/features/dashboard/components/LinkDetailModal";
import { IAlert, ILinkStats, UserUrl, UserUrlStats } from "@/features/dashboard/types/types";
import KPI from "@/features/dashboard/components/KPI";
import LinksTable from "@/features/dashboard/components/LinksTable";
import Alerts from "@/features/dashboard/components/Alerts";
import { calcUserStats } from "@/features/dashboard/helpers/stats";

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

// Mock data — reemplaza por tus datos reales o llamadas a la API
const MOCK_OVERVIEW = {
  totalLinks: 42,
  totalClicks: 1280,
  clicksLast24h: 120,
  topLink: "/promo",
  topCountry: "Chile",
  avgCTR: "12.4%",
};

const MOCK_CLICKS_BY_DAY = {
  labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  datasets: [
    {
      label: "Clicks",
      data: [120, 90, 150, 80, 200, 300, 340],
      fill: true,
    },
  ],
};

const MOCK_LINKS = [
  { id: 1, alias: "promo", dest: "https://site.com/promo", clicks: 470, ctr: "18%", created: "2025-10-01", countryTop: "CL", deviceTop: "Mobile" },
  { id: 2, alias: "blog", dest: "https://site.com/blog", clicks: 230, ctr: "9%", created: "2025-09-12", countryTop: "AR", deviceTop: "Desktop" },
  { id: 3, alias: "video", dest: "https://yt.be/abcd", clicks: 180, ctr: "6%", created: "2025-08-22", countryTop: "CL", deviceTop: "Mobile" },
  { id: 4, alias: "sale", dest: "https://shop.com/sale", clicks: 400, ctr: "14%", created: "2025-11-01", countryTop: "US", deviceTop: "Desktop" },
];

const MOCK_TRAFFIC_SOURCES = {
  labels: ["Directo", "Google", "Facebook", "Instagram", "Otros"],
  datasets: [
    {
      data: [45, 25, 15, 10, 5],
    },
  ],
};

export function UserDashboard(props: Props) {
  const [selectedLink, setSelectedLink] = useState<UserUrlStats|null>(null);

  const { urls } = props;

  const {
    general,
    stats,
    links
  } = calcUserStats(urls, props.stats);

  const alerts: IAlert[] = useMemo(() => [
    { id: 1, title: "Enlace /promo tuvo +200 clics en 24h", message: "Revisa la campaña vinculada a /promo — posiblemente necesita más presupuesto." },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Panel de control</h1>
            <p className="text-sm text-gray-500">Resumen y estadísticas de tus short links</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white px-4 py-2 rounded shadow-sm">Crear link</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded">Exportar CSV</button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main column */}
          <section className="lg:col-span-2 space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KPI title="Total enlaces" value={general.totalLinks} />
              <KPI title="Total clicks" value={general.totalClicks} />
              <KPI title="Clicks últimas 24h" value={general.clicksLast24h} />
              {/*<KPI title="CTR promedio" value={MOCK_OVERVIEW.avgCTR} />*/}
              <KPI title="Top País" value={general.topCountry} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Actividad semanal</h3>
                  <div className="text-sm text-gray-500">Última semana</div>
                </div>
                <div className="h-52 w-full">
                  <Line data={MOCK_CLICKS_BY_DAY} options={{ maintainAspectRatio: false }} />
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
                <Pie data={MOCK_TRAFFIC_SOURCES} options={{ maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Tendencias</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>Enlace <strong>/sale</strong> subió 30% en la última semana</li>
                <li>Peak de tráfico: 18:00 - 20:00</li>
                <li>Día más activo: Sábado</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Alertas</h3>
              <Alerts alerts={alerts} />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Acciones rápidas</h3>
              <div className="flex flex-col gap-2">
                <button className="py-2 px-3 bg-gray-100 rounded text-sm">Editar alias</button>
                <button className="py-2 px-3 bg-gray-100 rounded text-sm">Activar/desactivar link</button>
                <button className="py-2 px-3 bg-gray-100 rounded text-sm">Ver logs</button>
              </div>
            </div>
          </aside>
        </main>

      </div>

      <LinkDetailModal link={selectedLink} onClose={() => setSelectedLink(null)} />
    </div>
  );
}

interface Props {
  urls: UserUrl[];
  stats: ILinkStats[]
}
