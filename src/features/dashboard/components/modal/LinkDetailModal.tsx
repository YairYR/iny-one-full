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

  return (
    <Dialog open={modal.open} onClose={onClose} transition className="relative z-40">
      <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
        <div className="absolute inset-0 bg-black/40 w-full" />
        <DialogPanel className="z-50 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-xl sm:p-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <DialogTitle className="text-xl font-semibold">{modal.title}</DialogTitle>
            <button type="button" onClick={onClose} aria-label={t('modal.stats.close')} className="rounded p-2 text-gray-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-indigo-600 cursor-pointer"><XIcon aria-hidden="true" /></button>
          </div>

          {modal.mode === 'edit' && <EditLink link={link} t={t} onClose={onClose} />}
          {modal.mode === 'stats' && <ShowStats link={link} t={t} onClose={onClose} canViewSensitiveStats={canViewSensitiveStats} />}
          {modal.mode === 'qr' && <ShowQr link={link} t={t} />}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
