import { Home, Compass } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-6">
      <div className="flex flex-col items-center mb-8">
        <Compass className="w-16 h-16 text-blue-600 animate-pulse mb-4" />
        <h1 className="text-5xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-xl text-gray-600">Página no encontrada</p>
      </div>

      <p className="max-w-md text-gray-500 mb-8">
        Parece que te perdiste en el camino 😅.
        Pero no te preocupes, ¡aún puedes explorar y disfrutar nuestra plataforma!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-medium shadow hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Volver al inicio
        </Link>

        <Link
          href="/explorar"
          className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-100 transition-colors"
        >
          <Compass className="w-5 h-5" />
          Explorar más
        </Link>
      </div>
    </div>
  );
}

