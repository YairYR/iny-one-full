import React from "react";
import { UserUrl } from "@/features/dashboard/types/types";
import dayjs from "dayjs";

export default function LinksTable({ links, onOpen }: { links: UserUrl[]; onOpen?: (link: UserUrl) => void }) {
  const substringAndSpread = (str: string, max: number) => {
    const _str = str.trim();
    const text = _str.trim().substring(0, max);
    return _str.length > max ? `${text}...` : text;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Tus enlaces</h3>
          <div className="text-sm text-gray-500">Total: {links.length}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
          <tr>
            <th className="p-3">Alias</th>
            <th className="p-3">Destino</th>
            <th className="p-3">Clicks</th>
            {/*<th className="p-3">CTR</th>*/}
            <th className="p-3">Creado</th>
            <th className="p-3">Acciones</th>
          </tr>
          </thead>
          <tbody>
          {links.map((l) => (
            <tr key={l.slug} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">/{l.slug}</td>
              <td className="p-3 truncate max-w-md" title={l.destination}>{substringAndSpread(l.destination, 30)}</td>
              <td className="p-3">{l.clicks}</td>
              {/*<td className="p-3">{l.ctr}</td>*/}
              <td className="p-3">{dayjs(l.created_at).format('YYYY-MM-DD HH:mm')}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard?.writeText(window.location.origin + '/' + l.slug)}
                    className="px-3 py-1 rounded bg-gray-100 text-sm"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={() => onOpen?.(l)}
                    className="px-3 py-1 rounded bg-indigo-600 text-white text-sm"
                  >
                    Ver stats
                  </button>
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
