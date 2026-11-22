import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@headlessui/react";
import {
  type ColumnDef, type ColumnSizingState, type Row, type SortingState,
  flexRender, getCoreRowModel, getSortedRowModel, useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Link from "@/components/LocalizedLink";
import { ITool, LinkTools } from "@/features/dashboard/components/LinksTable/LinkTools";
import { UserUrl } from "@/features/dashboard/types/types";
import { ROUTES } from "@/lib/routes";
import { localizedPath } from "@/i18n/routes";

type SearchField = 'all' | 'short' | 'name' | 'destination';

interface Props {
  links: UserUrl[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpen?: (link: UserUrl) => void;
  onEdit: (link: UserUrl) => void;
  onQr?: (link: UserUrl) => void;
  permissions?: {
    canEdit: boolean;
    canViewStats: boolean;
  };
}

function LinkRow({ row, tools }: Readonly<{ row: Row<UserUrl>; tools: ITool<UserUrl>[] }>) {
  const menuRef = useRef<HTMLButtonElement>(null);

  return (
    <tr className="group" onContextMenu={(event) => {
      if (!menuRef.current) return;
      event.preventDefault();
      if (menuRef.current.getAttribute('aria-expanded') !== 'true') menuRef.current.click();
      menuRef.current.focus();
    }}>
      {row.getVisibleCells().map((cell) => {
        const isFirst = cell.column.id === 'short';
        const isActions = cell.column.id === 'actions';
        const Cell = isFirst ? 'th' : 'td';
        return (
          <Cell key={cell.id} scope={isFirst ? 'row' : undefined} className={`${isFirst ? 'sticky left-0 z-10 shadow-[2px_0_0_rgba(229,231,235,0.8)]' : isActions ? 'sticky right-0 z-10 shadow-[-2px_0_0_rgba(229,231,235,0.8)]' : ''} border-b border-gray-200 bg-white px-3 py-2.5 text-left group-hover:bg-gray-50`}>
            {isFirst ? (
              <span className="block min-w-0 truncate font-medium" title={`iny.one/${row.original.slug}`}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
            ) : isActions ? (
              <div className="flex justify-center">
                <LinkTools tools={tools} link={row.original} buttonRef={menuRef} linkLabel={row.original.slug} />
              </div>
            ) : (
              <div className="truncate" title={cell.column.id === 'destination' ? row.original.destination : undefined}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            )}
          </Cell>
        );
      })}
    </tr>
  );
}

export function LinksTable({ links, total, page, totalPages, onPageChange, onOpen, onEdit, onQr, permissions = { canEdit: false, canViewStats: false } }: Readonly<Props>) {
  const t = useTranslations('DashboardPage');
  const format = useFormatter();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('all');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [rowSize, setRowSize] = useState(20);
  const [copyStatus, setCopyStatus] = useState<'success' | 'error' | null>(null);

  const onClickCopy = useCallback(async (link: UserUrl) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${link.slug}`);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
  }, []);

  const tools: ITool<UserUrl>[] = useMemo(() => [
    { key: 'copy', text: t('tools.copy'), onClick: (_e, link) => onClickCopy(link) },
    { key: 'edit', text: t('tools.edit'), disabled: !permissions.canEdit, disabledReason: t('tools.planUnavailable'), onClick: (_e, link) => onEdit(link) },
    { key: 'stats', text: t('tools.stats'), disabled: !permissions.canViewStats, disabledReason: t('tools.planUnavailable'), onClick: (_e, link) => onOpen?.(link) },
    { key: 'details', text: t('tools.details'), disabled: !permissions.canViewStats, disabledReason: t('tools.planUnavailable'), onClick: (_e, link) => {
      const url = `${localizedPath(ROUTES.DASHBOARD_LINK_DETAILS, locale)}?id=${encodeURIComponent(link.link_id)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } },
    { key: 'qr', text: t('tools.qr'), disabled: !permissions.canViewStats, disabledReason: t('tools.planUnavailable'), onClick: (_e, link) => onQr?.(link) },
  ], [t, locale, onClickCopy, onEdit, onOpen, onQr, permissions]);

  const collator = useMemo(() => new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }), [locale]);
  const columns = useMemo<ColumnDef<UserUrl>[]>(() => [
    {
      id: 'short', accessorFn: (link) => link.slug, header: t('table.links.headers.short'),
      cell: ({ getValue }) => <SpanShortLink hostname={'iny.one'} slug={getValue<string>()} />,
      size: 160, minSize: 150, maxSize: 340,
      sortingFn: (a, b, id) => collator.compare(a.getValue(id), b.getValue(id)),
    },
    {
      id: 'name', accessorFn: (link) => link.alias ?? undefined, header: t('table.links.headers.name'),
      cell: ({ getValue }) => getValue<string | undefined>() ?? '—', size: 160, minSize: 100, maxSize: 400,
      sortUndefined: 'last', sortingFn: (a, b, id) => collator.compare(a.getValue(id), b.getValue(id)),
    },
    {
      id: 'destination', accessorKey: 'destination', header: t('table.links.headers.destination'),
      size: 300, minSize: 120, maxSize: 600,
      sortingFn: (a, b, id) => collator.compare(a.getValue(id), b.getValue(id)),
    },
    {
      id: 'clicks', accessorFn: (link) => link.clicks ?? undefined, header: t('table.links.headers.clicks'),
      cell: ({ getValue }) => {
        const value = getValue<number | undefined>();
        return value === undefined ? t('noData') : format.number(value);
      },
      size: 110, minSize: 90, maxSize: 220, sortUndefined: 'last', sortingFn: 'basic',
    },
    {
      id: 'created', accessorFn: (link) => Date.parse(link.created_at), header: t('table.links.headers.created'),
      cell: ({ getValue }) => format.dateTime(new Date(getValue<number>()), {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
      }),
      size: 190, minSize: 140, maxSize: 300,
    },
    {
      id: 'actions', header: t('table.links.headers.actions'),
      cell: () => null, size: 64, minSize: 64, maxSize: 64, enableSorting: false, enableResizing: false,
    },
  ], [collator, format, t]);

  const visibleLinks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);
    return links.filter((link) => {
      const fields = { short: link.slug, name: link.alias ?? '', destination: link.destination };
      return (searchField === 'all' ? Object.values(fields) : [fields[searchField]])
        .some((value) => value.toLocaleLowerCase(locale).includes(normalizedQuery));
    });
  }, [links, locale, query, searchField]);

  const listedLinks = useMemo(() => visibleLinks.slice(0, rowSize), [visibleLinks, rowSize]);

  const table = useReactTable({
    data: listedLinks, columns, state: { sorting, columnSizing },
    onSortingChange: setSorting, onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getRowId: (link) => link.link_id, enableMultiSort: false, columnResizeMode: 'onChange',
  });

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm" aria-labelledby="links-title">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="links-title" className="text-lg font-semibold">{t('table.links.title')}</h2>
          <div className="text-sm text-gray-500">{t('table.links.subtitle', { value: total })}</div>
        </div>
        {total > 0 && <>
          <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(220px,1fr)_minmax(150px,180px)_92px]">
            <div>
              <label htmlFor="links-search" className="block text-sm font-medium text-gray-700">{t('table.links.search')}</label>
              <input id="links-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
            </div>
            <div>
              <label htmlFor="links-search-field" className="block text-sm font-medium text-gray-700">{t('table.links.searchField')}</label>
              <select id="links-search-field" value={searchField} onChange={(event) => {
                const value = event.target.value;
                if (value === 'all' || value === 'short' || value === 'name' || value === 'destination') setSearchField(value);
              }}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600">
                <option value="all">{t('table.links.searchAll')}</option>
                <option value="short">{t('table.links.headers.short')}</option>
                <option value="name">{t('table.links.headers.name')}</option>
                <option value="destination">{t('table.links.headers.destination')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="links-row-size" className="block text-sm font-medium text-gray-700">{t('table.links.rowSize')}</label>
              <select id="links-row-size" value={rowSize} onChange={(event) => setRowSize(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600">
                {[5, 10, 20].map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span>{t('table.links.pageOnly')} {t('table.links.resizeHelp')}</span>
            <button type="button" onClick={() => table.resetColumnSizing()} className="font-medium text-indigo-700 underline focus-visible:outline-2 focus-visible:outline-indigo-600">{t('table.links.resetWidths')}</button>
          </div>
        </>}
        <p className="mt-2 text-sm text-gray-500">{t('table.links.clicksNote')}</p>
        <p role="status" className={`mt-2 text-sm ${copyStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {copyStatus && t(copyStatus === 'success' ? 'tools.copied' : 'tools.copyError')}
        </p>
      </div>

      {visibleLinks.length === 0 ? (
        <div className="p-6 text-sm text-gray-600">
          <p>{total === 0 ? t('table.links.empty') : t('table.links.noResults')}</p>
          {total === 0 && <Link href={ROUTES.HOME} className="mt-3 inline-block font-medium text-indigo-600 underline">{t('button.newLink')}</Link>}
        </div>
      ) : (
        <div role="region" aria-labelledby="links-title" tabIndex={0} className="max-h-[28rem] overflow-auto focus-visible:outline-2 focus-visible:outline-indigo-600">
          <table className="table-fixed border-separate border-spacing-0 text-left text-sm" style={{ width: table.getTotalSize() }}>
            <colgroup>{table.getVisibleLeafColumns().map((column) => <col key={column.id} style={{ width: column.getSize() }} />)}</colgroup>
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => {
                    const column = header.column;
                    const direction = column.getIsSorted();
                    const label = String(column.columnDef.header);
                    return (
                      <th key={header.id} scope="col" aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
                        className={`${column.id === 'short' ? 'left-0 z-40 shadow-[2px_0_0_rgba(229,231,235,0.8)]' : column.id === 'actions' ? 'right-0 z-40 shadow-[-2px_0_0_rgba(229,231,235,0.8)]' : 'z-30'} sticky top-0 border-b border-gray-200 bg-gray-50 px-3 py-2 text-left ${column.id !== 'actions' ? 'pr-6' : 'text-center'}`}>
                        {column.id === 'actions' ? (
                          <span className="sr-only">{flexRender(column.columnDef.header, header.getContext())}</span>
                        ) : (
                          <button type="button" onClick={column.getToggleSortingHandler()} className="flex items-center gap-1 whitespace-nowrap text-left font-semibold hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-600">
                            {flexRender(column.columnDef.header, header.getContext())}
                            {direction === 'asc' ? <ArrowUp size={15} aria-hidden="true" /> : direction === 'desc' ? <ArrowDown size={15} aria-hidden="true" /> : <ArrowUpDown size={15} className="text-gray-400" aria-hidden="true" />}
                          </button>
                        )}
                        {column.id !== 'actions' && <div role="separator" aria-orientation="vertical" aria-label={t('table.links.resize', { column: label })}
                            aria-valuemin={column.columnDef.minSize} aria-valuemax={column.columnDef.maxSize} aria-valuenow={column.getSize()} tabIndex={0}
                            aria-valuetext={`${column.getSize()} px`}
                            onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}
                            onKeyDown={(event) => {
                              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                              event.preventDefault();
                              const min = column.columnDef.minSize ?? 20;
                              const max = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
                              const size = Math.max(min, Math.min(max, column.getSize() + (event.key === 'ArrowRight' ? 10 : -10)));
                              setColumnSizing((current) => ({ ...current, [column.id]: size }));
                            }}
                            className="absolute inset-y-0 right-0 w-3 cursor-col-resize touch-none border-r-2 border-transparent hover:border-indigo-600 focus-visible:border-indigo-600 focus-visible:outline-none" />}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>{table.getRowModel().rows.map((row) => <LinkRow key={row.id} row={row} tools={tools} />)}</tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-sm" aria-label={t('table.links.pagination.label')}>
          <span className="text-gray-500">{t('table.links.pagination.status', { page, pages: totalPages })}</span>
          <div className="flex items-center gap-1.5">
            <Button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}
              aria-label={t('table.links.pagination.previous')}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 text-gray-700 enabled:cursor-pointer enabled:hover:border-indigo-300 enabled:hover:bg-indigo-50 enabled:hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft size={16} aria-hidden="true" /><span className="hidden sm:inline">{t('table.links.pagination.previous')}</span>
            </Button>
            <Button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
              aria-label={t('table.links.pagination.next')}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 text-gray-700 enabled:cursor-pointer enabled:hover:border-indigo-300 enabled:hover:bg-indigo-50 enabled:hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
              <span className="hidden sm:inline">{t('table.links.pagination.next')}</span><ChevronRight size={16} aria-hidden="true" />
            </Button>
          </div>
        </nav>
      )}
    </section>
  );
}

function SpanShortLink({ hostname, slug }: Readonly<{ hostname: string, slug: string }>) {
  return <p className="text-sm text-gray-900"><span className="text-xs text-gray-500">{hostname}/</span>{slug}</p>;
}