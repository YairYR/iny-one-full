import { useAppContext } from "@/contexts/app.context"

export default function Footer() {
    const { lang } = useAppContext();

    return (
        <footer className="bg-white py-6 text-center text-sm text-gray-500">
            {lang.get('footer')}
        </footer>
    )
}
