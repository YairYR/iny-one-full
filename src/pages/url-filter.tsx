import Head from "next/head";
import Layout from "@/components/Layout";
import Navbar from "@/components/Navbar";
import {AppProvider, useAppContext} from "@/contexts/app.context";
import Form from "next/form";
import {FormEvent, useState} from "react";

function UrlFilter() {
    const { lang } = useAppContext();

    const [content, setContent] = useState<string>('');
    const [isSafe, setIsSafe] = useState<string|undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [list, setList] = useState([]);

    const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(ev.currentTarget);
            const response = await fetch('/api/is-safe', {
                method: 'POST',
                body: JSON.stringify({
                    content: formData.get("content")
                }),
            })
            if(!response.ok) {
                throw new Error('Failed to submit the data. Please try again.');
            }

            const data = await response.json();
            setIsSafe(data.safe ? 'true' : 'false');
            setList(data.filtered);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    }

    return (
        <>
            <Head>
                <title>{lang.get('metaTitle')}</title>
                <meta name="description" content={lang.get('metaDescription')} />
            </Head>

            <Layout>
                <Navbar/>
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <Form action="#" onSubmit={onSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ¿Es segura la URL?
                            </label>
                            <input
                                type="text"
                                name="content"
                                value={content}
                                onChange={(ev) => setContent(ev.target.value)}
                                placeholder={lang.get('urlPlaceholder')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >Enviar</button>

                        {isSafe !== undefined && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{isSafe}</p>
                                {list.length > 0 && (
                                    <>
                                        <p>Lista:</p>
                                        <ul>
                                            {list.map((item, index) => (
                                                <li key="blacklist">{item}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}
                    </Form>
                </div>

                {isLoading && <span>Loading...</span>}
            </Layout>
        </>
    )
}

export default function Init() {
    return (
        <AppProvider>
            <UrlFilter/>
        </AppProvider>
    )
}