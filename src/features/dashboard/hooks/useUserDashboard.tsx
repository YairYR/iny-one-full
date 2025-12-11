import { useMemo, useState } from "react";
import { useStatsCommon } from "@/features/dashboard/hooks/useStatsCommon";
import { ILinkDetails } from "@/features/dashboard/components";
import { useTranslations } from "next-intl";
import Link from "next/link";
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

  const { data } = useStatsCommon();

  const stats = useMemo(() => {
    if(!data) return null;
    console.log("Calculating user stats...", data.urls);
    return calcUserStats(data.urls, data.stats, data.weekStats, data.refererStats);
  }, [data]);

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
  const sortedByClicks = stats?.statsByClicks.slice(0, top_by_clicks);
  const clicks_top = {
    labels: sortedByClicks?.map(l => l.slug) ?? [],
    datasets: [{ label: 'Clicks', data: sortedByClicks?.map(l => l.total_clicks) }]
  };

  const graffic_traffic = traffic.length > 0 && {
    labels: traffic.map((item) => item.name),
    datasets: [ { label: '%', data: traffic.map((item) => item.value) }]
  };

  const infoUTC = [
    t("popover.info.utc.0"),
    t("popover.info.utc.1"),
    <Link
      key={'utc-link-ref'}
      target="_blank"
      href={'https://en.wikipedia.org/wiki/Coordinated_Universal_Time'}
      className="relative inline-block text-blue-700 cursor-pointer">Wikipedia</Link>
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

  return {
    t,
    stats,
    traffic,
    clicks_week,
    top_by_clicks,
    clicks_top,
    graffic_traffic,
    infoUTC,
    modal,
    onClickEdit,
    onClickStats,
    onCloseModal,
  }
}