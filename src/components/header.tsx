import Head from "next/head"
import { useAppContext } from "@/contexts/app.context"

const Header = () => {
    const { lang } = useAppContext()

    return (
        <Head>
            <title>{lang.get('metaTitle')}</title>
            <meta name="description" content={lang.get('metaDescription')} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charSet="UTF-8" />
        </Head>
    )
}

export default Header;