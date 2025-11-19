import { Bar } from "react-chartjs-2";
import React from "react";
import { UserUrlStats } from "@/features/dashboard/types/types";

interface Props {
  link?: UserUrlStats|null;
  onClose: () => void;
}

export default function LinkDetailModal({ link, onClose }: Props) {
  if (!link) return null;

  const countries = Object.entries(link.stats?.country_counts ?? {})
    .sort((a, b) => b[1] - a[1]);
  const devices = Object.entries(link.stats?.device_type_counts ?? {})
    .sort((a, b) => b[1] - a[1]);
  const countryTop = countries[0]?.[0];
  const deviceTop = devices[0]?.[0];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-3xl bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Estadísticas: /{link.slug}</h3>
          <button onClick={onClose} className="text-gray-500">Cerrar</button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="text-sm text-gray-500">Destino</div>
            <div className="font-medium truncate">{link.destination}</div>

            <div className="text-sm text-gray-500 mt-2">Top país</div>
            <div className="font-medium">{countryTop}</div>

            <div className="text-sm text-gray-500 mt-2">Dispositivo top</div>
            <div className="font-medium">{deviceTop}</div>
          </div>

          <div>
            <div className="h-44 w-full">
              <Bar
                data={{ labels: ["Lun","Mar","Mié","Jue","Vie"], datasets:[{ label: 'Clics', data: [10,20,15,30,25] }] }}
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

      </div>
    </div>
  );
}

