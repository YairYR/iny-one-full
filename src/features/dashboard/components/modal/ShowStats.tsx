import { UserUrlStats } from "@/features/dashboard/types/types";
import dynamic from "next/dynamic";
import {useLinkStatsCommon} from "@/features/dashboard/hooks/useLinkStatsCommon";
import {useMemo} from "react";
import dayjs from "dayjs";
import {dayToName} from "@/features/dashboard/helpers/stats";
import {SkeletonRectangle} from "@/components/Skeleton/Skeleton";

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
  const { data, isLoading } = useLinkStatsCommon(link.slug);

  const summary = data?.reduce((obj, curr) => {
    Object.keys(curr.country_counts).forEach(key => {
      if (!(key in obj)) {
        obj.countries[key] = 0;
      }
      obj.countries[key] += curr.country_counts[key];
    });
    Object.keys(curr.device_type_counts).forEach(key => {
      if (!(key in obj)) {
        obj.devices[key] = 0;
      }
      obj.devices[key] += curr.device_type_counts[key];
    });
    return obj;
  }, {
    countries: {} as Record<string, number>,
    devices: {} as Record<string, number>
  });

  const countries = Object.entries(summary?.countries ?? {})
    .sort((a, b) => b[1] - a[1]);
  const devices = Object.entries(summary?.devices ?? {})
    .sort((a, b) => b[1] - a[1]);
  const countryTop = countries[0]?.[0];
  const deviceTop = (devices[0]?.[0] === 'unknown') ? 'desktop' : devices[0]?.[0];

  const clicks = useMemo(() => {
    const values = {
      labels: [] as string[],
      datasets:[{ label: 'Clicks', data: [] as number[] }],
    };

    if (!data) {
      return values;
    }

    let current_day = dayjs();
    for (let i = 0; i < 7; i++) {
      const label = t(dayToName(current_day.day()));
      const value = data.find(d => dayjs(d.date).isSame(current_day, 'day'))?.total_clicks ?? 0;

      values.labels.unshift(label);
      values.datasets[0].data.unshift(value);
      current_day = current_day.subtract(1, 'day');
    }

    return values;
  }, [data]);

  return (
    <>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="text-sm text-gray-500">{t("modal.stats.destination")}</div>
          <div className="font-medium truncate">{link.destination}</div>

          <div className="text-sm text-gray-500 mt-2">{t("modal.stats.countries")}</div>
          <div className="font-medium">{countryTop}</div>

          <div className="text-sm text-gray-500 mt-2">{t("modal.stats.devices")}</div>
          <div className="font-medium">{deviceTop}</div>
        </div>

        <div>
          <div className="h-44 w-full">
            {isLoading
                ? <SkeletonRectangle />
                : <Bar
                        data={clicks}
                        options={{ maintainAspectRatio: false }}
                    />}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">UTM</div>
          <div className="text-sm text-gray-700">
            {link.utm_source && <p>utm_source={link.utm_source}</p>}
            {link.utm_campaign && <p>utm_campaign={link.utm_campaign}</p>}
            {link.utm_medium && <p>utm_medium={link.utm_medium}</p>}
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Referrers top</div>
          <ul className="text-sm text-gray-700 list-disc list-inside">
            <li>Direct</li>
          </ul>
        </div>
      </div>
    </>
  )
}