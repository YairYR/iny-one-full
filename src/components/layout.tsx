import Footer from '@/components/footer';

const Layout: React.FC<any> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-indigo-100">

            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-2xl mx-auto">
                    { children }
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Layout;