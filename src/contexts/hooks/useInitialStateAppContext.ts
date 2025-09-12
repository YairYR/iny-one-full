import { UserClient } from "@/lib/types";
import { useMemo } from "react";

const useInitialStateAppContext = (user?: UserClient): IAppContext => {
    const userInfo = useMemo(() => user, [user]);

    return {
        user: userInfo
    }
}

export interface IAppContext {
    user?: UserClient;
}

export default useInitialStateAppContext;