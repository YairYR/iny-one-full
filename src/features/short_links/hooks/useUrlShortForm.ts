import type React from 'react';
import { useState, useRef, useEffect } from "react";
import { ApiResponse, UrlHistory, UtmParams } from "@/lib/types";
import useLang from "@/hooks/useLang";
import { useRouter } from "next/router";
import { addToSessionStorage, getFromSessionStorage, removeFromSessionStorage } from "@/utils/localstorage";
import { isURL } from "validator";

type SomeUtmParams = Pick<UtmParams, 'source'|'medium'|'campaign'>;

export function useUrlShortForm() {
  const { t } = useLang();
  const router = useRouter();

  const shortenedUrls = useRef<UrlHistory<SomeUtmParams>>({});
  const [currentUrl, setCurrentUrl] = useState('');
  const [utm, setUtm] = useState<SomeUtmParams>({ source: '', medium: '', campaign: '' });
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
  }, []);

  const getShortUrl = async (url: string, utm: SomeUtmParams) => {
    return fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, utm }),
    });
  }

  const handleShorten = async () => {
    const url = currentUrl.trim();
    if (!url) {
      setError(t('requiredUrl'));
      return;
    }

    if (!isURL(url)) {
      setError(t('invalidUrl'));
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
        setError(t('errorNewShortenRefresh'));
        addToSessionStorage('url', JSON.stringify({ url, utm }))
        setTimeout(() => {
          router.reload();
        }, 1000);
      } else {
        setError(t('errorNewShorten'));
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

  const handleChangeUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUrl(event.target.value)
  }

  const handleChangeUtmSource = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitize(ev.target.value);
    setUtm((prev) => ({ ...prev, source: value }))
  }
  const handleChangeUtmMedium = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitize(ev.target.value);
    setUtm((prev) => ({ ...prev, medium: value }))
  }
  const handleChangeUtmCampaign = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitize(ev.target.value);
    setUtm((prev) => ({ ...prev, campaign: value }))
  }

  return {
    t,
    currentUrl,
    utm,
    shortUrl,
    isLoading,
    error,

    // callbacks
    getShortUrl,
    handleShorten,
    clearForm,
    handleChangeUrl,
    handleChangeUtmSource,
    handleChangeUtmMedium,
    handleChangeUtmCampaign
  };
}