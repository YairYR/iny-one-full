import {Copy, Link, Zap} from "lucide-react";
import useLang from "@/hooks/useLang";

export default function UtmInfoSmall() {
    const lang = useLang();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <Zap className="h-8 w-8 text-indigo-600 mx-auto mb-3"/>
                <h3 className="font-semibold text-gray-800 mb-2">{lang.get('fast')}</h3>
                <p className="text-sm text-gray-600">{lang.get('fastDesc')}</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <Link className="h-8 w-8 text-indigo-600 mx-auto mb-3"/>
                <h3 className="font-semibold text-gray-800 mb-2">{lang.get('utmReady')}</h3>
                <p className="text-sm text-gray-600">{lang.get('utmDesc')}</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <Copy className="h-8 w-8 text-indigo-600 mx-auto mb-3"/>
                <h3 className="font-semibold text-gray-800 mb-2">{lang.get('easy')}</h3>
                <p className="text-sm text-gray-600">{lang.get('easyDesc')}</p>
            </div>
        </div>
    )
}