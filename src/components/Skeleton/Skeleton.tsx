import React from "react";

export function SkeletonRectangle() {
  return (
    <div className="p-4 bg-white rounded-md shadow-md">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-300 rounded mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
    </div>
  );
}

export function SkeletonCircle() {
  return (
    <div className="p-4 bg-white rounded-md shadow-md flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
}

export function SkeletonTriangle() {
  return (
    <div className="p-4 bg-white rounded-md shadow-md flex items-center space-x-4">
      <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-16 border-b-gray-300 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
}

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

export function SkeletonTable({ rows = 2 }: { rows?: number }) {
  const rowArray = (rows > 0) ? Array.from({ length: rows }) : [];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
        <tr>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </th>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </th>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
          </th>

        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {rowArray.map((_, i) => (
          (i % 2 === 0)
            ? (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-full"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </td>
              </tr>
            )
            : (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-full"></div>
                </td>
              </tr>
            )
          )
        )}
        </tbody>
      </table>
    </div>
  )
}