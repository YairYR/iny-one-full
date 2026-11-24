'use client';

import dynamic from "next/dynamic";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useMemo, useState } from "react";
import { ArrowLeft, Copy, ExternalLink, LockKeyhole, Pencil } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useLinkStatsCommon } from "@/features/dashboard/hooks/useLinkStatsCommon";
import type { UserUrlStats } from "@/features/dashboard/types/types";
import { DASHBOARD_CATEGORY_COLORS, DASHBOARD_CHART_COLORS } from "@/features/dashboard/helpers/chart-palette";
import { SkeletonBlock, SkeletonChart, SkeletonKpi } from "@/components/Skeleton/Skeleton";

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
  initialRange: number;
  canViewSensitiveStats: boolean;
  canEdit: boolean;
}

export default function LinkDetailsView({ link, initialRange, canViewSensitiveStats, canEdit }: Readonly<Props>) {
  const t = useTranslations('DashboardPage');
  const format = useFormatter();
  const [range, setRange] = useState(initialRange);
  const [copied, setCopied] = useState(false);
  const { data, isLoading, error, mutate } = useLinkStatsCommon(link.link_id, range);

  const daily = useMemo(() => {
    const values: { date: string; key: string; clicks: number }[] = [];
    for (let offset = range - 1; offset >= 0; offset -= 1) {
      const date = dayjs().utc().subtract(offset, 'day');
      const key = date.format('YYYY-MM-DD');
      values.push({
        key,
        date: date.format(range > 30 ? 'D MMM' : range > 7 ? 'D MMM' : 'ddd'),
        clicks: data?.stats.find((item) => item.date === key)?.total_clicks ?? 0,
      });
    }
    return values;
  }, [data, range]);

  const periodClicks = daily.reduce((sum, item) => sum + item.clicks, 0);
  const shortUrl = `https://iny.one/${link.slug}`;
  const ranges = canViewSensitiveStats ? [7, 30, 90] : [7];
  const countries = data?.breakdown.by_country ?? [];
  const devices = data?.breakdown.by_device ?? [];
  const browsers = data?.breakdown.by_browser ?? [];

  const copyLink = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
  };

  const btn = "inline-flex h-9 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-indigo-600";
  const kpis = [
    [t('modal.stats.totalClicks'), link.clicks == null ? t('noData') : format.number(link.clicks)],
    [t('modal.stats.periodClicks'), format.number(periodClicks)],
    [t('details.created'), format.dateTime(new Date(link.created_at), { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })],
    [t('details.destinationCount'), countries.length + devices.length + browsers.length ? format.number(countries.length + devices.length + browsers.length) : t('noData')],
  ];
  const breakdownHeight = "h-44 lg:h-[clamp(8rem,22dvh,12rem)]";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        {isLoading && <p role="status" className="sr-only">{t('loading')}</p>}
        <header className="rounded-xl border border-gray-200 bg-surface px-4 py-3 sm:px-5">
          <Link href={ROUTES.DASHBOARD} className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900">
            <ArrowLeft size={14} aria-hidden="true" />
            {t('details.back')}
          </Link>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{link.alias ? link.alias : t('details.link')}</p>
              <h1 className="break-all text-xl font-bold text-gray-900">{shortUrl}</h1>
              <p className="max-w-3xl truncate text-sm text-gray-600" title={link.destination}>{link.destination}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => void copyLink()} className={btn}>
                <Copy size={16} aria-hidden="true" />{copied ? t('tools.copied') : t('tools.copy')}
              </button>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className={btn}>
                <ExternalLink size={16} aria-hidden="true" />{t('details.openShortLink')}
              </a>
              {canEdit
                ? <Link href={ROUTES.DASHBOARD} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    <Pencil size={16} aria-hidden="true" />{t('tools.edit')}
                  </Link>
                : <button type="button" disabled title={t('tools.planUnavailable')}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-400">
                    <LockKeyhole size={16} aria-hidden="true" />{t('tools.edit')}
                    <span className="sr-only">{t('tools.planUnavailable')}</span>
                  </button>}
            </div>
          </div>
        </header>

        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {t('sectionError')}
          <button type="button" className="ml-2 underline" onClick={() => void mutate()}>{t('retry')}</button>
        </div>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t('details.analytics')}</h2>
          {canViewSensitiveStats && <div role="group" aria-label={t('details.analytics')} className="inline-flex rounded-lg border border-gray-200 bg-surface p-1">
            {ranges.map((days) => (
              <button key={days} type="button" onClick={() => setRange(days)} aria-pressed={range === days}
                className={`rounded-md px-3 py-1 text-sm font-medium ${range === days ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {t('modal.stats.rangeDays', { days } as never)}
              </button>
            ))}
          </div>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy="true" aria-label={t('loading')}>
            <SkeletonKpi emphasized />
            <SkeletonKpi />
            <SkeletonKpi />
            <SkeletonKpi />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map(([label, value], index) => (
              <article key={label} className={`min-w-0 rounded-xl border px-4 py-3 ${index === 0 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-surface'}`}>
                <p className="truncate text-xs text-gray-500">{label}</p>
                <p className={`mt-0.5 truncate text-xl ${index === 0 ? 'font-bold text-indigo-700' : 'font-semibold text-gray-900'}`}>{value}</p>
              </article>
            ))}
          </div>
        )}

        {/* La tendencia es la lectura principal; países y dispositivos la acompañan al lado en escritorio. */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="rounded-xl border border-gray-200 bg-surface p-4">
            <h3 className="mb-2 font-semibold">{t('modal.stats.clickTrend')}</h3>
            <div className="h-64 lg:h-[clamp(18rem,50dvh,28rem)]">
              {isLoading ? <SkeletonChart className="h-full w-full" /> : <Line
                data={{ labels: daily.map((item) => item.date), datasets: [{
                  label: t('table.links.headers.clicks'), data: daily.map((item) => item.clicks),
                  borderColor: DASHBOARD_CHART_COLORS.indigo, backgroundColor: DASHBOARD_CHART_COLORS.indigoFill, fill: true, tension: 0.25,
                }] }}
                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }}
                aria-hidden="true" />}
            </div>
          </section>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold">{t('modal.stats.countries')}</h3>
              {isLoading
                ? <SkeletonChart className={breakdownHeight} bars={1} />
                : countries.length
                ? <div className={breakdownHeight}><Pie data={{ labels: countries.slice(0, 8).map((item) => item.country_code), datasets: [{ data: countries.slice(0, 8).map((item) => item.clicks), backgroundColor: [...DASHBOARD_CATEGORY_COLORS] }] }} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} aria-hidden="true" /></div>
                : <p className="text-sm text-gray-500">{t('noData')}</p>}
            </section>
            <section className="rounded-xl border border-gray-200 bg-surface p-4">
              <h3 className="mb-2 font-semibold">{t('modal.stats.devices')}</h3>
              {isLoading
                ? <SkeletonChart className={breakdownHeight} bars={4} />
                : devices.length
                ? <div className={breakdownHeight}><Bar data={{ labels: devices.slice(0, 8).map((item) => item.device_type), datasets: [{ label: t('table.links.headers.clicks'), data: devices.slice(0, 8).map((item) => item.clicks), backgroundColor: devices.slice(0, 8).map((_, index) => DASHBOARD_CATEGORY_COLORS[(index + 1) % DASHBOARD_CATEGORY_COLORS.length]) }] }} options={{ maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }} aria-hidden="true" /></div>
                : <p className="text-sm text-gray-500">{t('noData')}</p>}
            </section>
          </div>
        </div>

        {canViewSensitiveStats && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {isLoading
              ? <BreakdownSkeleton title={t('modal.stats.browsers')} />
              : <Breakdown title={t('modal.stats.browsers')} rows={browsers.map((item) => [item.browser, item.clicks] as const)} format={format.number} />}
            {isLoading
              ? <BreakdownSkeleton title={t('details.utm')} />
              : <Breakdown title={t('details.utm')} rows={[
              [t('details.utmSource'), link.utm_source ?? null],
              [t('details.utmMedium'), link.utm_medium ?? null],
              [t('details.utmCampaign'), link.utm_campaign ?? null],
            ]} format={format.number} />}
          </div>
        )}
      </div>
    </main>
  );
}

function Breakdown({ title, rows, format }: Readonly<{ title: string; rows: readonly (readonly [string, string | number | null])[]; format: (value: number) => string }>) {
  return (
    <section className="rounded-xl border border-gray-200 bg-surface p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {rows.length ? <dl className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 rounded-md bg-gray-50 px-3 py-1.5 text-sm">
            <dt className="truncate text-gray-600">{label || '—'}</dt>
            <dd className="font-medium text-gray-900">{typeof value === 'number' ? format(value) : value == null || value === '' ? '—' : value}</dd>
          </div>
        ))}
      </dl> : <p className="text-sm text-gray-500">—</p>}
    </section>
  );
}

function BreakdownSkeleton({ title }: Readonly<{ title: string }>) {
  return (
    <section className="rounded-xl border border-gray-200 bg-surface p-4" aria-busy="true">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <div className="space-y-1.5" aria-hidden="true">
        <SkeletonBlock className="h-8 w-full" />
        <SkeletonBlock className="h-8 w-full" />
        <SkeletonBlock className="h-8 w-full" />
      </div>
    </section>
  );
}
