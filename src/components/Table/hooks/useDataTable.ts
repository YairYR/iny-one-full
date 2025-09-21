import type React from 'react';
import { useMemo, useState } from "react";

export interface Column<T> {
  key: keyof T;
  label: React.ReactNode;
  sortable?: boolean;
  render?: (row: T, cell: {
    rowIndex: number;
    selected: boolean;
    column: Column<T>;
  }) => React.ReactNode; // 👈 render personalizado
  className?: string;
  cellClassName?: string;
}

export interface UseDataTableOptions<T> {
  data: T[];
  columns: Column<T>[];
  selectable?: boolean;
  pageSize?: number;
  onRowDoubleClick?: (row: T) => void;
  onRowRightClick?: (row: T, event: React.MouseEvent) => void;
  onRowSelect?: (selectedRows: T[]) => void;
}

export function useDataTable<T extends { id: string | number }>(
  options: UseDataTableOptions<T>
) {
  const {
    data,
    columns,
    selectable = false,
    pageSize: initialPageSize,
    onRowDoubleClick,
    onRowRightClick,
    onRowSelect
  } = options;

  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize ?? data.length);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!pageSize) return sortedData;
    const start = pageIndex * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageIndex, pageSize]);

  const pageCount = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: keyof T) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "asc" });
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

  const nextPage = () => {
    setPageIndex((i) => Math.min(i + 1, pageCount - 1));
  };

  const prevPage = () => {
    setPageIndex((i) => Math.max(i - 1, 0));
  };

  return {
    columns,
    data: paginatedData,
    selectable,
    sortConfig,
    selectedRows,
    pageIndex,
    pageSize,
    pageCount,
    handleSort,
    toggleRowSelection,
    handleRowDoubleClick,
    handleRowRightClick,
    setPageIndex,
    setPageSize,
    nextPage,
    prevPage,
  };
}
