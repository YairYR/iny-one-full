import React from "react";
import { UserUrlStats } from "@/features/dashboard/types/types";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import ShowStats from "@/features/dashboard/components/modal/ShowStats";
import EditLink from "@/features/dashboard/components/modal/EditLink";

export type ILinkDetails = {
  open: boolean;
  title: string;
  link?: UserUrlStats|null;
  mode: 'stats'|'edit'|null;
}

interface Props {
  modal: ILinkDetails;
  onClose: () => void;
}

export function LinkDetailModal({ modal, onClose }: Readonly<Props>) {
  const t = useTranslations('DashboardPage');
  if (!modal.link) return null;

  const link = modal.link;

  return (
    <Dialog open={modal.open} onClose={onClose} transition className="relative z-40">
      <div className="fixed inset-0 w-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 w-full" />
        <DialogPanel className="z-50 max-w-3xl bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{modal.title}</DialogTitle>
            <button onClick={onClose} className="text-gray-500 cursor-pointer"><XIcon /></button>
          </div>

          {modal.mode === 'edit' && <EditLink link={link} t={t} onClose={onClose} />}
          {modal.mode === 'stats' && <ShowStats link={link} t={t} onClose={onClose} />}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

