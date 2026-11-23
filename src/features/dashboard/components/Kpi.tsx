import React from "react";

interface Props {
  title: string;
  value: number|string;
  hint?: string;
  emphasized?: boolean;
  example?: boolean;
}

export function Kpi({ title, value, hint, emphasized = false, example = false }: Readonly<Props>) {
  const border = example ? 'border-dashed ' : '';
  return (
    <div className={emphasized
      ? `min-w-0 rounded-xl border ${border}border-indigo-200 bg-indigo-50 px-4 py-3`
      : `min-w-0 rounded-xl border ${border}${example ? 'border-gray-300' : 'border-gray-200'} bg-surface px-4 py-3`}>
      <div className="truncate text-sm text-gray-500">{title}</div>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <div className={`truncate text-2xl ${emphasized ? "font-bold text-indigo-700" : "font-semibold text-gray-900"}`}>{value}</div>
        {hint && <div className="text-xs text-gray-400">{hint}</div>}
      </div>
    </div>
  );
}
