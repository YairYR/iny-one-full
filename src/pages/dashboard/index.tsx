import type { GetServerSidePropsContext } from 'next'

import LayoutMain from "@/components/layouts/LayoutMain";
import { AppProvider, useAppContext } from "@/contexts/app.context";
import React from "react";
import { UserClient } from "@/lib/types";
import { useRouter } from "next/router";
import { toLocaleDate } from "@/utils/date";
import CustomTable, { DemoTabla } from "@/components/Table/CustomTable";

function DashboardPage({ urls }: { urls: UserUrl[] }) {
  const { user } = useAppContext();
  const router = useRouter();
  const locale = router.locale ?? 'en';

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
        <CustomTable<UserUrl>
          data={urls}
          columns={[
            { key: 'slug', header: 'Slug' },
            { key: 'destination', header: 'Destination' },
            { key: 'created_at', header: 'Created At', accessor: (row) => toLocaleDate(locale, row.created_at) },
            { key: 'actions', header: 'Actions', accessor: (row) => (
                <>
                  {/*<a href="#"*/}
                  {/*   className="font-medium text-blue-600 dark:text-blue-500 hover:underline"*/}
                  {/*   onClick={onClickEdit(row)}*/}
                  {/*>Edit</a>*/}
                  <a href="#"
                     className="font-medium text-red-600 dark:text-red-500 hover:underline ms-3"
                     onClick={onClickRemove(row)}
                  >Remove</a>
                </>
              )}
          ]}></CustomTable>
      </div>

      {/*<div className="relative overflow-hidden shadow-md rounded-lg">*/}
      {/*  <table className="table-fixed w-full text-left">*/}
      {/*    <thead className="uppercase bg-[#6b7280] text-[#e5e7eb]" style={{ backgroundColor: '#6b7280', color: '#e5e7eb' }}>*/}
      {/*      <tr>*/}
      {/*        <td className="py-1 border  border-gray-300 text-center  p-4">Slug</td>*/}
      {/*        <td className="py-1 border  border-gray-300 text-center  p-4">Destination</td>*/}
      {/*        <td className="py-1 border  border-gray-300 text-center  p-4">Created At</td>*/}
      {/*      </tr>*/}
      {/*    </thead>*/}
      {/*    <tbody className="bg-white text-gray-500 bg-[#FFFFFF] text-[#6b7280]"*/}
      {/*           style={{ backgroundColor: '#FFFFFF', color: '#6b7280' }}>*/}

      {/*      /!*<tr className="py-1">*!/*/}
      {/*      /!*  <td className=" py-5 border  border-gray-300 text-center  p-4">YY-853581</td>*!/*/}
      {/*      /!*  <td className=" py-5 border  border-gray-300 text-center  p-4">Notebook Basic</td>*!/*/}
      {/*      /!*  <td className=" py-5 border  border-gray-300 text-center  p-4">$ 299</td>*!/*/}
      {/*      /!*</tr>*!/*/}

      {/*      /!*<tr className="py-1" style={{ backgroundColor: 'rgb(234, 234, 234)', color: 'rgb(107, 114, 128)' }}>*!/*/}
      {/*      /!*  <td className=" py-5 border  border-gray-300 text-center  p-4">YY-853599</td>*!/*/}
      {/*      /!*  <td className=" py-5 border  border-gray-300 text-center  p-4">Notebook Pro</td>*!/*/}
      {/*      /!*  <td className=" py-5 border  border-gray-300 text-center  p-4">$ 849</td>*!/*/}
      {/*      /!*</tr>*!/*/}

      {/*      {urls.map((url, index) => (*/}
      {/*        <tr className="py-1" key={index}>*/}
      {/*          <td className=" py-5 border  border-gray-300 text-center  p-4">{url.slug}</td>*/}
      {/*          <td className=" py-5 border  border-gray-300 text-center  p-4">{url.destination}</td>*/}
      {/*          <td className=" py-5 border  border-gray-300 text-center  p-4">{url.created_at}</td>*/}
      {/*        </tr>*/}
      {/*      ))}*/}

      {/*    </tbody>*/}
      {/*  </table>*/}
      {/*</div>*/}


      {/*<div className="relative overflow-x-auto shadow-md sm:rounded-lg">*/}
      {/*  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">*/}
      {/*    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">*/}
      {/*    <tr className="relative">*/}
      {/*      <th scope="col" className="p-4">*/}
      {/*        <div className="flex items-center">*/}
      {/*          <input id="checkbox-all-search" type="checkbox"*/}
      {/*                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>*/}
      {/*          <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>*/}
      {/*        </div>*/}
      {/*      </th>*/}
      {/*      <th scope="col" className="px-6 py-3">*/}
      {/*        Slug*/}
      {/*      </th>*/}
      {/*      <th scope="col" className="px-6 py-3">*/}
      {/*        Destination*/}
      {/*      </th>*/}
      {/*      <th scope="col" className="px-6 py-3">*/}
      {/*        Created At*/}
      {/*      </th>*/}
      {/*      <th scope="col" className="px-6 py-3">*/}
      {/*        Action*/}
      {/*      </th>*/}
      {/*    </tr>*/}
      {/*    </thead>*/}
      {/*    <tbody>*/}

      {/*      {urls.map((url, index) => (*/}
      {/*        <tr*/}
      {/*          key={url.slug + index}*/}
      {/*          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">*/}
      {/*          <td className="w-4 p-2">*/}
      {/*            <div className="flex items-center">*/}
      {/*              <input id="checkbox-table-search-1" type="checkbox"*/}
      {/*                     className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>*/}
      {/*              <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>*/}
      {/*            </div>*/}
      {/*          </td>*/}
      {/*          <td scope="row" className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{url.slug}</td>*/}
      {/*          <td className="px-3 py-2 border-gray-300 p-2 text-nowrap">{url.destination}</td>*/}
      {/*          <td className="px-3 py-2 border-gray-300 p-2 text-nowrap">{toLocaleDate(locale, url.created_at)}</td>*/}
      {/*          <td className="px-3 py-2 w-4">*/}
      {/*            <div className={`flex items-center`}>*/}
      {/*              <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>*/}
      {/*              <a href="#" className="font-medium text-red-600 dark:text-red-500 hover:underline ms-3">Remove</a>*/}
      {/*            </div>*/}
      {/*          </td>*/}
      {/*        </tr>*/}
      {/*      ))}*/}

      {/*    </tbody>*/}
      {/*  </table>*/}
      {/*</div>*/}


    </LayoutMain>
  )
}

type UserUrl = {
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

export default function Index({ user, urls }: Props) {
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
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
        "slug": "X_pi9t",
        "destination": "https://prueba.com/?utm_source=1&utm_medium=2&utm_campaign=3",
        "created_at": "2025-08-18T19:23:56.955207+00:00",
        "utm_source": "1",
        "utm_medium": "2",
        "utm_campaign": "3"
      },
      {
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