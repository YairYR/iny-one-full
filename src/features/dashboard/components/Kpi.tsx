import React from "react";

interface Props {
  title: string;
  value: number|string;
  hint?: string;
}

export function Kpi({ title, value, hint }: Readonly<Props>) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl font-semibold">{value}</div>
        {hint && <div className="text-xs text-gray-400">{hint}</div>}
      </div>
    </div>
  );
}