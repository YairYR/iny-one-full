import { Menu, MenuButton, MenuItem, MenuItems, } from "@headlessui/react";
import Link from 'next/link';
import React from "react";
import { CurrentUserAvatar } from "@/features/auth/components/OAuth/CurrentUserAvatar";

interface Props {
  picture: string | null;
  fullname?: string | null;
}

export default function UserProfileMenu({ picture, fullname }: Readonly<Props>) {
  return (
    <Menu as="div" className="relative ml-3">
      <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer text-gray-400">
        <span className="absolute -inset-1.5" />
        <span className="sr-only">Open user menu</span>
        <CurrentUserAvatar picture={picture} fullname={fullname} />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        {/*<MenuItem>*/}
        {/*  <Link*/}
        {/*    href="#"*/}
        {/*    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"*/}
        {/*  >*/}
        {/*    Your profile*/}
        {/*  </Link>*/}
        {/*</MenuItem>*/}
        {/*<MenuItem>*/}
        {/*  <Link*/}
        {/*    href="#"*/}
        {/*    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"*/}
        {/*  >*/}
        {/*    Settings*/}
        {/*  </Link>*/}
        {/*</MenuItem>*/}
        <MenuItem>
          <Link
            href="/auth/logout"
            className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
          >
            Sign out
          </Link>
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}