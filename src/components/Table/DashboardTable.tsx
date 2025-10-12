import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import DataTable from "@/components/Table/DataTable";
import { Column, useDataTable } from "@/components/Table/hooks/useDataTable";
import { paginationPlugin } from "@/components/Table/plugins";

export default function DashboardTable({ urls }: { urls: UserUrl[] }) {
  const router = useRouter();
  const locale = router.locale ?? 'en';

  const [data, setData] = useState<UserUrl[]>(urls);

  const columns: Column<UserUrl>[] = useMemo(() => [
    // { key: "title", label: "TÍTULO" },
    {
      key: "destination",
      label: "URL",
      cellClassName: "text-indigo-600 font-medium truncate max-w-[200px]",
      render: row => <span title={row.destination}>{row.destination}</span>,
    },
    // { key: "clicks", label: "CLICKS", sortable: true, render: (row) => (
    //     <Tag color="bg-green-100 text-green-700">{row.clicks}</Tag>) },
    {
      key: "utm_source",
      label: "SOURCE",
      sortable: true,
      render: (row) => {
        // console.log(cell);
        return <Tag color="bg-indigo-100 text-indigo-700">{row.utm_source}</Tag>;
      },
    },
    {
      key: "utm_medium",
      label: "MEDIUM",
      sortable: true,
      render: (row) => <Tag color="bg-purple-100 text-purple-700">{row.utm_medium}</Tag>,
    },
    {
      key: "utm_campaign",
      label: "CAMPAIGN",
      sortable: true,
      render: (row) => <Tag color="bg-orange-100 text-orange-700">{row.utm_campaign}</Tag>,
    },
    {
      key: "created_at",
      label: "FECHA",
      sortable: true,
      render: (row) => (new Date(row.created_at)).toLocaleDateString(locale),
    },
  ], [locale]);

  const table = useDataTable<UserUrl>({
    data,
    columns,
    selectable: true,
    plugins: [paginationPlugin(5)]
  });

  const sliceText = (text: string, max: number) => {
    return text.length > max ? text.slice(0, max) + '...' : text;
  }

  const onClickEdit = (row: UserUrl) => {
    return () => {
      console.log('Edit!', row);
    }
  }

  const onClickRemove = (row: UserUrl) => {
    return () => {
      console.log('Remove!', row);
    }
  }

  return <DataTable table={table} />;
}

const Tag = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span
    className={`px-2 py-0.5 text-[11px] rounded-full font-medium ${color} whitespace-nowrap`}
  >
    {children}
  </span>
);

type UserUrl = {
  id: number;
  slug: string;
  destination: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

