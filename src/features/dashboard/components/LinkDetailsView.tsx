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

dayjs.extend(utc);

const Line = dynamic(() => import("@/features/dashboard/components/charts").then((module) => module.Line), { ssr: false });
const Bar = dynamic(() => import("@/features/dashboard/components/charts").then((module) => module.Bar), { ssr: false });
const Pie = dynamic(() => import("@/features/dashboard/components/charts").then((module) => module.Pie), { ssr: false });

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

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Link href={ROUTES.DASHBOARD} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-900">
          <ArrowLeft size={16} aria-hidden="true" />
          {t('details.back')}
        </Link>

        <header className="mt-4 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-gray-500">{link.alias ? link.alias : t('details.link')}</p>
            <h1 className="mt-1 break-all text-2xl font-bold text-gray-900">{shortUrl}</h1>
            <p className="mt-2 max-w-3xl truncate text-sm text-gray-600" title={link.destination}>{link.destination}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void copyLink()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Copy size={16} aria-hidden="true" />{copied ? t('tools.copied') : t('tools.copy')}
            </button>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ExternalLink size={16} aria-hidden="true" />{t('details.openShortLink')}
            </a>
            {canEdit
              ? <Link href={ROUTES.DASHBOARD} className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700">
                  <Pencil size={16} aria-hidden="true" />{t('tools.edit')}
                </Link>
              : <button type="button" disabled title={t('tools.planUnavailable')}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-400">
                  <LockKeyhole size={16} aria-hidden="true" />{t('tools.edit')}
                  <span className="sr-only">{t('tools.planUnavailable')}</span>
                </button>}
          </div>
        </header>

        {error && <div role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {t('sectionError')}
          <button type="button" className="ml-2 underline" onClick={() => void mutate()}>{t('retry')}</button>
        </div>}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t('details.analytics')}</h2>
          {canViewSensitiveStats && <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {ranges.map((days) => (
              <button key={days} type="button" onClick={() => setRange(days)} aria-pressed={range === days}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${range === days ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {t('modal.stats.rangeDays', { days } as never)}
              </button>
            ))}
          </div>}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [t('modal.stats.totalClicks'), link.clicks == null ? t('noData') : format.number(link.clicks)],
            [t('modal.stats.periodClicks'), isLoading ? '—' : format.number(periodClicks)],
            [t('details.created'), format.dateTime(new Date(link.created_at), { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })],
            [t('details.destinationCount'), countries.length + devices.length + browsers.length ? format.number(countries.length + devices.length + browsers.length) : t('noData')],
          ].map(([label, value], index) => (
            <article key={label} className={index === 0
              ? "rounded-xl border border-indigo-100 bg-indigo-50 p-4"
              : "rounded-xl border border-gray-200 bg-white p-4"}>
              <p className="text-sm text-gray-500">{label}</p>
              <p className={index === 0 ? "mt-1 text-xl font-bold text-indigo-700" : "mt-1 text-xl font-semibold text-gray-900"}>{value}</p>
            </article>
          ))}
        </div>

        <section className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 font-semibold">{t('modal.stats.clickTrend')}</h3>
          <div className="h-72">
            {isLoading ? <div className="h-full animate-pulse rounded-lg bg-gray-100" /> : <Line
              data={{ labels: daily.map((item) => item.date), datasets: [{
                label: t('table.links.headers.clicks'), data: daily.map((item) => item.clicks),
                borderColor: DASHBOARD_CHART_COLORS.indigo, backgroundColor: DASHBOARD_CHART_COLORS.indigoFill, fill: true, tension: 0.25,
              }] }}
              options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }}
              aria-hidden="true" />}
          </div>
        </section>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold">{t('modal.stats.countries')}</h3>
            {countries.length
              ? <div className="h-64"><Pie data={{ labels: countries.slice(0, 8).map((item) => item.country_code), datasets: [{ data: countries.slice(0, 8).map((item) => item.clicks), backgroundColor: [...DASHBOARD_CATEGORY_COLORS] }] }} options={{ maintainAspectRatio: false }} aria-hidden="true" /></div>
              : <p className="text-sm text-gray-500">{t('noData')}</p>}
          </section>
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-semibold">{t('modal.stats.devices')}</h3>
            {devices.length
              ? <div className="h-64"><Bar data={{ labels: devices.slice(0, 8).map((item) => item.device_type), datasets: [{ label: t('table.links.headers.clicks'), data: devices.slice(0, 8).map((item) => item.clicks), backgroundColor: devices.slice(0, 8).map((_, index) => DASHBOARD_CATEGORY_COLORS[(index + 1) % DASHBOARD_CATEGORY_COLORS.length]) }] }} options={{ maintainAspectRatio: false, indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { precision: 0 } } } }} aria-hidden="true" /></div>
              : <p className="text-sm text-gray-500">{t('noData')}</p>}
          </section>
        </div>

        {canViewSensitiveStats && (
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Breakdown title={t('modal.stats.browsers')} rows={browsers.map((item) => [item.browser, item.clicks] as const)} format={format.number} />
            <Breakdown title={t('details.utm')} rows={[
              [t('details.utmSource'), link.utm_source ?? null],
              [t('details.utmMedium'), link.utm_medium ?? null],
              [t('details.utmCampaign'), link.utm_campaign ?? null],
            ]} format={format.number} />
          </div>
        )}
      </div>
    </main>
  );
}

function Breakdown({ title, rows, format }: Readonly<{ title: string; rows: readonly (readonly [string, string | number | null])[]; format: (value: number) => string }>) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {rows.length ? <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 rounded-md bg-gray-50 px-3 py-2 text-sm">
            <dt className="truncate text-gray-600">{label || '—'}</dt>
            <dd className="font-medium text-gray-900">{typeof value === 'number' ? format(value) : value == null || value === '' ? '—' : value}</dd>
          </div>
        ))}
      </dl> : <p className="text-sm text-gray-500">—</p>}
    </section>
  );
}
