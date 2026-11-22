import React from "react";

interface Props {
  title: string;
  value: number|string;
  hint?: string;
  emphasized?: boolean;
}

export function Kpi({ title, value, hint, emphasized = false }: Readonly<Props>) {
  return (
    <div className={emphasized
      ? "rounded-xl border border-indigo-100 bg-indigo-50 p-4"
      : "rounded-xl border border-gray-200 bg-white p-4"}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className={emphasized ? "text-2xl font-bold text-indigo-700" : "text-2xl font-semibold text-gray-900"}>{value}</div>
        {hint && <div className="text-xs text-gray-400">{hint}</div>}
      </div>
    </div>
  );
}