import type { GetServerSidePropsContext } from 'next'

import LayoutMain from "@/components/layouts/LayoutMain";
import { AppProvider, useAppContext } from "@/contexts/app.context";
import React, { useMemo } from "react";
import { UserClient } from "@/lib/types";
import { useRouter } from "next/router";
import DataTable from "@/components/Table/DataTable";
import { Column } from "@/components/Table/hooks/useDataTable";

function DashboardPage({ urls }: { urls: UserUrl[] }) {
  const { user } = useAppContext();
  const router = useRouter();
  const locale = router.locale ?? 'en';

  const columns: Column<UserUrl>[] = useMemo(() => [
    // { key: "title", label: "TÍTULO" },
    { key: "destination", label: "URL",
      cellClassName: "text-indigo-600 font-medium truncate max-w-[200px]",
      render: row => <span title={row.destination}>{row.destination}</span> },
    // { key: "clicks", label: "CLICKS", sortable: true, render: (row) => (
    //     <Tag color="bg-green-100 text-green-700">{row.clicks}</Tag>) },
    { key: "utm_source", label: "SOURCE",
      sortable: true,
      render: (row) => <Tag color="bg-indigo-100 text-indigo-700">{row.utm_source}</Tag> },
    { key: "utm_medium", label: "MEDIUM",
      sortable: true,
      render: (row) => <Tag color="bg-purple-100 text-purple-700">{row.utm_medium}</Tag> },
    { key: "utm_campaign", label: "CAMPAIGN",
      sortable: true, render: (row) => (
        <Tag color="bg-orange-100 text-orange-700">{row.utm_campaign}</Tag>) },
    { key: "created_at", label: "FECHA", sortable: true,
      render: (row) => (new Date(row.created_at)).toLocaleDateString(locale, {}) },
  ], [locale]);

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

  return (
    <LayoutMain>
      <h1>Hello, {user?.email || 'user'}!</h1>

      <div className="p-6">
        <DataTable<UserUrl> data={urls} columns={columns} pageSize={5} selectable={true} />
      </div>
    </LayoutMain>
  )
}

type UserUrl = {
  id: number;
  slug: string;
  destination: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

interface Props {
  user: UserClient;
  urls: UserUrl[];
}

export default function index({ user, urls }: Props) {
  return (
    <AppProvider user={user}>
      <DashboardPage urls={urls}/>
    </AppProvider>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // const supabase = createClient(context)
  // const { user, raw } = await getCurrentUser(supabase);

  const { user, urls } = {
    "user": {
      "email": "baladaphilippe@gmail.com",
      "name": "Harstat",
      "picture": "https://lh3.googleusercontent.com/a/ACg8ocI92KecHXXMdtj2yMDnX0Yo5Y1m8QDavtY9JUo2NiFTCeI59z3w=s96-c",
      "created_at": "2025-08-12T00:15:02.903732Z"
    },
    "urls": [
      {
        id: 1,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 2,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 3,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 4,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 5,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 6,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 7,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 8,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 9,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 10,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 11,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 12,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        id: 13,
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
    ]
  };

  if (!user) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  // const { data: urls } = await getUserUrls(raw.id);

  return {
    props: {
      user,
      urls: urls ?? []
    }
  };
}

const Tag = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span
    className={`px-2 py-0.5 text-[11px] rounded-full font-medium ${color} whitespace-nowrap`}
  >
    {children}
  </span>
);