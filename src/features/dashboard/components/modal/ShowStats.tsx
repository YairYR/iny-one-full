import { UserUrlStats } from "@/features/dashboard/types/types";
import dynamic from "next/dynamic";
import { useLinkStatsCommon } from "@/features/dashboard/hooks/useLinkStatsCommon";
import { useMemo } from "react";
import dayjs from "dayjs";
import { dayToName } from "@/features/dashboard/helpers/stats";
import { SkeletonRectangle } from "@/components/Skeleton/Skeleton";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const Bar = dynamic(
  () => import("@/features/dashboard/components/charts").then((m) => m.Bar),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />
    ),
  }
);

interface Props {
  link: UserUrlStats;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  onClose: () => void;
}

export default function ShowStats({ link, t }: Readonly<Props>) {
  const { data, isLoading, error, mutate } = useLinkStatsCommon(link.link_id);

  const countryTop = data?.breakdown?.by_country?.[0]?.country_code ?? t('noData');
  const deviceTop = data?.breakdown?.by_device?.[0]?.device_type ?? t('noData');

  const clicks = useMemo(() => {
    const values = {
      labels: [] as string[],
      datasets:[{ label: t('table.links.headers.clicks'), data: [] as number[], backgroundColor: '#4F46E5' }],
    };

    if (!data) {
      return values;
    }

    let current_day = dayjs().utc();
    for (let i = 0; i < 7; i++) {
      const label = t(dayToName(current_day.day()));
      const value = data.stats.find(d => d.date == current_day.toISOString().split('T')[0])?.total_clicks ?? 0;

      values.labels.unshift(label);
      values.datasets[0].data.unshift(value);
      current_day = current_day.subtract(1, 'day');
    }

    return values;
  }, [data, t]);

  return (
    <>
      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <p>{t('sectionError')}</p>
          <button type="button" className="mt-2 underline focus-visible:outline-2 focus-visible:outline-indigo-600" onClick={() => void mutate()}>{t('retry')}</button>
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="text-sm text-gray-500">{t("modal.stats.destination")}</div>
          <div className="font-medium break-all">{link.destination}</div>

          {data && <>
            <div className="text-sm text-gray-500 mt-2">{t("modal.stats.countries")}</div>
            <div className="font-medium">{countryTop}</div>

            <div className="text-sm text-gray-500 mt-2">{t("modal.stats.devices")}</div>
            <div className="font-medium">{deviceTop}</div>
          </>}
        </div>

        <div>
          <div className="h-44 w-full">
            {isLoading
                ? <SkeletonRectangle />
                : data && <Bar
                        data={clicks}
                        options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }}
                        aria-hidden="true"
                    />}
          </div>
          {data && <ul className="sr-only">
            {clicks.labels.map((label, index) => <li key={label}>{label}: {clicks.datasets[0].data[index]}</li>)}
          </ul>}
        </div>
      </div>
    </>
  )
}