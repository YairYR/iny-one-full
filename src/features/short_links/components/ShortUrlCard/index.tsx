import { Copy, ExternalLink, Link } from "lucide-react";
import React from "react";
import useLang from "@/hooks/useLang";
import useClipboard from "@/hooks/useClipboard";

interface Props {
  shortUrl: string;
}

const ShortUrlCard: React.FC<Props> = ({ shortUrl }) => {
  const lang = useLang();
  const { copied, copyToClipboard } = useClipboard();

  const onClickBtnCopy = async () => {
    if(shortUrl) {
      await copyToClipboard(shortUrl)
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
          <Link className="h-4 w-4 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-green-800">
          {lang.get('success')}
        </h3>
      </div>

      <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-2">{lang.get('copy')}</p>
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
              title={lang.get('copy')}
            >
              <Copy className="h-4 w-4" />
            </button>
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={lang.get('open')}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {copied && (
        <p className="text-green-600 text-sm">{lang.get('copied')}</p>
      )}
    </div>
  )
}

export default ShortUrlCard;