import React from "react";
import { useTranslations } from "next-intl";

/** Alturas de gráfico ligadas al alto visible: en escritorio todo el panel entra sin scroll. */
export const DASHBOARD_CHART_HEIGHT = 'h-48 lg:h-[clamp(11rem,24dvh,15rem)]';

export function ExampleBadge() {
  const t = useTranslations('DashboardPage');
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-indigo-300 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
      {t('example.badge')}
    </span>
  );
}

interface Props {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tone?: 'surface' | 'subtle';
  /** Datos ficticios: borde discontinuo y distintivo, para que no se confundan con datos reales. */
  example?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function DashboardCard({ title, subtitle, tone = 'surface', example = false, className = '', children }: Readonly<Props>) {
  return (
    <section className={`min-w-0 rounded-xl border p-4 ${example ? 'border-dashed border-gray-300' : 'border-gray-200'} ${tone === 'subtle' ? 'bg-gray-50' : 'bg-surface'} ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-base font-semibold">{title}</h2>
        <div className="flex shrink-0 items-center gap-2">
          {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
          {example && <ExampleBadge />}
        </div>
      </div>
      {children}
    </section>
  );
}
