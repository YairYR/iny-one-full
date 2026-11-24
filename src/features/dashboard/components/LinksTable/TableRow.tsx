import { useState } from "react";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import type { UserUrl } from "@/features/dashboard/types/types";
import type { ITool } from "./LinkTools";
import { LinkTools } from "./LinkTools";

export function TableRow({ row, tools }: Readonly<{ row: Row<UserUrl>; tools: ITool<UserUrl>[] }>) {
  const [contextMenuRequest, setContextMenuRequest] = useState<{ x: number; y: number; nonce: number } | null>(null);

  return (
    <tr
      className="group"
      onContextMenu={(event) => {
        event.preventDefault();
        setContextMenuRequest((current) => ({
          x: event.clientX,
          y: event.clientY,
          nonce: (current?.nonce ?? 0) + 1,
        }));
      }}
    >
      {row.getVisibleCells().map((cell) => {
        const isShort = cell.column.id === "short";
        const isActions = cell.column.id === "actions";
        const Cell = isShort ? "th" : "td";
        return (
          <Cell
            key={cell.id}
            scope={isShort ? "row" : undefined}
            className={`${isShort ? "sticky left-0 z-10 shadow-[2px_0_0_rgba(229,231,235,0.8)]" : isActions ? "sticky right-0 z-10 shadow-[-2px_0_0_rgba(229,231,235,0.8)]" : ""} border-b border-gray-200 bg-surface px-3 py-2.5 text-left group-hover:bg-gray-50`}
          >
            {isShort ? (
              <span className="block min-w-0 truncate font-medium" title={`iny.one/${row.original.slug}`}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
            ) : isActions ? (
              <div className="flex justify-center">
                <LinkTools tools={tools} link={row.original} linkLabel={row.original.slug} contextMenuRequest={contextMenuRequest} />
              </div>
            ) : (
              <div className="truncate" title={cell.column.id === "destination" ? row.original.destination : undefined}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            )}
          </Cell>
        );
      })}
    </tr>
  );
}
