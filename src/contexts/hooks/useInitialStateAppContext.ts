import useLang from "@/hooks/useLang";
import useGetClientInfo from "@/hooks/useGetClientInfo";

const useInitialStateAppContext = (): IAppContext => {
    const lang = useLang('en');
    const clientInfo = useGetClientInfo();

    return {
        lang,
        clientInfo,
    }
}

export interface IAppContext {
    lang: ReturnType<typeof useLang>;
    clientInfo: ReturnType<typeof useGetClientInfo>;
}

export default useInitialStateAppContext;