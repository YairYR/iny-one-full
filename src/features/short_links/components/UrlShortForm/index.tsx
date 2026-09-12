'use client';

import React from 'react';
import { Zap, LockIcon } from 'lucide-react';
import Link from 'next/link';
import ShortUrlCard from "@/features/short_links/components/ShortUrlCard";
import { Button, Field, Fieldset, Input, Label } from '@headlessui/react';
import { useUrlShortForm } from "@/features/short_links/hooks/useUrlShortForm";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import { ROUTES } from "@/lib/routes";
import { CUSTOM_SLUG } from "@/lib/short-links/slug";

interface Props {
  /** Determina si el campo de nombre propio está activo o sólo se muestra. */
  isAuthenticated?: boolean;
}

export default function UrlShortForm({ isAuthenticated = false }: Readonly<Props>) {
  const t = useTranslations('HomePage');
  const {
    currentUrl,
    utm,
    slug,
    shortUrl,
    isLoading,
    error,
    showRegisterCta,

    // callbacks
    handleShorten,
    clearForm,
    handleChangeUrl,
    handleChangeSlug,
    handleChangeUtmSource,
    handleChangeUtmMedium,
    handleChangeUtmCampaign
  } = useUrlShortForm({ t, isAuthenticated });

  return (
    <Fieldset className="bg-white rounded-xl shadow-lg p-8 mb-6">
      <div className="mb-6">
        <Field>
          <Label className="block text-sm font-medium text-gray-700 mb-2" >{t('urlLabel')}</Label>
          <Input
            type="url"
            name="url"
            placeholder={t('urlPlaceholder')}
            value={currentUrl}
            onChange={handleChangeUrl}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </Field>
      </div>

      {/*
        Para el usuario anónimo el campo se muestra deshabilitado con el motivo
        y el enlace a registro, no oculto: una funcionalidad escondida no
        convierte a nadie. Es la palanca de registro del producto, así que tiene
        que verse el hueco donde iría su nombre.
      */}
      <div className="mb-6">
        <Field>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="input_slug" className="block text-sm font-medium text-gray-700">
              {t('slugLabel')}
            </Label>
            <Tooltip content={t('slugTooltip')} />
          </div>
          <div className="flex items-stretch">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
              iny.one/
            </span>
            <Input
              type="text"
              name="slug"
              id="input_slug"
              placeholder={t('slugPlaceholder')}
              value={slug}
              onChange={handleChangeSlug}
              disabled={!isAuthenticated}
              maxLength={CUSTOM_SLUG.max}
              aria-describedby="slug-help"
              className="w-full rounded-r-lg border border-gray-300 px-4 py-3 transition-colors
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500
                         disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <p id="slug-help" className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
            {isAuthenticated ? (
              t('slugHelp', { min: CUSTOM_SLUG.min, max: CUSTOM_SLUG.max })
            ) : (
              <>
                <LockIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
                <span>
                  {t('slugLocked')}{' '}
                  <Link
                    href={ROUTES.REGISTER}
                    className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
                  >
                    {t('slugLockedCta')}
                  </Link>
                </span>
              </>
            )}
          </p>
        </Field>
      </div>

      <div className="mb-6">
        <Field>
          <div className="flex items-center gap-2 mb-3">
            <Label htmlFor="input_utm_source" className="block text-sm font-medium text-gray-700">
              {t('utmLabel')}
            </Label>
            <Tooltip content={t('utmTooltip')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="relative">
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="input_utm_source" className="text-xs text-gray-600">
                  utm_source
                </Label>
                <Tooltip content={t('utmSource')} />
              </div>
              <Input
                type="text"
                name="utm_source"
                id="input_utm_source"
                placeholder="google"
                value={utm.source}
                onChange={handleChangeUtmSource}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-full"
              />
            </div>

            <div className="relative">
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="input_utm_medium" className="text-xs text-gray-600">
                  utm_medium
                </Label>
                <Tooltip content={t('utmMedium')} />
              </div>
              <Input
                type="text"
                name="utm_medium"
                id="input_utm_medium"
                placeholder="cpc"
                value={utm.medium}
                onChange={handleChangeUtmMedium}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-full"
              />
            </div>

            <div className="relative">
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="input_utm_campaign" className="text-xs text-gray-600">
                  utm_campaign
                </Label>
                <Tooltip content={t('utmCampaign')} />
              </div>
              <Input
                type="text"
                name="utm_campaign"
                id="input_utm_campaign"
                placeholder="promo_verano"
                value={utm.campaign}
                onChange={handleChangeUtmCampaign}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-full"
              />
            </div>
          </div>
        </Field>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            {error}
            {/*
              Topar con el límite es el momento de mayor intención del embudo.
              Sin este enlace el mensaje es un callejón sin salida —y antes le
              decía «mejora tu plan» a quien ni siquiera tiene cuenta.
            */}
            {showRegisterCta && (
              <>
                {' '}
                <Link
                  href={ROUTES.REGISTER}
                  className="font-semibold text-red-800 underline underline-offset-2"
                >
                  {t('errorLimitCta')}
                </Link>
              </>
            )}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button
          onClick={handleShorten}
          disabled={isLoading}
          className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {t('shortening')}
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              {t('shortenBtn')}
            </>
          )}
        </Button>

        <Button
          onClick={clearForm}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {t('cleanBtn')}
        </Button>
      </div>

      {shortUrl && <ShortUrlCard shortUrl={shortUrl} />}
    </Fieldset>
  );
}
