import Head from "next/head";
import Layout from "@/components/Layout";
import Navbar from "@/components/Navbar";
import {AppProvider, useAppContext} from "@/contexts/app.context";
import { useEffect } from "react";

function Ip() {
    const { lang, clientInfo } = useAppContext();

    useEffect(() => {
        clientInfo
            .getIp()
            .then(clientInfo.getCountry);
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [])

    return (
        <>
            <Head>
                <title>{lang.get('metaTitle')}</title>
                <meta name="description" content={lang.get('metaDescription')} />
            </Head>

            <Layout>
                <Navbar />
                <ul>
                    <li>ip: {clientInfo.ip}</li>
                    <li>country: {clientInfo.country}</li>
                </ul>

            </Layout>
        </>
    )
}

export default function Init() {
    return (
        <AppProvider>
            <Ip />
        </AppProvider>
    )
}