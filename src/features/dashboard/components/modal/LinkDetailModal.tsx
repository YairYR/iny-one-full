import React from "react";
import { UserUrlStats } from "@/features/dashboard/types/types";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import ShowStats from "@/features/dashboard/components/modal/ShowStats";
import EditLink from "@/features/dashboard/components/modal/EditLink";
import ShowQr from "@/features/dashboard/components/modal/ShowQr";

export type ILinkDetails = {
  open: boolean;
  title: string;
  link?: UserUrlStats|null;
  mode: 'stats'|'edit'|'qr'|null;
}

interface Props {
  modal: ILinkDetails;
  onClose: () => void;
  canViewSensitiveStats?: boolean;
}

export function LinkDetailModal({ modal, onClose, canViewSensitiveStats = false }: Readonly<Props>) {
  const t = useTranslations('DashboardPage');
  if (!modal.link) return null;

  const link = modal.link;
  const width = modal.mode === 'stats' ? 'sm:max-w-6xl' : modal.mode === 'edit' ? 'sm:max-w-3xl' : 'sm:max-w-md';

  return (
    <Dialog open={modal.open} onClose={onClose} transition className="relative z-50">
      {/* En móvil el modal ocupa la pantalla; desde sm es un panel acotado al alto visible. */}
      <div className="fixed inset-0 flex items-stretch justify-center sm:items-center sm:p-4">
        <div className="absolute inset-0 bg-black/40 w-full" />
        <DialogPanel className={`relative z-50 flex h-dvh w-full flex-col overflow-hidden bg-surface shadow-xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl sm:border sm:border-gray-200 ${width}`}>
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">
            <DialogTitle className="truncate text-lg font-semibold">{modal.title}</DialogTitle>
            <button type="button" onClick={onClose} aria-label={t('modal.stats.close')} className="shrink-0 rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer"><XIcon aria-hidden="true" className="size-5" /></button>
          </div>

          {/* El scroll vive aquí para que la cabecera (y el pie de EditLink) sigan visibles. */}
          <div className={`min-h-0 flex-1 overflow-y-auto px-4 pt-4 sm:px-5 ${modal.mode === 'edit' ? '' : 'pb-4'}`}>
            {modal.mode === 'edit' && <EditLink link={link} t={t} onClose={onClose} />}
            {modal.mode === 'stats' && <ShowStats link={link} t={t} onClose={onClose} canViewSensitiveStats={canViewSensitiveStats} />}
            {modal.mode === 'qr' && <ShowQr link={link} t={t} />}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
