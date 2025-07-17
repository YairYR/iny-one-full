import { useAppContext } from "@/contexts/app.context"

export default function Footer() {
    const { lang } = useAppContext();

    return (
        <footer className="bg-white py-6 text-center text-sm text-gray-500">
            {lang.get('footer')}{' '}
            <a
            href="https://www.linkedin.com/in/yairyuhaniak"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
            {lang.get('linkedin')}
            </a>
        </footer>
    )
}