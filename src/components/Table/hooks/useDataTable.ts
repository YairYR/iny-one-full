import type React from 'react';
import { useMemo, useState } from "react";

export interface Column<T> {
  key: keyof T|string;
  label: React.ReactNode;
  sortable?: boolean;
  render?: RenderFunc<T>;
  className?: string;
  cellClassName?: string;
}

export type RenderFunc<T> = (row: T, cell: Cell<T>) => React.ReactNode;
export type Plugin<T> = (table: DataTableInstance<T>) => { rows: T[]; state?: never; api?: never; };

export interface Cell<T> {
  rowIndex: number;
  selected: boolean;
  column: Omit<Column<T>, 'render'>;
}

export interface UseDataTableOptions<T> {
  data: T[];
  columns: Column<T>[];
  selectable?: boolean;
  onRowDoubleClick?: (row: T) => void;
  onRowRightClick?: (row: T, event: React.MouseEvent) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  plugins?: Plugin<T>[];
}

export interface DataTableInstance<T> {
  columns: (Column<T> & { index: number })[];
  data: T[];
  selectable: boolean;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  selectedRows: Set<string | number>;
  handleSort: (key: keyof T|string) => void;
  toggleRowSelection: (id: string | number) => void;
  handleRowDoubleClick: (row: T) => void;
  handleRowRightClick: (row: T, event: React.MouseEvent) => void;
}

export function useDataTable<T extends { id: string | number }>(
  options: UseDataTableOptions<T>
): DataTableInstance<T> {
  const {
    data,
    columns: originalColumns,
    selectable = false,
    onRowDoubleClick,
    onRowRightClick,
    onRowSelect,
    plugins,
  } = options;

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );

  const columns = useMemo(() => {
    return originalColumns.map((col, index) => ({
      ...col,
      sortable: col.sortable ?? false,
      index,
    }));
  }, [originalColumns]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const valA: T = a[sortConfig.key as never];
      const valB: T = b[sortConfig.key as never];

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: (keyof T )|string) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key: key as never, direction: "asc" });
    }
  };

  const toggleRowSelection = (id: string | number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
    onRowSelect?.(data.filter((row) => newSelection.has(row.id)));
  };

  const handleRowDoubleClick = (row: T) => {
    onRowDoubleClick?.(row);
  };

  const handleRowRightClick = (row: T, event: React.MouseEvent) => {
    event.preventDefault();
    onRowRightClick?.(row, event);
  };

  const instance: DataTableInstance<T> = {
    columns,
    data: sortedData,
    selectable,
    sortConfig,
    selectedRows,
    handleSort,
    toggleRowSelection,
    handleRowDoubleClick,
    handleRowRightClick,
  };

  const pluginState: Record<string, never> = {};
  if(plugins && plugins.length) {
    let rows = instance.data;
    for (const plugin of plugins) {
      const { rows: newRows, state, api } = plugin(instance);
      rows = newRows;
      Object.assign(pluginState, { state, api });
    }
    instance.data = rows;
  }

  return {
    ...instance,
    ...pluginState,
  };
}
