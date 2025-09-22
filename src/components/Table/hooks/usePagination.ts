import { useMemo, useState, useCallback } from "react";
import { DataTableInstance } from "@/components/Table/hooks/useDataTable";

export interface UsePaginationOptions<T> {
  // data: T[];
  pageSize?: number;
}

export interface UsePaginationResult<T> {
  page: number;
  totalPages: number;
  rows: T[];
  nextPage: () => void;
  prevPage: () => void;
  setPage: (page: number) => void;
}

type TableType<T> = DataTableInstance<T>;

export function usePagination<T>(table: TableType<T>, { pageSize }: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [page, setPage] = useState(1);

  const data = useMemo(() => table.data, [table.data]);

  const totalPages = useMemo(() => {
    if (!pageSize) return 1;
    return Math.ceil(data.length / pageSize);
  }, [data, pageSize]);

  const rows = useMemo(() => {
    if (!pageSize) return data;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const nextPage = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages)),
    [totalPages]
  );

  const prevPage = useCallback(
    () => setPage((p) => Math.max(p - 1, 1)),
    []
  );

  return {
    page,
    totalPages,
    rows,
    nextPage,
    prevPage,
    setPage,
  };
}
