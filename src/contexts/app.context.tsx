import React, { createContext, useContext } from "react";
import useInitialStateAppContext, {IAppContext} from "@/contexts/hooks/useInitialStateAppContext";

export const AppContext = createContext<IAppContext>(undefined as never);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialState = useInitialStateAppContext();

    return <AppContext.Provider value={initialState}>{children}</AppContext.Provider>
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('AppContext must be used within a AppProvider');
    }
    return context;
}
