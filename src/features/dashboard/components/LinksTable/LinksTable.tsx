import React, { useCallback, useMemo, useState } from "react";
import {
  type ColumnSizingState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "@/components/LocalizedLink";
import { SkeletonTable } from "@/components/Skeleton/Skeleton";
import { ROUTES } from "@/lib/routes";
import { localizedPath } from "@/i18n/routes";
import type { UserUrl } from "@/features/dashboard/types/types";
import type { ITool } from "./LinkTools";
import { buildLinkColumns } from "./tableColumns";
import { TableToolbar } from "./TableToolbar";
import { TableRow } from "./TableRow";
import { TablePagination } from "./TablePagination";
import type { LinksTableProps, SearchField } from "./types";

export function LinksTable({
  links,
  total,
  page,
  totalPages,
  isLoading = false,
  onPageChange,
  pageSize = 20,
  onPageSizeChange,
  onOpen,
  onEdit,
  onQr,
  permissions = { canEdit: false, canViewStats: false },
  readOnlyReason,
  badge,
}: Readonly<LinksTableProps>) {
  const t = useTranslations("DashboardPage");
  const format = useFormatter();
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [copyStatus, setCopyStatus] = useState<"success" | "error" | null>(null);

  const onClickCopy = useCallback(async (link: UserUrl) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${link.slug}`);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  }, []);

  const goToLinkDetails = useCallback((_event: React.MouseEvent, link: UserUrl) => {
    const url = `${localizedPath(ROUTES.DASHBOARD_LINK_DETAILS, locale)}?id=${encodeURIComponent(link.link_id)}`;
    router.push(url);
  }, [locale, router]);

  const tools = useMemo<ITool<UserUrl>[]>(() => {
    const list: ITool<UserUrl>[] = [
      { key: "copy", text: t("tools.copy"), onClick: (_event, link) => onClickCopy(link) },
      { key: "edit", text: t("tools.edit"), disabled: !permissions.canEdit, disabledReason: t("tools.planUnavailable"), onClick: (_event, link) => onEdit(link) },
      { key: "stats", text: t("tools.stats"), disabled: !permissions.canViewStats, disabledReason: t("tools.planUnavailable"), onClick: (_event, link) => onOpen?.(link) },
      { key: "details", text: t("tools.details"), disabled: !permissions.canViewStats, disabledReason: t("tools.planUnavailable"), onClick: goToLinkDetails },
      { key: "qr", text: t("tools.qr"), disabled: !permissions.canViewStats, disabledReason: t("tools.planUnavailable"), onClick: (_event, link) => onQr?.(link) },
    ];
    return readOnlyReason
      ? list.map((tool) => ({ ...tool, disabled: true, disabledReason: readOnlyReason }))
      : list;
  }, [t, onClickCopy, onEdit, onOpen, onQr, permissions, goToLinkDetails, readOnlyReason]);

  const collator = useMemo(() => new Intl.Collator(locale, { numeric: true, sensitivity: "base" }), [locale]);
  const columns = useMemo(
    () => buildLinkColumns(t as (key: string) => string, format, collator),
    [t, format, collator],
  );

  const visibleLinks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);
    return links.filter((link) => {
      const fields = { short: link.slug, name: link.alias ?? "", destination: link.destination };
      return (searchField === "all" ? Object.values(fields) : [fields[searchField]])
        .some((value) => value.toLocaleLowerCase(locale).includes(normalizedQuery));
    });
  }, [links, locale, query, searchField]);

  const table = useReactTable({
    data: visibleLinks,
    columns,
    state: { sorting, columnSizing },
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (link) => link.link_id,
    enableMultiSort: false,
    columnResizeMode: "onChange",
  });

  const columnWidths = [160, 160, 300, 110, 190, 64];

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-surface" aria-labelledby="links-title">
      <div className="border-b border-gray-200 px-4 py-3">
        {total > 0 || isLoading ? (
          <TableToolbar
            title={t("table.links.title")}
            subtitle={t("table.links.subtitle", { value: total })}
            searchLabel={t("table.links.search")}
            searchFieldLabel={t("table.links.searchField")}
            searchAll={t("table.links.searchAll")}
            headers={{
              short: t("table.links.headers.short"),
              name: t("table.links.headers.name"),
              destination: t("table.links.headers.destination"),
            }}
            rowSizeLabel={t("table.links.rowSize")}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            query={query}
            onQueryChange={setQuery}
            searchField={searchField}
            onSearchFieldChange={setSearchField}
            badge={badge}
            disabled={isLoading}
          />
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <h2 id="links-title" className="text-base font-semibold">{t("table.links.title")}</h2>
            <span className="text-sm text-gray-500">· {t("table.links.subtitle", { value: total })}</span>
            {badge}
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>{t("table.links.clicksNote")}{total > 0 && <> {t("table.links.pageOnly")} {t("table.links.resizeHelp")}</>}</span>
          {(total > 0 || isLoading) && (
            <button type="button" disabled={isLoading} onClick={() => table.resetColumnSizing()} className="font-medium text-indigo-700 underline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline">
              {t("table.links.resetWidths")}
            </button>
          )}
        </div>
        <p role="status" className={isLoading ? "mt-2 text-xs font-medium text-gray-600" : copyStatus ? `mt-2 text-sm ${copyStatus === "error" ? "text-red-600" : "text-green-600"}` : "sr-only"}>
          {isLoading ? t("loading") : copyStatus && t(copyStatus === "success" ? "tools.copied" : "tools.copyError")}
        </p>
      </div>

      {isLoading && visibleLinks.length === 0 ? (
        <SkeletonTable
          rows={Math.min(Math.max(pageSize, 5), 10)}
          columns={6}
          columnWidths={columnWidths}
          minWidth={984}
          className="isolate h-[clamp(18rem,62dvh,44rem)]"
          stickyHeader
          labelledBy="links-title"
        />
      ) : visibleLinks.length === 0 ? (
        <div className="p-6 text-sm text-gray-600">
          <p>{total === 0 ? t("table.links.empty") : t("table.links.noResults")}</p>
          {total === 0 && <Link href={ROUTES.HOME} className="mt-3 inline-block font-medium text-indigo-600 underline">{t("button.newLink")}</Link>}
        </div>
      ) : (
        <div role="region" aria-labelledby="links-title" tabIndex={0} className="isolate h-[clamp(18rem,62dvh,44rem)] overflow-auto focus-visible:outline-2 focus-visible:outline-indigo-600">
          <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm" style={{ minWidth: table.getTotalSize() }}>
            <colgroup>
              {table.getVisibleLeafColumns().map((column) => (
                <col key={column.id} style={{ width: column.getSize() }} />
              ))}
            </colgroup>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="select-none">
                  {headerGroup.headers.map((header) => {
                    const column = header.column;
                    const direction = column.getIsSorted();
                    const label = String(column.columnDef.header);
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"}
                        className={`${column.id === "short" ? "left-0 z-40 shadow-[2px_0_0_rgba(229,231,235,0.8)]" : column.id === "actions" ? "right-0 z-40 shadow-[-2px_0_0_rgba(229,231,235,0.8)]" : "z-30"} relative sticky top-0 border-b border-gray-200 bg-gray-50 px-3 py-2 text-left ${column.id !== "actions" ? "pr-6" : "text-center"}`}
                      >
                        {column.id === "actions" ? (
                          <span className="sr-only">{flexRender(column.columnDef.header, header.getContext())}</span>
                        ) : (
                          <button type="button" onClick={column.getToggleSortingHandler()} className="flex items-center gap-1 whitespace-nowrap text-left font-semibold hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600">
                            {flexRender(column.columnDef.header, header.getContext())}
                            {direction === "asc"
                              ? <ArrowUp size={15} aria-hidden="true" />
                              : direction === "desc"
                                ? <ArrowDown size={15} aria-hidden="true" />
                                : <ArrowUpDown size={15} className="text-gray-400" aria-hidden="true" />}
                          </button>
                        )}
                        {column.id !== "actions" && (
                          <div
                            role="separator"
                            aria-orientation="vertical"
                            aria-label={t("table.links.resize", { column: label })}
                            aria-valuemin={column.columnDef.minSize}
                            aria-valuemax={column.columnDef.maxSize}
                            aria-valuenow={column.getSize()}
                            aria-valuetext={`${column.getSize()} px`}
                            tabIndex={0}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onKeyDown={(event) => {
                              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                              event.preventDefault();
                              const min = column.columnDef.minSize ?? 20;
                              const max = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
                              const size = Math.max(min, Math.min(max, column.getSize() + (event.key === "ArrowRight" ? 10 : -10)));
                              setColumnSizing((current) => ({ ...current, [column.id]: size }));
                            }}
                            className="absolute inset-y-0 right-0 w-3 cursor-col-resize touch-none border-r-2 border-transparent hover:border-indigo-600 focus-visible:border-indigo-600 focus-visible:outline-none"
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => <TableRow key={row.id} row={row} tools={tools} />)}
            </tbody>
          </table>
        </div>
      )}
      <TablePagination
        page={page}
        totalPages={totalPages}
        status={t("table.links.pagination.status", { page, pages: totalPages })}
        previous={t("table.links.pagination.previous")}
        next={t("table.links.pagination.next")}
        label={t("table.links.pagination.label")}
        disabled={isLoading}
        onPageChange={onPageChange}
      />
    </section>
  );
}
