'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import ShortUrlCard from "@/features/short_links/components/ShortUrlCard";
import { Button, Input, Fieldset, Field, Label } from '@headlessui/react';
import { useUrlShortForm } from "@/features/short_links/hooks/useUrlShortForm";
import { useTranslations  } from "next-intl";
import { Tooltip } from "@/components/Tooltip/Tooltip";

export default function UrlShortForm() {
  const t = useTranslations('HomePage');
  const {
    currentUrl,
    utm,
    shortUrl,
    isLoading,
    error,

    // callbacks
    handleShorten,
    clearForm,
    handleChangeUrl,
    handleChangeUtmSource,
    handleChangeUtmMedium,
    handleChangeUtmCampaign
  } = useUrlShortForm({ t });

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
          <p className="text-red-700 text-sm">{error}</p>
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
