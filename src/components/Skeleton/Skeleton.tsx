import React from "react";
import type { CSSProperties } from "react";

export interface SkeletonBlockProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
  style?: CSSProperties;
}

export function SkeletonBlock({ className = "h-4 w-full", rounded = "md", style }: Readonly<SkeletonBlockProps>) {
  const roundedClass = { sm: "rounded-sm", md: "rounded", lg: "rounded-lg", full: "rounded-full" }[rounded];
  return <span aria-hidden="true" style={style} className={`block animate-pulse bg-gray-200 ${roundedClass} ${className}`} />;
}

export function SkeletonCard({ className = "", lines = 3 }: Readonly<{ className?: string; lines?: number }>) {
  return (
    <div aria-hidden="true" className={`rounded-xl border border-gray-200 bg-surface p-4 ${className}`}>
      <SkeletonBlock className="h-4 w-1/3" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <SkeletonBlock key={index} className={`h-4 ${index === lines - 1 ? "w-1/2" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonKpi({ emphasized = false, className = "" }: Readonly<{ emphasized?: boolean; className?: string }>) {
  return (
    <div aria-hidden="true" className={`rounded-xl border px-4 py-3 ${emphasized ? "border-indigo-100 bg-indigo-50" : "border-gray-200 bg-surface"} ${className}`}>
      <SkeletonBlock className="h-3 w-2/3" />
      <SkeletonBlock className="mt-2 h-6 w-1/3" />
    </div>
  );
}

export function SkeletonChart({ className = "h-48 lg:h-[clamp(11rem,24dvh,15rem)]", bars = 7 }: Readonly<{ className?: string; bars?: number }>) {
  const heights = ["35%", "58%", "46%", "72%", "63%", "88%", "78%"];
  return (
    <div aria-hidden="true" className={`flex items-end gap-2 ${className}`}>
      {Array.from({ length: bars }, (_, index) => (
        <SkeletonBlock
          key={index}
          className="flex-1"
          rounded="sm"
          style={{ height: bars === 1 ? "100%" : heights[index % heights.length] }}
        />
      ))}
    </div>
  );
}

export function SkeletonRectangle() {
  return (
    <div className="p-4 bg-surface rounded-md shadow-md">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
    </div>
  );
}

/** INACTIVO: exportado pero sin referencias en el repositorio (rev. 2026-08-09). */
export function SkeletonCircle() {
  return (
    <div className="p-4 bg-surface rounded-md shadow-md flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
}

/** INACTIVO: exportado pero sin referencias en el repositorio (rev. 2026-08-09). */
export function SkeletonTriangle() {
  return (
    <div className="p-4 bg-surface rounded-md shadow-md flex items-center space-x-4">
      <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-16 border-b-gray-300 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
}

/** INACTIVO: exportado pero sin referencias en el repositorio (rev. 2026-08-09). */
export function SkeletonUser() {
  return (
    <div className="animate-pulse flex space-x-4">
      <div className="rounded-full bg-gray-300 h-10 w-10"></div>
      <div className="flex-1 space-y-6 py-1">
        <div className="h-2 bg-gray-300 rounded"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-2 bg-gray-300 rounded col-span-2"></div>
            <div className="h-2 bg-gray-300 rounded col-span-1"></div>
          </div>
          <div className="h-2 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  )
}

/** INACTIVO: exportado pero sin referencias en el repositorio (rev. 2026-08-09). */
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  columnWidths?: readonly (number | string)[];
  minWidth?: number | string;
  maxHeight?: number | string;
  className?: string;
  showHeader?: boolean;
  stickyHeader?: boolean;
  labelledBy?: string;
}

export function SkeletonTable({
  rows = 2,
  columns = 3,
  columnWidths,
  minWidth,
  maxHeight,
  className = "",
  showHeader = true,
  stickyHeader = false,
  labelledBy,
}: Readonly<SkeletonTableProps>) {
  const rowArray = rows > 0 ? Array.from({ length: rows }) : [];
  const widthAt = (index: number) => columnWidths?.[index] ?? undefined;
  const style = {
    ...(minWidth != null ? { minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth } : {}),
    ...(maxHeight != null ? { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } : {}),
  };
  return (
    <div
      role="region"
      aria-busy="true"
      aria-labelledby={labelledBy}
      className={`w-full overflow-auto ${className}`}
      style={style}
    >
      <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm" style={{ tableLayout: "fixed" }}>
        {columnWidths && (
          <colgroup>
            {Array.from({ length: columns }, (_, index) => (
              <col key={index} style={{ width: typeof widthAt(index) === "number" ? `${widthAt(index)}px` : widthAt(index) }} />
            ))}
          </colgroup>
        )}
        {showHeader && (
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`border-b border-gray-200 bg-gray-50 px-3 py-2 ${stickyHeader ? "sticky top-0 z-30" : ""}`}
                >
                  <SkeletonBlock className={`h-4 ${index % 3 === 0 ? "w-3/4" : index % 3 === 1 ? "w-1/2" : "w-full"}`} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rowArray.map((_, rowIndex) => (
            <tr key={rowIndex} aria-hidden="true">
              {Array.from({ length: columns }, (_, columnIndex) => (
                <td key={columnIndex} className="border-b border-gray-200 px-3 py-3">
                  <SkeletonBlock className={`h-4 ${(rowIndex + columnIndex) % 3 === 0 ? "w-3/4" : (rowIndex + columnIndex) % 3 === 1 ? "w-full" : "w-1/2"}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}