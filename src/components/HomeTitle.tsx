import { Link } from 'lucide-react';
import { useTranslations } from "next-intl";

export default function HomeTitle() {
    const t = useTranslations('HomePage');

    return (
        <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
                <Link className="h-8 w-8 text-indigo-600 mr-2" />
                <h1 className="text-4xl font-bold text-gray-800">{t('title')}</h1>
            </div>
            <p className="text-lg text-gray-600">{t('subtitle')}</p>
        </div>
    )
}