import Link from 'next/link';
import { useLocale } from "next-intl";
import { ROUTES } from "@/lib/routes";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const labels = {
  en: {
    tools: "Tools",
    shortener: "URL shortener",
    utm: "UTM builder",
    qr: "QR code generator",
    api: "URL shortener API",
    piscolas: "Piscola calculator",
    company: "iny.one",
    about: "About",
    plans: "Plans",
    bitly: "Bitly alternative",
    dashboard: "Dashboard",
  },
  es: {
    tools: "Herramientas",
    shortener: "Acortador de URLs",
    utm: "Generador UTM",
    qr: "Generador de códigos QR",
    api: "API del acortador",
    piscolas: "Calculadora de piscolas",
    company: "iny.one",
    about: "Acerca de",
    plans: "Planes",
    bitly: "Alternativa a Bitly",
    dashboard: "Panel",
  },
};

/**
 * Footer con internal linking completo.
 * SEO: asegura que ninguna página indexable quede huérfana y
 * distribuye señal hacia las páginas-herramienta con anchor text descriptivo.
 * Cuando el locale es "es", los enlaces bilingües apuntan a sus URLs /es/...
 * para que el crawler descubra la versión en español desde cualquier página.
 */
export default function Footer() {
  const locale = useLocale() as "es" | "en";
  const t = labels[locale] ?? labels.en;

  // Prefija /es solo en rutas que existen en ambos idiomas.
  // (PISCOLAS es solo-ES en su URL histórica y DASHBOARD es app privada.)
  const p = (path: string) =>
    locale === "es" ? (path === "/" ? "/es" : `/es${path}`) : path;

  const linkCls = "text-gray-500 hover:text-indigo-600 transition-colors";

  return (
    <footer className="bg-white py-8 text-sm border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-8">
          <nav aria-label={t.tools}>
            <p className="font-semibold text-gray-800 mb-3">{t.tools}</p>
            <ul className="space-y-2">
              <li><Link prefetch={false} href={p(ROUTES.HOME)} className={linkCls}>{t.shortener}</Link></li>
              <li><Link prefetch={false} href={p(ROUTES.UTM_BUILDER)} className={linkCls}>{t.utm}</Link></li>
              <li><Link prefetch={false} href={p(ROUTES.QR_GENERATOR)} className={linkCls}>{t.qr}</Link></li>
              <li><Link prefetch={false} href={p(ROUTES.API_DOCS)} className={linkCls}>{t.api}</Link></li>
              <li><Link prefetch={false} href={ROUTES.PISCOLAS} className={linkCls}>{t.piscolas}</Link></li>
            </ul>
          </nav>
          <nav aria-label={t.company}>
            <p className="font-semibold text-gray-800 mb-3">{t.company}</p>
            <ul className="space-y-2">
              <li><Link prefetch={false} href={p(ROUTES.ABOUT)} className={linkCls}>{t.about}</Link></li>
              <li><Link prefetch={false} href={p(ROUTES.PLANS)} className={linkCls}>{t.plans}</Link></li>
              <li><Link prefetch={false} href={p(ROUTES.BITLY_ALTERNATIVE)} className={linkCls}>{t.bitly}</Link></li>
              <li><Link prefetch={false} href={ROUTES.DASHBOARD} className={linkCls}>{t.dashboard}</Link></li>
            </ul>
          </nav>
        </div>
        <LanguageSwitcher />
        <p className="text-center text-gray-400 mt-4 text-xs">
          © {new Date().getFullYear()} iny.one
        </p>
      </div>
    </footer>
  );
}
