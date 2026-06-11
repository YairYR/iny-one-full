import React from "react";
import { UserUrlStats } from "@/features/dashboard/types/types";
import QrPanel from "@/features/qr/components/QrPanel";

interface Props {
  link: UserUrlStats;
  t: ReturnType<typeof import("next-intl").useTranslations>;
}

export default function ShowQr({ link, t }: Readonly<Props>) {
  const shortUrl = `https://iny.one/${link.slug}`;

  return (
    <div className="mt-4 min-w-72">
      <p className="text-sm text-gray-500 mb-1">{t("modal.stats.destination")}</p>
      <p className="font-medium truncate mb-4" title={link.destination}>{link.destination}</p>

      <QrPanel
        url={shortUrl}
        filename={`iny-one-${link.slug}`}
        downloadLabel={t("modal.qr.download")}
        alt={t("modal.qr.alt")}
        hint={t("modal.qr.hint")}
      />

      <p className="text-center text-sm text-indigo-600 font-medium mt-2 break-all">{shortUrl}</p>
    </div>
  );
}
