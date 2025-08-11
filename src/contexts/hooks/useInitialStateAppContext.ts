import useGetClientInfo from "@/hooks/useGetClientInfo";

const useInitialStateAppContext = (): IAppContext => {
    const clientInfo = useGetClientInfo();

    return {
        clientInfo,
    }
}

export interface IAppContext {
    clientInfo: ReturnType<typeof useGetClientInfo>;
}

export default useInitialStateAppContext;