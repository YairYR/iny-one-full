import React, { createContext, useContext } from "react";
import useInitialStateAppContext, {IAppContext} from "@/contexts/hooks/useInitialStateAppContext";
import { UserClient } from "@/lib/types";

export const AppContext = createContext<IAppContext>(undefined as never);

interface Props {
    children: React.ReactNode;
    user?: UserClient;
}

export const AppProvider: React.FC<Props> = ({ children, user }) => {
    const initialState = useInitialStateAppContext(user);

    return <AppContext.Provider value={initialState}>{children}</AppContext.Provider>
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('AppContext must be used within a AppProvider');
    }
    return context;
}
