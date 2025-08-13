import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useAppContext } from '@/contexts/app.context';
import { isURL } from "validator";
import { ApiResponse, UrlHistory, UtmParams } from "@/lib/types";
import {
  addToSessionStorage,
  getFromSessionStorage,
  removeFromSessionStorage
} from "@/utils/localstorage";
import { useRouter } from "next/router";
import useLang from "@/hooks/useLang";
import ShortUrlCard from "@/components/ShortUrlCard";

export default function UrlShortForm() {
  const { clientInfo } = useAppContext();
  const lang = useLang();
  const router = useRouter();

  const shortenedUrls = React.useRef<UrlHistory>({});
  const [currentUrl, setCurrentUrl] = useState('');
  const [utm, setUtm] = useState<UtmParams>({ source: '', medium: '', campaign: '' });
  const [shortUrl, setShortUrl] = useState<string|null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sanitize = (value: string) =>
      value.replace(/[^a-zA-Z0-9-_]/g, '');

  useEffect(() => {
    const urlRefresh = getFromSessionStorage('url');
    if(urlRefresh) {
      const data = JSON.parse(urlRefresh);
      setCurrentUrl(data.url);
      setUtm(data.utm);
      removeFromSessionStorage('url');
    }

    clientInfo.getIp()
      .then(clientInfo.getCountry)
      .catch((e) => console.error(e));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getShortUrl = async (url: string, utm: UtmParams) => {
    const ip = await clientInfo.getIp().catch(console.error);
    const country = await clientInfo.getCountry(ip as string).catch(console.error);

    return fetch('/api/shorten', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip ?? '',
        'x-forwarded-for-code': country ?? '',
      },
      body: JSON.stringify({ url, utm }),
    });
  }

  const handleShorten = async () => {
    const url = currentUrl.trim();
    if (!url) {
      setError(lang.get('requiredUrl'));
      return;
    }

    if (!isURL(url)) {
      setError(lang.get('invalidUrl'));
      return;
    }

    setShortUrl(null);
    setError('');
    setIsLoading(true);

    // Evita requests innecesarios para urls ya generadas
    if(shortenedUrls.current[url]) {
      const shortened = shortenedUrls.current[url];
      if(utm.source === shortened.utm.source &&
        utm.medium === shortened.utm.medium &&
        utm.campaign === shortened.utm.campaign) {
        setShortUrl(shortened.short + '');
        setIsLoading(false);
        return;
      }
    }

    const response = await getShortUrl(url, utm);
    const apiResponse: ApiResponse<{ short: string }> = await response.json();

    if(response.ok) {
      setShortUrl(apiResponse.data.short);
      shortenedUrls.current[url] = {
        url,
        short: apiResponse.data.short,
        utm
      };
    } else {
      if(apiResponse.code === 1010) {
        setError(lang.get('errorNewShortenRefresh'));
        addToSessionStorage('url', JSON.stringify({ url, utm }))
        setTimeout(() => {
          router.reload();
        }, 1000);
      } else {
        setError(lang.get('errorNewShorten'));
      }
    }

    setIsLoading(false);
  };

  const clearForm = () => {
    setCurrentUrl('');
    setUtm({ source: '', medium: '', campaign: '' });
    setShortUrl(null);
    setError('');
  };

  const handleChangeUtmSource = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitize(ev.target.value);
    setUtm((prev) => ({ ...prev, source: value }))
  }
  const handleChangeUtmMedium = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitize(ev.target.value);
    setUtm((prev) => ({ ...prev, medium: value }))
  }
  const handleChangeUtmCampain = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitize(ev.target.value);
    setUtm((prev) => ({ ...prev, campaign: value }))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {lang.get('urlLabel')}
        </label>
        <input
          type="url"
          placeholder={lang.get('urlPlaceholder')}
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {lang.get('utmLabel')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="utm_source"
            value={utm.source}
            onChange={handleChangeUtmSource}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <input
            type="text"
            placeholder="utm_medium"
            value={utm.medium}
            onChange={handleChangeUtmMedium}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <input
            type="text"
            placeholder="utm_campaign"
            value={utm.campaign}
            onChange={handleChangeUtmCampain}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={handleShorten}
          disabled={isLoading}
          className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {lang.get('shortening')}
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              {lang.get('shortenBtn')}
            </>
          )}
        </button>

        <button
          onClick={clearForm}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {lang.get('cleanBtn')}
        </button>
      </div>

      {shortUrl && <ShortUrlCard shortUrl={shortUrl} />}
    </div>
  );
}
