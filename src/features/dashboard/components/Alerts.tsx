import React from "react";
import { IAlert } from "@/features/dashboard/types/types";

interface Props {
  alerts: IAlert[];
}

export default function Alerts({ alerts }: Readonly<Props>) {
  if (!alerts?.length) return null;
  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div key={a.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
          <p className="text-sm font-semibold">{a.title}</p>
          <p className="text-sm text-gray-600">{a.message}</p>
        </div>
      ))}
    </div>
  );
};
