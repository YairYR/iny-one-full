import Link from 'next/link';
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations('HomePage');

  return (
    <footer className="bg-white py-6 text-center text-sm text-gray-500">
      {t('footerText')}{' '}
      <Link href="/about" className="text-indigo-600 hover:text-indigo-800 font-medium">
        {t('footerLink')}
      </Link>
    </footer>
  );
}
