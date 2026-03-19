import Link from 'next/link';
import { useTranslations } from "next-intl";
import { ROUTES } from "@/lib/routes";

export default function Footer() {
  const t = useTranslations('HomePage');

  return (
    <footer className="bg-white py-6 text-center text-sm text-gray-500">
      {t('footerText')}{' '}
      <Link prefetch={false} href={ROUTES.ABOUT} className="text-indigo-600 hover:text-indigo-800 font-medium">
        {t('footerLink')}
      </Link>
    </footer>
  );
}
