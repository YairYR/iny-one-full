import type React from "react";
import type { SearchField } from "./types";

interface Props {
  title: string;
  subtitle: string;
  searchLabel: string;
  searchFieldLabel: string;
  searchAll: string;
  headers: { short: string; name: string; destination: string };
  rowSizeLabel: string;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  query: string;
  onQueryChange: (value: string) => void;
  searchField: SearchField;
  onSearchFieldChange: (value: SearchField) => void;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export function TableToolbar({
  title, subtitle, searchLabel, searchFieldLabel, searchAll, headers, rowSizeLabel,
  pageSize, onPageSizeChange, query, onQueryChange, searchField, onSearchFieldChange, badge, disabled = false,
}: Readonly<Props>) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <h2 id="links-title" className="text-base font-semibold">{title}</h2>
        <span className="text-sm text-gray-500">· {subtitle}</span>
        {badge}
      </div>
      <div className={`grid gap-2 lg:w-[36rem] ${onPageSizeChange ? "sm:grid-cols-[minmax(200px,1fr)_minmax(140px,170px)_88px]" : "sm:grid-cols-[minmax(200px,1fr)_minmax(140px,170px)]"}`}>
        <div>
          <label htmlFor="links-search" className="block text-xs font-medium text-gray-600">{searchLabel}</label>
          <input
            id="links-search"
            type="search"
            value={query}
            disabled={disabled}
            onChange={(event) => onQueryChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>
        <div>
          <label htmlFor="links-search-field" className="block text-xs font-medium text-gray-600">{searchFieldLabel}</label>
          <select
            id="links-search-field"
            value={searchField}
            disabled={disabled}
            onChange={(event) => onSearchFieldChange(event.target.value as SearchField)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="all">{searchAll}</option>
            <option value="short">{headers.short}</option>
            <option value="name">{headers.name}</option>
            <option value="destination">{headers.destination}</option>
          </select>
        </div>
        {onPageSizeChange && (
          <div>
            <label htmlFor="links-row-size" className="block text-xs font-medium text-gray-600">{rowSizeLabel}</label>
            <select
              id="links-row-size"
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-gray-300 bg-surface px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              {[5, 10, 20].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
