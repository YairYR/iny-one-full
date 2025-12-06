import {Copy, Link, Zap} from "lucide-react";
import { useTranslations } from "next-intl";

export default function UtmInfoSmall() {
    const t = useTranslations('HomePage');

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <Zap className="h-8 w-8 text-indigo-600 mx-auto mb-3"/>
                <h3 className="font-semibold text-gray-800 mb-2">{t('fast')}</h3>
                <p className="text-sm text-gray-600">{t('fastDesc')}</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <Link className="h-8 w-8 text-indigo-600 mx-auto mb-3"/>
                <h3 className="font-semibold text-gray-800 mb-2">{t('utmReady')}</h3>
                <p className="text-sm text-gray-600">{t('utmDesc')}</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <Copy className="h-8 w-8 text-indigo-600 mx-auto mb-3"/>
                <h3 className="font-semibold text-gray-800 mb-2">{t('easy')}</h3>
                <p className="text-sm text-gray-600">{t('easyDesc')}</p>
            </div>
        </div>
    )
}