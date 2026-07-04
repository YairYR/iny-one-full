import Link from 'next/link';
import { useLocale } from "next-intl";
import { ROUTES } from "@/lib/routes";

const labels = {
  en: {
    tools: "Tools",
    shortener: "URL shortener",
    utm: "UTM builder",
    qr: "QR code generator",
    piscolas: "Piscola calculator",
    company: "iny.one",
    about: "About",
    plans: "Plans",
    dashboard: "Dashboard",
  },
  es: {
    tools: "Herramientas",
    shortener: "Acortador de URLs",
    utm: "Generador UTM",
    qr: "Generador de códigos QR",
    piscolas: "Calculadora de piscolas",
    company: "iny.one",
    about: "Acerca de",
    plans: "Planes",
    dashboard: "Panel",
  },
};

/**
 * Footer con internal linking completo.
 * SEO: asegura que ninguna página indexable quede huérfana y
 * distribuye señal hacia las páginas-herramienta con anchor text descriptivo.
 */
export default function Footer() {
  const locale = useLocale() as "es" | "en";
  const t = labels[locale] ?? labels.en;

  const linkCls = "text-gray-500 hover:text-indigo-600 transition-colors";

  return (
    <footer className="bg-white py-8 text-sm border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-8">
          <nav aria-label={t.tools}>
            <p className="font-semibold text-gray-800 mb-3">{t.tools}</p>
            <ul className="space-y-2">
              <li><Link prefetch={false} href={ROUTES.HOME} className={linkCls}>{t.shortener}</Link></li>
              <li><Link prefetch={false} href={ROUTES.UTM_BUILDER} className={linkCls}>{t.utm}</Link></li>
              <li><Link prefetch={false} href={ROUTES.QR_GENERATOR} className={linkCls}>{t.qr}</Link></li>
              <li><Link prefetch={false} href={ROUTES.PISCOLAS} className={linkCls}>{t.piscolas}</Link></li>
            </ul>
          </nav>
          <nav aria-label={t.company}>
            <p className="font-semibold text-gray-800 mb-3">{t.company}</p>
            <ul className="space-y-2">
              <li><Link prefetch={false} href={ROUTES.ABOUT} className={linkCls}>{t.about}</Link></li>
              <li><Link prefetch={false} href={ROUTES.PLANS} className={linkCls}>{t.plans}</Link></li>
              <li><Link prefetch={false} href={ROUTES.DASHBOARD} className={linkCls}>{t.dashboard}</Link></li>
            </ul>
          </nav>
        </div>
        <p className="text-center text-gray-400 mt-8 text-xs">
          © {new Date().getFullYear()} iny.one
        </p>
      </div>
    </footer>
  );
}
