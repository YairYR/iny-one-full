import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from 'next/link';
import React from "react";
import { CurrentUserAvatar } from "@/features/auth/components/OAuth/CurrentUserAvatar";
import { ROUTES } from "@/lib/routes";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { localizedPath } from "@/i18n/routes";

interface Props {
  picture: string | null;
  fullname?: string | null;
}

export default function UserProfileMenu({ picture, fullname }: Readonly<Props>) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('UserMenu');
  const locale = useLocale();

  const onClickLoggOut = async () => {
    await fetch(ROUTES.LOGOUT);
    if(pathname.includes('dashboard') || pathname.includes('/account/')) {
      router.push(localizedPath(ROUTES.HOME, locale));
    } else {
      router.refresh();
    }
  }

  return (
    <Menu as="div" className="relative ml-3">
      <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer text-gray-400">
        <span className="absolute -inset-1.5" />
        <span className="sr-only">{t('open')}</span>
        <CurrentUserAvatar picture={picture} fullname={fullname} />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <MenuItem>
          <Link prefetch={false} href={localizedPath(ROUTES.ACCOUNT_SETTINGS, locale)}
            className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden">
            {t('settings')}
          </Link>
        </MenuItem>
        <MenuItem>
          <Link
            prefetch={false}
            href="#"
            onClick={onClickLoggOut}
            className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
          >
            {t('signOut')}
          </Link>
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}