import React from "react";
import { Button } from "@headlessui/react";
import { UserUrl } from "@/features/dashboard/types/types";
import dayjs from "dayjs";
import useClipboard from "@/hooks/useClipboard";
import { LinkIcon } from 'lucide-react';
import { LinkTools, ITool } from "@/features/dashboard/components/LinksTable/LinkTools";
import { type useTranslations } from "next-intl";

interface Props {
  links: UserUrl[];
  onOpen?: (link: UserUrl) => void;
  onEdit: (link: UserUrl) => void;
  t: ReturnType<typeof useTranslations>;
}

export function LinksTable({ links, onOpen, onEdit, t }: Readonly<Props>) {
  const substringAndSpread = (str: string, max: number) => {
    const _str = str.trim();
    const text = _str.trim().substring(0, max);
    return _str.length > max ? `${text}...` : text;
  }

  const { copyToClipboard } = useClipboard();

  const onClickCopy = (link: UserUrl) => {
    void copyToClipboard('https://iny.one/' + link.slug);
  }

  const tools: ITool<UserUrl>[] = [
    {
      key: 'copy',
      text: t('tools.copy'),
      disabled: false,
      onClick: (e, l) => onClickCopy(l),
    },
    {
      key: 'edit',
      text: t('tools.edit'),
      disabled: false,
      onClick: (e, l) => onEdit(l)
    },
    {
      key: 'stats',
      text: t('tools.stats'),
      disabled: false,
      onClick: (e, l) => onOpen?.(l),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("table.links.title")}</h3>
          <div className="text-sm text-gray-500">{t("table.links.subtitle", { value: links.length })}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
          <tr>
            <th className="p-3 md:hidden">{t("table.links.headers.actions")}</th>
            <th className="p-3">{t("table.links.headers.alias")}</th>
            <th className="p-3">{t("table.links.headers.destination")}</th>
            <th className="p-3">{t("table.links.headers.clicks")}</th>
            {/*<th className="p-3">CTR</th>*/}
            <th className="p-3">{t("table.links.headers.created")}</th>
            <th className="p-3">{t("table.links.headers.actions")}</th>
          </tr>
          </thead>
          <tbody>
          {links.map((l) => (
            <tr key={l.slug} className="border-b hover:bg-gray-50">
              <td className="p-3 md:hidden">
                <LinkTools tools={tools} link={l} />
              </td>
              <td className="p-3 font-medium">{l.alias ?? `/${l.slug}`}</td>
              <td className="p-3 truncate max-w-md" title={l.destination}>{substringAndSpread(l.destination, 30)}</td>
              <td className="p-3">{l.clicks}</td>
              {/*<td className="p-3">{l.ctr}</td>*/}
              <td className="p-3">{dayjs(l.created_at).format('YYYY-MM-DD HH:mm')}</td>
              <td className="p-3">
                <div className="flex md:gap-2">
                  <Button
                    type="button"
                    onClick={() => onClickCopy(l)}
                    className="px-3 py-1 rounded text-gray-400 hover:text-indigo-600 text-sm cursor-pointer hidden md:block"
                    title={t('tools.copy')}
                    aria-label={t("tools.copy")}
                  >
                    <LinkIcon />
                  </Button>
                  <LinkTools tools={tools} link={l} />
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


