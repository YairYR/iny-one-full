'use client';

import { Copy, ExternalLink, Link, QrCode } from "lucide-react";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import useClipboard from "@/hooks/useClipboard";

const QrPanel = dynamic(() => import("@/features/qr/components/QrPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-4">
      <div className="h-48 w-48 animate-pulse rounded bg-gray-100" aria-hidden="true" />
    </div>
  ),
});

interface Props {
  shortUrl: string;
}

const ShortUrlCard: React.FC<Props> = ({ shortUrl }) => {
  const t = useTranslations('HomePage');
  const { copied, copyToClipboard } = useClipboard();
  const [showQr, setShowQr] = useState(false);

  const onClickBtnCopy = async () => {
    if(shortUrl) {
      await copyToClipboard(shortUrl);
    }
  }

  const slug = shortUrl.split('/').pop() ?? 'link';

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <Link className="h-4 w-4 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800">
          {t('success')}
        </h3>
      </div>

      <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-2">{t('copy')}</p>
        <div className="flex items-center justify-between">
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-medium break-all"
          >
            {shortUrl}
          </a>
          <div className="flex ml-2">
            <button
              onClick={onClickBtnCopy}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={t('copy')}
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowQr((prev) => !prev)}
              className={`p-2 transition-colors ${showQr ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              title={showQr ? t('qrHide') : t('qrShow')}
              aria-expanded={showQr}
            >
              <QrCode className="h-4 w-4" />
            </button>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={t('open')}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {showQr && (
          <div className="mt-4 border-t border-green-100 pt-4">
            <QrPanel
              url={shortUrl}
              filename={`iny-one-${slug}`}
              downloadLabel={t('qrDownload')}
              alt={t('qrAlt')}
            />
          </div>
        )}
      </div>

      {copied && (
        <p className="text-green-600 text-sm">{t('copied')}</p>
      )}
    </div>
  )
}

export default ShortUrlCard;
