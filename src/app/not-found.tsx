import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Link as LinkIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";

/**
 * 404 global del App Router.
 *
 * El resolver de enlaces cortos ([short]/route.tsx) ya renderiza su propio 404
 * para slugs de un segmento, pero rutas como /foo/bar caían al 404 genérico de
 * Next sin marca ni enlaces internos. Esta página devuelve status 404 (Next lo
 * hace automáticamente) y recupera al visitante hacia las páginas principales.
 */
export default async function NotFound() {
  const t = await getTranslations("404");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 text-center">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <LinkIcon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-2">{t("title")}</h1>
        <p className="text-gray-600 mb-6">{t("subtitle")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            prefetch={false}
            href={ROUTES.HOME}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {t("goHome")}
          </Link>
          <Link
            prefetch={false}
            href={ROUTES.DASHBOARD}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {t("goDashboard")}
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          <Link prefetch={false} href={ROUTES.HOME} className="text-indigo-600 hover:text-indigo-800 font-medium">
            iny.one
          </Link>{" "}
          · {t("footer")}
        </p>
      </div>
    </div>
  );
}
