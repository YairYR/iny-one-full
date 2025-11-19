'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import ShortUrlCard from "@/features/short_links/components/ShortUrlCard";
import { Button, Input, Fieldset, Field, Label } from '@headlessui/react';
import { useUrlShortForm } from "@/features/short_links/hooks/useUrlShortForm";
import { useTranslations,  } from "next-intl";

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
          <Label htmlFor="input_utm_source" className="block text-sm font-medium text-gray-700 mb-3">{t('utmLabel')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              name="utm_source"
              id="input_utm_source"
              placeholder="utm_source"
              value={utm.source}
              onChange={handleChangeUtmSource}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            <Input
              type="text"
              name="utm_medium"
              id="input_utm_medium"
              placeholder="utm_medium"
              value={utm.medium}
              onChange={handleChangeUtmMedium}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
            <Input
              type="text"
              name="utm_campaign"
              id="input_utm_campaign"
              placeholder="utm_campaign"
              value={utm.campaign}
              onChange={handleChangeUtmCampaign}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
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
