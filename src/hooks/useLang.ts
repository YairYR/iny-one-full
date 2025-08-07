import { useEffect, useState } from "react";
import languages from '@/data/lang.json';

type LANG = 'en'|'es';

const useLang = (defLang: LANG = 'en') => {
    const [currentLang, setCurrentLang] = useState<LANG>(defLang);

    useEffect(() => {
        // @ts-expect-error Some navigators use "userLanguage"
        const userLang = navigator.language || navigator?.userLanguage;
        if (userLang.startsWith('es')) setCurrentLang('es');
    }, []);

    const getText = (id: KeysLang) => {
        return languages[currentLang][id] ?? languages['en'][id] ?? '[TEXT NOT FOUND]';
    }

    return {
        lang: currentLang,
        setCurrentLang,
        get: getText,
    }
}

type EnglishLang = typeof languages['en'];
type KeysLang = keyof EnglishLang;

export default useLang;