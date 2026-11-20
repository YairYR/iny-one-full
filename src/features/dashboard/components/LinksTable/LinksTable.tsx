import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@headlessui/react";
import { UserUrl } from "@/features/dashboard/types/types";
import { LinkIcon } from "lucide-react";
import { ITool, LinkTools } from "@/features/dashboard/components/LinksTable/LinkTools";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

interface Props {
  links: UserUrl[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOpen?: (link: UserUrl) => void;
  onEdit: (link: UserUrl) => void;
  onQr?: (link: UserUrl) => void;
}

export function LinksTable({ links, total, page, totalPages, onPageChange, onOpen, onEdit, onQr }: Readonly<Props>) {
  const t = useTranslations('DashboardPage');
  const format = useFormatter();
  const [query, setQuery] = useState('');
  const [copyStatus, setCopyStatus] = useState<'success' | 'error' | null>(null);

  const onClickCopy = useCallback(async (link: UserUrl) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${link.slug}`);
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
  }, []);

  const tools: ITool<UserUrl>[] = useMemo(() => [
    { key: 'copy', text: t('tools.copy'), onClick: (_e, link) => onClickCopy(link) },
    { key: 'edit', text: t('tools.edit'), onClick: (_e, link) => onEdit(link) },
    { key: 'stats', text: t('tools.stats'), onClick: (_e, link) => onOpen?.(link) },
    { key: 'qr', text: t('tools.qr'), onClick: (_e, link) => onQr?.(link) },
  ], [t, onClickCopy, onEdit, onOpen, onQr]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleLinks = links.filter((link) =>
    [link.slug, link.alias ?? '', link.destination].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
  );
  const date = (value: string) => format.dateTime(new Date(value), {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  });
  const clicks = (link: UserUrl) => link.clicks == null ? t('noData') : format.number(link.clicks);

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden" aria-labelledby="links-title">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <h2 id="links-title" className="text-lg font-semibold">{t("table.links.title")}</h2>
          <div className="text-sm text-gray-500">{t("table.links.subtitle", { value: total })}</div>
        </div>
        {total > 0 && (
          <div className="mt-4">
            <label htmlFor="links-search" className="block text-sm font-medium text-gray-700">{t('table.links.search')}</label>
            <input id="links-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>
        )}
        <p className="mt-2 text-sm text-gray-500">{t('table.links.clicksNote')}</p>
        <p role="status" className={`mt-2 text-sm ${copyStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {copyStatus && t(copyStatus === 'success' ? 'tools.copied' : 'tools.copyError')}
        </p>
      </div>

      {visibleLinks.length === 0 ? (
        <div className="p-6 text-sm text-gray-600">
          <p>{total === 0 ? t('table.links.empty') : t('table.links.noResults')}</p>
          {total === 0 && <Link href={ROUTES.HOME} className="mt-3 inline-block font-medium text-indigo-600 underline">{t('button.newLink')}</Link>}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 md:hidden">
            {visibleLinks.map((link) => (
              <li key={link.link_id} className="p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium break-all">iny.one/{link.slug}</p>
                    {link.alias && <p className="mt-1 text-gray-600 break-words">{link.alias}</p>}
                  </div>
                  <LinkTools tools={tools} link={link} />
                </div>
                <p className="mt-3 break-all text-gray-600"><span className="font-medium">{t('table.links.headers.destination')}:</span> {link.destination}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                  <span>{t('table.links.headers.clicks')}: {clicks(link)}</span>
                  <span>{t('table.links.headers.created')}: {date(link.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50"><tr>
                {(['short', 'name', 'destination', 'clicks', 'created', 'actions'] as const).map((header) => (
                  <th key={header} scope="col" className="p-3">{t(`table.links.headers.${header}`)}</th>
                ))}
              </tr></thead>
              <tbody>
                {visibleLinks.map((link) => (
                  <tr key={link.link_id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium whitespace-nowrap">iny.one/{link.slug}</td>
                    <td className="p-3 text-gray-600">{link.alias ?? '—'}</td>
                    <td className="p-3 truncate max-w-md" title={link.destination}>{link.destination}</td>
                    <td className="p-3">{clicks(link)}</td>
                    <td className="p-3 whitespace-nowrap">{date(link.created_at)}</td>
                    <td className="p-3"><div className="flex items-center gap-2">
                      <Button type="button" onClick={() => void onClickCopy(link)} aria-label={t('tools.copy')} title={t('tools.copy')}
                        className="rounded p-2 text-gray-500 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer">
                        <LinkIcon aria-hidden="true" />
                      </Button>
                      <LinkTools tools={tools} link={link} />
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 p-3 text-sm" aria-label={t("table.links.pagination.label")}>
          <span className="text-gray-500">{t("table.links.pagination.status", { page, pages: totalPages })}</span>
          <div className="flex gap-2">
            <Button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}
              className="rounded border px-3 py-2 enabled:cursor-pointer enabled:hover:bg-gray-50 disabled:opacity-40">{t("table.links.pagination.previous")}</Button>
            <Button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
              className="rounded border px-3 py-2 enabled:cursor-pointer enabled:hover:bg-gray-50 disabled:opacity-40">{t("table.links.pagination.next")}</Button>
          </div>
        </nav>
      )}
    </section>
  );
}
