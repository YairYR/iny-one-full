import React, { useCallback, useMemo, useState } from "react";
import { classNames } from "@/utils/ui";

// ---------------- Types ----------------
export type Column<T> = {
  /** Unique key for the column, also used for sorting when accessor is not provided */
  key: keyof T | string;
  /** Column header label */
  header: React.ReactNode;
  /** Optional accessor to render a custom cell. Defaults to row[key as keyof T] */
  accessor?: (row: T) => React.ReactNode;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Optional className for <td> */
  cellClassName?: string;
  /** Optional className for <th> */
  headerClassName?: string;
  /** Optional fixed width */
  width?: number | string;
};

export type SortState<T> = {
  key: Column<T>["key"] | null;
  direction: "asc" | "desc";
};

export type TableProps<T> = {
  /** Rows to display */
  data: T[];
  /** Column configuration */
  columns: Column<T>[];
  /** Page size (default 10) */
  pageSize?: number;
  /** Initial sort state */
  initialSort?: SortState<T>;
  /** Loading state (renders skeleton rows) */
  loading?: boolean;
  /** Optional empty state component */
  emptyState?: React.ReactNode;
  /** Render row actions (rightmost column) */
  renderRowActions?: (row: T) => React.ReactNode;
  /** Get row ID for selection keys (defaults to index) */
  getRowId?: (row: T, index: number) => string | number;
  /** Enable checkbox selection */
  selectable?: boolean;
  /** Called when selection changes */
  onSelectionChange?: (selectedIds: Array<string | number>) => void;
  /** Optional caption for accessibility */
  caption?: string;
  /** Optional className overrides */
  className?: string;
};

// --------------- Utilities ---------------

function defaultCompare(a: unknown, b: unknown) {
  // Tries numeric compare first, falls back to string
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) {
    return na - nb;
  }
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export default function CustomTable<T extends Record<string, unknown>>({
                                                                       data,
                                                                       columns,
                                                                       pageSize = 10,
                                                                       initialSort = { key: null, direction: "asc" },
                                                                       loading = false,
                                                                       emptyState = (
                                                                         <div className="text-center py-10 text-sm text-muted-foreground">No hay datos para mostrar.</div>
                                                                       ),
                                                                       renderRowActions,
                                                                       getRowId,
                                                                       selectable = false,
                                                                       onSelectionChange,
                                                                       caption,
                                                                       className,
                                                                     }: TableProps<T>) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState<T>>(initialSort);
  const rowId = useCallback((row: T, index: number) => {
    return getRowId ? getRowId(row, index) : index;
  }, [getRowId]);

  // Selection state
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const toggleSelect = useCallback((id: string | number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAllOnPage = useCallback((ids: Array<string | number>, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  // Notify selection changes
  React.useEffect(() => {
    onSelectionChange?.(Array.from(selected));
  }, [selected, onSelectionChange]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sort.key) return data;
    const col = columns.find((c) => c.key === sort.key);
    const arr = [...data];
    arr.sort((ra, rb) => {
      // Prefer accessor for sorting if present and simple
      const va = col?.accessor ? col.accessor(ra) : ra[sort.key as keyof T];
      const vb = col?.accessor ? col.accessor(rb) : rb[sort.key as keyof T];
      const cmp = defaultCompare(va as unknown, vb as unknown);
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [data, columns, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = sortedData.slice(pageStart, pageStart + pageSize);

  const pageIds = useMemo(
    () => pageRows.map((row, i) => rowId(row, pageStart + i)),
    [pageRows, rowId, pageStart]
  );

  const allPageSelected = pageIds.every((id) => selected.has(id));

  const requestSort = (key: Column<T>["key"]) => {
    setPage(1); // reset to first page when sorting changes
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  return (
    <div className={classNames("w-full", className)}>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full caption-bottom text-sm">
          {caption ? (
            <caption className="caption-top px-4 py-3 text-left text-muted-foreground">{caption}</caption>
          ) : null}
          <thead className="bg-muted/50 sticky top-0 z-10">
          <tr>
            {selectable && (
              <th className="w-10 px-2 py-3 text-left align-middle">
                <input
                  type="checkbox"
                  aria-label={allPageSelected ? "Deseleccionar página" : "Seleccionar página"}
                  className="h-4 w-4 rounded border-input"
                  checked={allPageSelected}
                  onChange={(e) => selectAllOnPage(pageIds, e.currentTarget.checked)}
                />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sort.key === col.key;
              return (
                <th
                  key={String(col.key)}
                  scope="col"
                  style={{ width: col.width }}
                  className={classNames(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground select-none",
                    col.headerClassName
                  )}
                >
                  <button
                    type="button"
                    className={classNames(
                      "inline-flex items-center gap-1 hover:opacity-80",
                      col.sortable ? "cursor-pointer" : "cursor-default"
                    )}
                    onClick={col.sortable ? () => requestSort(col.key) : undefined}
                    aria-sort={isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={classNames("h-3.5 w-3.5 transition-transform", isSorted && sort.direction === "desc" && "rotate-180")}
                        aria-hidden
                      >
                        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.17l-4.24 3.36a.75.75 0 0 1-.94 0L5.25 8.4a.75.75 0 0 1-.02-1.19z" />
                      </svg>
                    )}
                  </button>
                </th>
              );
            })}
            {renderRowActions && (
              <th className="w-px px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acciones</th>
            )}
          </tr>
          </thead>

          <tbody>
          {loading
            ? Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-t border-border">
                {selectable && <td className="px-2 py-3"><div className="h-4 w-4 rounded bg-muted animate-pulse" /></td>}
                {columns.map((col, j) => (
                  <td key={`sk-${i}-${j}`} className={classNames("px-4 py-3", col.cellClassName)}>
                    <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  </td>
                ))}
                {renderRowActions && <td className="px-4 py-3 text-right"><div className="h-8 w-16 rounded bg-muted animate-pulse ml-auto" /></td>}
              </tr>
            ))
            : pageRows.map((row, i) => {
              const id = rowId(row, pageStart + i);
              return (
                <tr key={String(id)} className="border-t border-border hover:bg-muted/30">
                  {selectable && (
                    <td className="px-2 py-3 align-middle">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input"
                        checked={selected.has(id)}
                        onChange={() => toggleSelect(id)}
                        aria-label={`Seleccionar fila ${i + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} className={classNames("px-4 py-3 align-middle", col.cellClassName)}>
                      {col.accessor ? col.accessor(row) : String(row[col.key as keyof T] ?? "")}
                    </td>
                  ))}
                  {renderRowActions && (
                    <td className="px-4 py-3 text-right align-middle">
                      {renderRowActions(row)}
                    </td>
                  )}
                </tr>
              );
            })}

          {!loading && pageRows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0) + (renderRowActions ? 1 : 0)}>
                {emptyState}
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span> · {data.length} registro{data.length === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-xl border border-border px-3 py-1.5 text-sm shadow-sm disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
          >
            « Primero
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-xl border border-border px-3 py-1.5 text-sm shadow-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Anterior
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-xl border border-border px-3 py-1.5 text-sm shadow-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente →
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-xl border border-border px-3 py-1.5 text-sm shadow-sm disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Último »
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Example Usage ----------------
// Remove or adapt this demo in your app
export function DemoTabla() {
  type User = { id: number; name: string; email: string; role: string; age: number };
  const rows: User[] = Array.from({ length: 37 }).map((_, i) => ({
    id: i + 1,
    name: `Usuario ${i + 1}`,
    email: `user${i + 1}@mail.com`,
    role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Editor" : "Viewer",
    age: 18 + ((i * 7) % 30),
  }));

  return (
    <div className="p-6">
      <CustomTable<User>
        data={rows}
        pageSize={8}
        caption="Ejemplo de tabla reutilizable"
        columns={[
          { key: "name", header: "Nombre", sortable: true },
          { key: "email", header: "Correo", sortable: true, cellClassName: "font-mono" },
          { key: "role", header: "Rol", sortable: true, accessor: (u) => (
              <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
              {u.role}
            </span>
            ) },
          { key: "age", header: "Edad", sortable: true, headerClassName: "text-right", cellClassName: "text-right" },
        ]}
        // initialSort={{ key: "name", direction: "asc" }}
        // selectable
        getRowId={(u) => u.id}
        renderRowActions={(u) => (
          <div className="flex items-center justify-end gap-2">
            <button className="rounded-lg border border-border px-2 py-1 text-xs">Editar</button>
            <button className="rounded-lg border border-destructive text-destructive px-2 py-1 text-xs">Eliminar</button>
          </div>
        )}
      />
    </div>
  );
}
