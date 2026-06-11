import { UserUrlStats } from "@/features/dashboard/types/types";
import dynamic from "next/dynamic";

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
  const countries = Object.entries(link.stats?.country_counts ?? {})
    .sort((a, b) => b[1] - a[1]);
  const devices = Object.entries(link.stats?.device_type_counts ?? {})
    .sort((a, b) => b[1] - a[1]);
  const countryTop = countries[0]?.[0];
  const deviceTop = devices[0]?.[0];

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
            <Bar
              data={{ labels: ["Lun","Mar","Mié","Jue","Vie"], datasets:[{ label: 'Clicks', data: [10,20,15,30,25] }] }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">UTM</div>
          <div className="text-sm text-gray-700">utm_source=instagram<br/>utm_campaign=blackfriday</div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-500">Referrers top</div>
          <ul className="text-sm text-gray-700 list-disc list-inside">
            <li>Directo</li>
            <li>Google</li>
            <li>WhatsApp</li>
          </ul>
        </div>
      </div>
    </>
  )
}