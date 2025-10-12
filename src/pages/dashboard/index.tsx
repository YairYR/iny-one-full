import type { GetServerSidePropsContext } from 'next'
import dynamic from 'next/dynamic';

import LayoutMain from "@/components/layouts/LayoutMain";
import { AppProvider, useAppContext } from "@/contexts/app.context";
import React, { useEffect, useState } from "react";
import { UserClient } from "@/lib/types";
import { SkeletonTable } from "@/components/Skeleton/Skeleton";
import { Transition } from "@headlessui/react";

const DashboardTable = dynamic(() => import('@/components/Table/DashboardTable'), {
  ssr: false,
});

function DashboardPage({ urls }: { urls: UserUrl[] }) {
  const { user } = useAppContext();

  const [showComponent, setShowComponent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowComponent(true), 400);
  }, []);

  return (
    <LayoutMain>
      <h1>Hello, {user?.email || 'user'}!</h1>

      <div className="p-6">
        <Transition show={!showComponent}>
          <div className="relative">
            <div className="w-full transition duration-300 ease-in data-closed:opacity-0">
              <SkeletonTable rows={4} />
            </div>
          </div>
        </Transition>
        {showComponent && <DashboardTable urls={urls} />}
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
