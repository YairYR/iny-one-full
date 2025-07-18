import { useEffect, useState } from "react";
import langs from '@/data/lang.json';

type LANG = 'en'|'es';

const useLang = (defLang: LANG = 'en') => {
    const [currentLang, setCurrentLang] = useState(defLang);

    useEffect(() => {
        const userLang = navigator.language || (navigator as any)?.userLanguage;
        if (userLang.startsWith('es')) setCurrentLang('es');
    }, []);

    const getText = (id: string) => {
        // @ts-ignore
        return langs[currentLang][id] || '[TEXT NOT FOUND]';
    }

    return {
        lang: currentLang,
        setCurrentLang,
        get: getText,
    }
}

export default useLang;