import useGetClientInfo from "@/hooks/useGetClientInfo";
import { UserClient } from "@/lib/types";
import { useMemo } from "react";

const useInitialStateAppContext = (user?: UserClient): IAppContext => {
    const clientInfo = useGetClientInfo();
    const userInfo = useMemo(() => user, [user]);

    return {
        clientInfo,
        user: userInfo
    }
}

export interface IAppContext {
    clientInfo: ReturnType<typeof useGetClientInfo>;
    user?: UserClient;
}

export default useInitialStateAppContext;