import { useMemo, useState } from "react";
import { useStatsCommon } from "@/features/dashboard/hooks/useStatsCommon";
import { ILinkDetails } from "@/features/dashboard/components";
import { useTranslations } from "next-intl";
import { UserUrl } from "@/features/dashboard/types/types";
import { calcRefererStats, fillDays } from "@/features/dashboard/helpers/stats";
import dayjs from "dayjs";
import { DASHBOARD_CATEGORY_COLORS, DASHBOARD_CHART_COLORS } from "@/features/dashboard/helpers/chart-palette";

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
  const [pageSize, setPageSizeState] = useState(20);
  const { kpis, insights, links } = useStatsCommon(page, pageSize);
  // Al cambiar el tamaño, la página actual deja de corresponder a las mismas filas.
  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  const stats = useMemo(() => ({
    general: {
      totalLinks: kpis.data?.summary.total_links,
      totalClicks: kpis.data?.summary.total_clicks,
      clicksLast24h: kpis.data?.summary.last_clicks,
      topCountry: kpis.data?.summary.top_country?.[0].name ?? t('noData'),
    },
    links: links.data?.urls ?? [],
    pagination: links.data?.pagination,
    topLinks: insights.data?.summary.performance ?? [],
    traffic: insights.data ? calcRefererStats(insights.data.summary.traffic) : {},
    week: kpis.data ? fillDays(kpis.data.summary.week, {
      startDate: dayjs(kpis.data.range.date_start).utc(),
      endDate: dayjs(kpis.data.range.date_end).utc(),
    }) : undefined,
  }), [kpis.data, insights.data, links.data, t]);

  const traffic = Object.values(stats?.traffic ?? {});

  console.log()

  const clicks_week = {
    labels: stats.week?.daysKey.map((key) => t(key as never)),
    datasets: [
      {
        label: t('table.links.headers.clicks'),
        data: stats.week?.clicks,
        fill: true,
        borderColor: DASHBOARD_CHART_COLORS.indigo,
        backgroundColor: DASHBOARD_CHART_COLORS.indigoFill,
      },
    ],
  };

  const top_by_clicks = 4;
  const sortedByClicks = stats?.topLinks.slice(0, top_by_clicks) ?? [];
  const clicks_top = {
    labels: sortedByClicks.map(l => l.slug),
    datasets: [{ label: t('table.links.headers.clicks'), data: sortedByClicks.map(l => l.clicks), backgroundColor: sortedByClicks.map((_, index) => DASHBOARD_CATEGORY_COLORS[index % DASHBOARD_CATEGORY_COLORS.length]) }]
  };

  const pagination = stats?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  const graffic_traffic = traffic.length > 0 && {
    labels: traffic.map((item) => item.name),
    datasets: [ { label: '%', data: traffic.map((item) => item.value), backgroundColor: traffic.map((_, index) => DASHBOARD_CATEGORY_COLORS[index % DASHBOARD_CATEGORY_COLORS.length]) }]
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
    kpis,
    insights,
    linksRequest: links,
    countChartOptions,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
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