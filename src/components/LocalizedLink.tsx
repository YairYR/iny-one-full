import Link from "next/link";
import { useLocale } from "next-intl";
import type { ComponentProps } from "react";
import { localizedPath } from "@/i18n/routes";

export default function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useLocale();
  return <Link href={typeof href === "string" ? localizedPath(href, locale) : href} {...props} />;
}
