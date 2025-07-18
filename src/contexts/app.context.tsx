import { createContext, useContext } from "react";
import useLang from "@/hooks/useLang";

export const AppContext = createContext<IAppContext>(undefined as any);

export const AppProvider: React.FC<any> = ({ children }) => {
    const lang = useLang('en');

    return <AppContext.Provider value={{
        lang,
    }}>{children}</AppContext.Provider>
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('AppContext must be used within a AppProvider');
    }
    return context;
}

interface IAppContext {
    lang: ReturnType<typeof useLang>;
}