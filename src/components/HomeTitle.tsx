import { Link } from 'lucide-react';
import useLang from "@/hooks/useLang";

export default function HomeTitle() {
    const lang = useLang();

    return (
        <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
                <Link className="h-8 w-8 text-indigo-600 mr-2" />
                <h1 className="text-4xl font-bold text-gray-800">{lang.get('title')}</h1>
            </div>
            <p className="text-lg text-gray-600">{lang.get('subtitle')}</p>
        </div>
    )
}