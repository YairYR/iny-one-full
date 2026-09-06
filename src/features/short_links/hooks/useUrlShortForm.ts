'use client';

import type React from 'react';
import { useEffect, useRef, useState } from "react";
import { ApiResponse, UrlHistory, UtmParams } from "@/lib/types";
import { getFromSessionStorage, removeFromSessionStorage } from "@/lib/utils/localstorage";
import { regexes, url as isURLZod } from "zod/mini";
import type { useTranslations } from "next-intl";
import { ERROR } from "@/lib/api/error-codes";

type SomeUtmParams = Pick<UtmParams, 'source'|'medium'|'campaign'>;

const zodUrl = isURLZod({
  protocol: /^(https)$/,
  hostname: regexes.domain,
});

interface Props {
  t: ReturnType<typeof useTranslations>;
  /** Sólo con cuenta se puede elegir el nombre del enlace. */
  isAuthenticated?: boolean;
}

export function useUrlShortForm({ t, isAuthenticated = false }: Props) {
  const shortenedUrls = useRef<UrlHistory<SomeUtmParams>>({});
  const [currentUrl, setCurrentUrl] = useState('');
  const [utm, setUtm] = useState<SomeUtmParams>({ source: '', medium: '', campaign: '' });
  const [slug, setSlug] = useState('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  /**
   * El error del tope también lo ve quien no tiene cuenta, y para ése la salida
   * no es «mejora tu plan» sino registrarse. Sin esta bandera ambos casos
   * comparten mensaje y ninguno lleva a ninguna parte.
   */
  const [showRegisterCta, setShowRegisterCta] = useState(false);

  const sanitize = (value: string) =>
    value.replaceAll(/[^a-zA-Z0-9-_]/g, '');

  /** El slug se guarda siempre en minúsculas: el resolver compara exacto. */
  const sanitizeSlug = (value: string) => sanitize(value).toLowerCase();

  useEffect(() => {
    const urlRefresh = getFromSessionStorage('url');
    if (urlRefresh) {
      const data = JSON.parse(urlRefresh);
      setCurrentUrl(data.url);
      setUtm(data.utm);
      removeFromSessionStorage('url');
    }
  }, []);

  const getShortUrl = async (url: string, utm: SomeUtmParams, slug?: string) => {
    return fetch('/api/v1/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // El slug sólo viaja si el usuario escribió uno: mandarlo vacío haría que
      // la API lo tratara como una petición de nombre propio y exigiera sesión.
      body: JSON.stringify(slug ? { url, utm, slug } : { url, utm }),
    });
  };

  const handleShorten = async () => {
    const url = currentUrl.trim()
      .replace(/^(https?):\/\//, '')
      .replace(/^/, 'https://');
    if (!url) {
      setError(t('requiredUrl'));
      return;
    }

    const isValid = zodUrl.safeParse(url).success;

    if (!isValid) {
      setError(t('invalidUrl'));
      return;
    }

    setShortUrl(null);
    setError('');
    setShowRegisterCta(false);
    setIsLoading(true);

    const chosenSlug = sanitizeSlug(slug);

    // Evita requests innecesarios para urls ya generadas. No aplica cuando se
    // pide un nombre propio: ahí cada petición es un nombre distinto.
    if(!chosenSlug && shortenedUrls.current[url]) {
      const shortened = shortenedUrls.current[url];
      if(utm.source === shortened.utm.source &&
        utm.medium === shortened.utm.medium &&
        utm.campaign === shortened.utm.campaign) {
        setShortUrl(shortened.short + '');
        setIsLoading(false);
        return;
      }
    }

    const response = await getShortUrl(url, utm, chosenSlug || undefined);
    const apiResponse: ApiResponse<{ short: string }> = await response.json();

    if (apiResponse.ok) {
      setShortUrl(apiResponse.data.short);
      if (!chosenSlug) {
        shortenedUrls.current[url] = {
          url,
          short: apiResponse.data.short,
          utm
        };
      }
      setCurrentUrl(url);
    } else if(apiResponse.error.code === ERROR.RATE_LIMIT_EXCEEDED) {
      // Sin cuenta el tope es 5 y la salida es registrarse; con cuenta, 50 y la
      // salida es cambiar de plan. Mismo código de error, mensajes distintos.
      setError(isAuthenticated ? t('errorNewShortenLimit') : t('errorAnonymousLimit'));
      setShowRegisterCta(!isAuthenticated);
    } else if(apiResponse.error.code === ERROR.DUPLICATE_ENTRY) {
      setError(t('errorSlugTaken'));
    } else if(apiResponse.error.code === ERROR.VALIDATION_ERROR && chosenSlug) {
      setError(t('errorSlugInvalid'));
    } else if(apiResponse.error.code === ERROR.SESSION_NOT_FOUND) {
      setError(t('errorSlugNeedsAccount'));
      setShowRegisterCta(true);
    } else {
      setError(t('errorNewShorten'));
    }

    setIsLoading(false);
  };

  const clearForm = () => {
    setCurrentUrl('');
    setUtm({ source: '', medium: '', campaign: '' });
    setSlug('');
    setShortUrl(null);
    setError('');
    setShowRegisterCta(false);
  };

  const handleChangeSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(sanitizeSlug(event.target.value));
  };

  const handleChangeUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUrl(event.target.value);
  };

  const handleChangeUtmSource = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitize(ev.target.value);
    setUtm((prev) => ({ ...prev, source: value }));
  };

  const handleChangeUtmMedium = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitize(ev.target.value);
    setUtm((prev) => ({ ...prev, medium: value }));
  };

  const handleChangeUtmCampaign = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitize(ev.target.value);
    setUtm((prev) => ({ ...prev, campaign: value }));
  };

  return {
    t,
    currentUrl,
    utm,
    slug,
    shortUrl,
    isLoading,
    error,
    showRegisterCta,
    isAuthenticated,

    getShortUrl,
    handleShorten,
    clearForm,
    handleChangeUrl,
    handleChangeSlug,
    handleChangeUtmSource,
    handleChangeUtmMedium,
    handleChangeUtmCampaign
  };
}
