import { useDataTable, UseDataTableOptions } from "@/components/Table/hooks/useDataTable";
import type React from "react";
import clsx from "clsx";
import { Button } from "@headlessui/react";
import { usePagination } from "@/components/Table/hooks/usePagination";

export type DataTableProps<T> = UseDataTableOptions<T> & {
  title?: string;
  subtitle?: string;
  pageSize?: number;
}

export default function DataTable<T extends { id: string | number } = { id: string, [key: string]: string }>(
  { title, subtitle, data, columns, selectable, pageSize, ...rest }: DataTableProps<T>
) {
  const table = useDataTable<T>({
    data,
    columns,
    selectable,
    ...rest
  });
  const pagination = usePagination(table, { pageSize });
  const { selectedRows, toggleRowSelection } = table;

  return (
    <div className="bg-white text-gray-800 p-4 rounded-xl shadow-md border border-gray-200">
      {title && (<h2 className="text-lg font-semibold text-gray-900">{title}</h2>)}
      {subtitle && (<p className="text-xs text-gray-500 mb-3">{subtitle}</p>)}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
          <tr className="text-gray-500 text-xs border-b">
            {table.selectable && <th className="p-2"></th>}
            {table.columns.map((col) => (
              <th
                key={String(col.key)}
                className={clsx("p-2",
                  col.sortable && 'cursor-pointer',
                  !col.sortable && 'cursor-default',
                  col.className)}
                onClick={() => col.sortable && table.handleSort(col.key)}
              >{col.label}
                {table.sortConfig?.key === col.key && (
                  <span className="ml-1">
                  {table.sortConfig.direction === "asc" ? "▲" : "▼"}
                </span>
                )}
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {table.data.map((row, rowIndex) => {
            const isSelected = selectedRows.has(row.id);
            return (
              <tr
                key={String(row.id)}
                className="border-b hover:bg-gray-50 transition"
                onDoubleClick={() => table.handleRowDoubleClick(row)}
                onContextMenu={(e) => table.handleRowRightClick(row, e)}
              >
                {table.selectable && (
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRowSelection(row.id)}
                    />
                  </td>
                )}
                {table.columns.map((col) => (
                  <td key={String(col.key)} className={clsx("px-3 py-2 whitespace-nowrap", col.cellClassName)}>
                    {col.render
                      ? col.render(row, { rowIndex, selected: isSelected } as never)
                      : String(row[col.key as never])}
                  </td>
                ))}
              </tr>
            )
          })}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      {typeof pageSize === 'number' && (
        <div className="flex items-center justify-between">
          <Button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={pagination.prevPage}
            disabled={pagination.page === 0}
          >
            Anterior
          </Button>
          <span>
            Página {pagination.page + 1} de {pagination.totalPages}
          </span>
          <Button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={pagination.nextPage}
            disabled={pagination.page >= pagination.totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}