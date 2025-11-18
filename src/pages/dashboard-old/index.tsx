import type { GetServerSidePropsContext } from 'next';

import LayoutMain from "@/components/layouts/LayoutMain";
import { AppProvider, useAppContext } from "@/contexts/app.context";
import React, { useEffect, useState } from "react";
import { UserClient } from "@/lib/types";
import { SkeletonTable } from "@/components/Skeleton/Skeleton";
import { Transition } from "@headlessui/react";
import { getCurrentUser, getUserUrls } from "@/lib/utils/query";
import { createClient } from "@/utils/supabase/server";
import { UserDashboard } from "@/features/dashboard/containers/UserDashboard";
import { UserUrl } from "@/features/dashboard/types/types";

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
        {showComponent && <UserDashboard urls={urls} stats={[]} />}
      </div>
    </LayoutMain>
  )
}

interface Props {
  user: UserClient;
  urls: UserUrl[];
}

export default function index({ user, urls }: Props) {
  return (
    // <AppProvider user={user}>
      <DashboardPage urls={urls}/>
    // </AppProvider>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context)
  const { user, raw } = await getCurrentUser(supabase);

  if (!user) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  const { data: urls } = await getUserUrls(raw.id);

  console.log({
    raw,
    urls
  })

  return {
    props: {
      user,
      urls: urls ?? []
    }
  };
}
