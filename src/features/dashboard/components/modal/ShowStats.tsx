import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useFormatter, useLocale } from "next-intl";
import { UserUrlStats } from "@/features/dashboard/types/types";
import { useLinkStatsCommon } from "@/features/dashboard/hooks/useLinkStatsCommon";
import { SkeletonChart, SkeletonKpi } from "@/components/Skeleton/Skeleton";
import { localizedPath } from "@/i18n/routes";
import { ROUTES } from "@/lib/routes";
import { DASHBOARD_CATEGORY_COLORS, DASHBOARD_CHART_COLORS } from "@/features/dashboard/helpers/chart-palette";

dayjs.extend(utc);

const Line = dynamic(() => import("@/features/dashboard/components/charts").then((module) => module.Line), {
  ssr: false,
  loading: () => <SkeletonChart className="h-full w-full" />,
});
const Bar = dynamic(() => import("@/features/dashboard/components/charts").then((module) => module.Bar), {
  ssr: false,
  loading: () => <SkeletonChart className="h-full w-full" bars={4} />,
});
const Pie = dynamic(() => import("@/features/dashboard/components/charts").then((module) => module.Pie), {
  ssr: false,
  loading: () => <SkeletonChart className="h-full w-full" bars={1} />,
});

interface Props {
  link: UserUrlStats;
  t: ReturnType<typeof import("next-intl").useTranslations>;
  onClose: () => void;
  canViewSensitiveStats?: boolean;
}

export default function ShowStats({ link, t, canViewSensitiveStats = false }: Readonly<Props>) {
  const format = useFormatter();
  const locale = useLocale();
  const [range, setRange] = useState(7);
  const { data, isLoading, error, mutate } = useLinkStatsCommon(link.link_id, range);
  const ranges = canViewSensitiveStats ? [7, 30, 90] : [7];

  const daily = useMemo(() => {
    const values: { date: string; clicks: number }[] = [];
    for (let offset = range - 1; offset >= 0; offset -= 1) {
      const date = dayjs().utc().subtract(offset, 'day');
      const key = date.format('YYYY-MM-DD');
      values.push({
        date: date.format(range > 30 ? 'D MMM' : range > 7 ? 'D MMM' : 'ddd'),
        clicks: data?.stats.find((item) => item.date === key)?.total_clicks ?? 0,
      });
    }
    return values;
  }, [data, range]);

  const totalPeriod = daily.reduce((sum, item) => sum + item.clicks, 0);
  const countryTop = data?.breakdown?.by_country?.[0]?.country_code ?? t('noData');
  const deviceTop = data?.breakdown?.by_device?.[0]?.device_type ?? t('noData');

  const countryChart = {
    labels: data?.breakdown.by_country.slice(0, 6).map((item) => item.country_code) ?? [],
    datasets: [{
      label: t('modal.stats.countries'),
      data: data?.breakdown.by_country.slice(0, 6).map((item) => item.clicks) ?? [],
      backgroundColor: [...DASHBOARD_CATEGORY_COLORS],
    }],
  };
  const deviceChartLabels = data?.breakdown.by_device.slice(0, 6).map((item) => item.device_type) ?? [];
  const deviceChart = {
    labels: deviceChartLabels,
    datasets: [{
      label: t('modal.stats.devices'),
      data: data?.breakdown.by_device.slice(0, 6).map((item) => item.clicks) ?? [],
      backgroundColor: deviceChartLabels.map((_, index) => DASHBOARD_CATEGORY_COLORS[(index + 1) % DASHBOARD_CATEGORY_COLORS.length]),
    }],
  };

  const kpiCls = 'min-w-0 rounded-lg border border-gray-200 px-3 py-2';
  const showBreakdown = canViewSensitiveStats && (Boolean(data) || isLoading);

  return (
    <div className="space-y-3">
      {isLoading && <p role="status" className="sr-only">{t('loading')}</p>}
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <p>{t('sectionError')}</p>
          <button type="button" className="mt-2 underline focus-visible:outline-2 focus-visible:outline-indigo-600"
            onClick={() => void mutate()}>{t('retry')}</button>
        </div>
      )}

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900" title={link.destination}>
            <span className="sr-only">{t('modal.stats.destination')}: </span>{link.destination}
          </p>
          <p className="truncate text-sm text-indigo-700">iny.one/{link.slug}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canViewSensitiveStats && (
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5" role="group" aria-label={t('modal.stats.rangeLabel')}>
            {ranges.map((days) => (
              <button key={days} type="button" onClick={() => setRange(days)}
                aria-pressed={range === days}
                className={`rounded-md px-2.5 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer ${range === days ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {t('modal.stats.rangeDays', { days } as never)}
              </button>
            ))}
          </div>
          )}
          <a
            href={`${localizedPath(ROUTES.DASHBOARD_LINK_DETAILS, locale)}?id=${encodeURIComponent(link.link_id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            {t('modal.stats.openDetails')}
          </a>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4" aria-busy="true" aria-label={t('loading')}>
          <SkeletonKpi emphasized />
          <SkeletonKpi />
          <SkeletonKpi />
          <SkeletonKpi />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <article className="min-w-0 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
            <p className="truncate text-xs text-gray-500">{t('modal.stats.periodClicks')}</p>
            <p className="text-xl font-bold text-indigo-700">{format.number(totalPeriod)}</p>
          </article>
          <article className={kpiCls}>
            <p className="truncate text-xs text-gray-500">{t('modal.stats.totalClicks')}</p>
            <p className="text-xl font-semibold">{link.clicks == null ? t('noData') : format.number(link.clicks)}</p>
          </article>
          <article className={kpiCls}>
            <p className="truncate text-xs text-gray-500">{t('modal.stats.countries')}</p>
            <p className="truncate text-lg font-semibold">{countryTop}</p>
          </article>
          <article className={kpiCls}>
            <p className="truncate text-xs text-gray-500">{t('modal.stats.devices')}</p>
            <p className="truncate text-lg font-semibold">{deviceTop}</p>
          </article>
        </div>
      )}

      {/* En escritorio la tendencia y los desgloses comparten fila; la altura sigue al viewport. */}
      <div className={`grid grid-cols-1 gap-3 ${showBreakdown ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : ''}`}>
        <section className="rounded-lg border border-gray-200 bg-surface p-3">
          <h3 className="mb-2 text-sm font-semibold">{t('modal.stats.clickTrend')}</h3>
          <div className={showBreakdown ? 'h-52 lg:h-[clamp(16rem,48dvh,26rem)]' : 'h-52 sm:h-[clamp(13rem,42dvh,22rem)]'}>
            {isLoading
              ? <SkeletonChart className="h-full w-full" />
              : <Line
                  data={{
                    labels: daily.map((item) => item.date),
                    datasets: [{
                      label: t('table.links.headers.clicks'),
                      data: daily.map((item) => item.clicks),
                      borderColor: DASHBOARD_CHART_COLORS.indigo,
                      backgroundColor: DASHBOARD_CHART_COLORS.indigoFill,
                      fill: true,
                      tension: 0.25,
                    }],
                  }}
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }}
                  aria-hidden="true" />}
          </div>
          <ul className="sr-only">{daily.map((item) => <li key={item.date}>{item.date}: {format.number(item.clicks)}</li>)}</ul>
        </section>

        {showBreakdown && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <section className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <h3 className="mb-2 text-sm font-semibold">{t('modal.stats.countries')}</h3>
              {isLoading
                ? <SkeletonChart className="h-40 lg:h-[clamp(7rem,20dvh,10.5rem)]" bars={1} />
                : countryChart.labels.length
                ? <div className="h-40 lg:h-[clamp(7rem,20dvh,10.5rem)]"><Pie data={countryChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } } }} aria-hidden="true" /></div>
                : <p className="text-sm text-gray-500">{t('noData')}</p>}
            </section>
            <section className="min-w-0 rounded-lg border border-gray-200 bg-surface p-3">
              <h3 className="mb-2 text-sm font-semibold">{t('modal.stats.devices')}</h3>
              {isLoading
                ? <SkeletonChart className="h-40 lg:h-[clamp(7rem,20dvh,10.5rem)]" bars={4} />
                : deviceChart.labels.length
                ? <div className="h-40 lg:h-[clamp(7rem,20dvh,10.5rem)]"><Bar data={deviceChart} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }} aria-hidden="true" /></div>
                : <p className="text-sm text-gray-500">{t('noData')}</p>}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
