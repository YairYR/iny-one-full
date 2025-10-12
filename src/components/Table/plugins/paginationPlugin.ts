import { DataTableInstance, TablePlugin, TablePluginFunc } from "@/components/Table/hooks/useDataTable";

export type PaginationPluginResult<T> = TablePluginFunc<T, PaginationPlugin<T>['state'], PaginationPlugin<T>['api']>;

export type PaginationPlugin<T> =  TablePlugin<T, {
  page: number;
  totalPages: number;
}, {
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}>;

export function paginationPlugin<T>(pageSize: number): PaginationPluginResult<T> {
  return (table: DataTableInstance<T>) => {
    const { data: rows } = table;
    let page = 1;
    const totalPages = Math.ceil(rows.length / pageSize);

    const setPage = (p: number) => {
      page = Math.max(1, Math.min(p, totalPages));
    };
    const nextPage = () => {
      page = Math.min(page + 1, totalPages);
    };
    const prevPage = () => {
      page = Math.max(page - 1, 1);
    };

    const start = (page - 1) * pageSize;
    const paginatedRows = rows.slice(start, start + pageSize);

    return {
      name: 'pagination',
      rows: paginatedRows,
      state: { page, totalPages },
      api: { setPage, nextPage, prevPage },
    };
  };
}
