import { useMemo, useState } from "react";
import { useStatsCommon } from "@/features/dashboard/hooks/useStatsCommon";
import { ILinkDetails } from "@/features/dashboard/components";
import { useTranslations } from "next-intl";
import { UserUrl } from "@/features/dashboard/types/types";
import { calcRefererStats, fillDays, NO_DATA } from "@/features/dashboard/helpers/stats";
import dayjs from "dayjs";

/**
 * Opciones comunes de los gráficos de clics. Los clics son enteros no negativos:
 * sin `beginAtZero` Chart.js dibuja el eje de -1 a 1 cuando todos los valores
 * son cero, y sin `precision: 0` marca decimales como "0,5 clics".
 *
 * Se define aquí y no en components/charts para no importar ese módulo de forma
 * estática: se carga con next/dynamic justo para mantener chart.js fuera del
 * bundle inicial.
 */
const countChartOptions = {
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 4,
      ticks: { precision: 0 },
    },
  },
};

export const useUserDashboard = () => {
  const t = useTranslations('DashboardPage');
  const [modal, setModal] = useState<ILinkDetails>({
    title: '',
    open: false,
    mode: null,
    link: null,
  });

  const [page, setPage] = useState(1);
  const { kpis, insights, links } = useStatsCommon(page);

  const stats = useMemo(() => ({
    general: {
      totalLinks: kpis.data?.totalLinks,
      totalClicks: kpis.data?.all_time.clicks,
      clicksLast24h: kpis.data ? kpis.data.summary.clicks_last_24h || NO_DATA : undefined,
      topCountry: kpis.data?.all_time.top_countries?.[0]?.name ?? NO_DATA,
    },
    links: links.data?.urls ?? [],
    pagination: links.data?.pagination,
    topLinks: insights.data?.topLinks ?? [],
    traffic: insights.data ? calcRefererStats(insights.data.refererStats) : {},
    week: kpis.data ? fillDays(kpis.data.summary.stats, {
      startDate: dayjs(kpis.data.summary.date_start).utc(),
      endDate: dayjs(kpis.data.summary.date_end).utc(),
    }) : undefined,
  }), [kpis.data, insights.data, links.data]);

  const traffic = Object.values(stats?.traffic ?? {});

  const clicks_week = {
    labels: stats.week?.daysKey.map((key) => t(key as never)),
    datasets: [
      {
        label: "Clicks",
        data: stats.week?.clicks,
        fill: true,
      },
    ],
  };

  const top_by_clicks = 4;
  const sortedByClicks = stats?.topLinks.slice(0, top_by_clicks) ?? [];
  const clicks_top = {
    labels: sortedByClicks.map(l => l.slug),
    datasets: [{ label: 'Clicks', data: sortedByClicks.map(l => l.clicks) }]
  };

  const pagination = stats?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  const graffic_traffic = traffic.length > 0 && {
    labels: traffic.map((item) => item.name),
    datasets: [ { label: '%', data: traffic.map((item) => item.value) }]
  };

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

  const onClickQr = (link: UserUrl) => {
    const alias = link.alias ?? `/${link.slug}`;
    setModal({
      title: t('modal.qr.title', { alias }),
      open: true,
      mode: 'qr',
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

  return {
    t,
    stats,
    hasError: Boolean(kpis.error || insights.error || links.error),
    countChartOptions,
    page,
    totalPages,
    setPage,
    traffic,
    clicks_week,
    top_by_clicks,
    clicks_top,
    graffic_traffic,
    modal,
    onClickEdit,
    onClickStats,
    onClickQr,
    onCloseModal,
  }
}