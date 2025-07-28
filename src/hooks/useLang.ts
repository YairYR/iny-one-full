import { useEffect, useState } from "react";
import langs from '@/data/lang.json';

type LANG = 'en'|'es';

const useLang = (defLang: LANG = 'en') => {
    const [currentLang, setCurrentLang] = useState<LANG>(defLang);

    useEffect(() => {
        // @ts-expect-error Some navigators use "userLanguage"
        const userLang = navigator.language || navigator?.userLanguage;
        if (userLang.startsWith('es')) setCurrentLang('es');
    }, []);

    const getText = (id: string) => {
        // @ts-expect-error "langs" is a JSON file
        return langs[currentLang][id] ?? '[TEXT NOT FOUND]';
    }

    return {
        lang: currentLang,
        setCurrentLang,
        get: getText,
    }
}

export default useLang;