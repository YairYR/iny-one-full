import Link from 'next/link';
import { useAppContext } from "@/contexts/app.context";

export default function Footer() {
  const { lang } = useAppContext();

  return (
    <footer className="bg-white py-6 text-center text-sm text-gray-500">
      {lang.get('footerText')}{' '}
      <Link href="/about" className="text-indigo-600 hover:text-indigo-800 font-medium">
        {lang.get('footerLink')}
      </Link>
    </footer>
  );
}
