import { useMemo, useState } from "react";
import { useStatsCommon } from "@/features/dashboard/hooks/useStatsCommon";
import { ILinkDetails } from "@/features/dashboard/components";
import { useTranslations } from "next-intl";
import { UserUrl } from "@/features/dashboard/types/types";
import { calcUserStats } from "@/features/dashboard/helpers/stats";

export const useUserDashboard = () => {
  const t = useTranslations('DashboardPage');
  const [modal, setModal] = useState<ILinkDetails>({
    title: '',
    open: false,
    mode: null,
    link: null,
  });

  const [page, setPage] = useState(1);
  const { data } = useStatsCommon(page);

  const stats = useMemo(() => (data ? calcUserStats(data) : null), [data]);

  const traffic = Object.values(stats?.traffic ?? {});

  const clicks_week = {
    labels: stats?.week.daysKey.map((key) => t(key as never)),
    datasets: [
      {
        label: "Clicks",
        data: stats?.week.clicks,
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