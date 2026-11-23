import type React from "react";
import {Field, Label} from "@headlessui/react";
import {Tooltip} from "@/components/Tooltip/Tooltip";
import {UtmField} from "@/features/short_links/components/UtmFields/UtmField";
import {useTranslations} from "next-intl";

interface Props {
    utm: { source: string, medium: string, campaign: string };
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
    compact?: boolean;
}

export function UtmFields({ utm, onChange, compact = false }: Readonly<Props>) {
    const t = useTranslations('HomePage');
    const inputClass = compact
        ? 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none'
        : undefined;

    return (
        <Field>
            <div className={`flex items-center gap-2 ${compact ? 'mb-2' : 'mb-3'}`}>
                <Label htmlFor="input_utm_source" className="block text-sm font-medium text-gray-700">
                    {t('utmLabel')}
                </Label>
                <Tooltip content={t('utmTooltip')} />
            </div>
            <div className={compact ? 'grid grid-cols-1 gap-3 sm:grid-cols-3' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>

                <div className="relative">
                    <UtmField
                        id="input_utm_source"
                        name="utm_source"
                        value={utm.source}
                        onChange={onChange}
                        label="utm_source"
                        tooltip={t('utmSource')}
                        placeholder={'google'}
                        maxLength={100}
                        className={inputClass}
                    />
                </div>

                <div className="relative">
                    <UtmField
                        id="input_utm_medium"
                        name="utm_medium"
                        value={utm.medium}
                        onChange={onChange}
                        label="utm_medium"
                        tooltip={t('utmMedium')}
                        placeholder={'cpc'}
                        maxLength={100}
                        className={inputClass}
                    />
                </div>

                <div className="relative">
                    <UtmField
                        id="input_utm_campaign"
                        name="utm_campaign"
                        value={utm.campaign}
                        onChange={onChange}
                        label="utm_campaign"
                        tooltip={t('utmCampaign')}
                        placeholder={t('utmCampaignPlaceholder')}
                        maxLength={100}
                        className={inputClass}
                    />
                </div>
            </div>
        </Field>
    )
}