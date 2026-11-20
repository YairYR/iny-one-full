import { ROUTES } from "@/lib/routes";

export const BILINGUAL_PUBLIC_PATHS = [
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.PLANS,
  ROUTES.UTM_BUILDER,
  ROUTES.QR_GENERATOR,
  ROUTES.BITLY_ALTERNATIVE,
  ROUTES.API_DOCS,
  ROUTES.DASHBOARD_DEMO,
  ROUTES.PISCOLAS,
] as const;

const LOCALIZED_PATHS: readonly string[] = [
  ...BILINGUAL_PUBLIC_PATHS,
  ROUTES.DASHBOARD,
  ROUTES.ACCOUNT_SETTINGS,
];

export function unlocalizedPath(path: string): string {
  if (path === "/en/piscolas") return ROUTES.PISCOLAS;
  if (path === "/es") return "/";
  return path.startsWith("/es/") ? path.slice(3) : path;
}

export function isLocalizedPath(path: string): boolean {
  return LOCALIZED_PATHS.includes(unlocalizedPath(path));
}

export function localizedPath(path: string, locale: string): string {
  const base = unlocalizedPath(path);
  if (!LOCALIZED_PATHS.includes(base)) return path;
  if (base === ROUTES.PISCOLAS) return locale === "en" ? "/en/piscolas" : ROUTES.PISCOLAS;
  return locale === "es" ? (base === "/" ? "/es" : `/es${base}`) : base;
}
