import languages from '@/data/lang.json';
import { useRouter } from "next/router";

type LANG = 'en'|'es';

const useLang = () => {
    const router = useRouter();
    const currentLang: LANG = ((router.locale && languages[router.locale as never]) ? router.locale as never : 'en');

    const getText = (id: KeysLang) => {
        return languages[currentLang][id] ?? languages['en'][id] ?? '[TEXT NOT FOUND]';
    }

    return {
        current: currentLang as LANG,
        get: getText,
        t: getText,
    }
}

type EnglishLang = typeof languages['en'];
type KeysLang = keyof EnglishLang;

export default useLang;