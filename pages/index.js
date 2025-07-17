import { useState } from 'react';
import { Copy, ExternalLink, Link, Zap } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const validateUrl = (input) => {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    let cleanedUrl = url.trim();
    if (!cleanedUrl) {
      setError('Por favor ingresa una URL');
      return;
    }

    if (!/^https?:\/\//i.test(cleanedUrl)) {
      cleanedUrl = 'https://' + cleanedUrl;
    }

    if (!validateUrl(cleanedUrl)) {
      setError('La URL ingresada no es válida');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanedUrl, utm }),
      });

      if (!response.ok) throw new Error('Error al acortar la URL');

      const data = await response.json();
      setShortUrl(data.short);
    } catch (err) {
      setError('Error al acortar la URL');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const clearForm = () => {
    setUrl('');
    setUtm({ source: '', medium: '', campaign: '' });
    setShortUrl('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Link className="h-8 w-8 text-indigo-600 mr-2" />
              <h1 className="text-4xl font-bold text-gray-800">iny.one</h1>
            </div>
            <p className="text-lg text-gray-600">
              Acorta tus URLs y agrega parámetros UTM para mejor tracking
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL a acortar
              </label>
              <input
                type="url"
                placeholder="https://ejemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Parámetros UTM (opcional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="utm_source"
                  value={utm.source}
                  onChange={(e) => setUtm({ ...utm, source: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <input
                  type="text"
                  placeholder="utm_medium"
                  value={utm.medium}
                  onChange={(e) => setUtm({ ...utm, medium: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <input
                  type="text"
                  placeholder="utm_campaign"
                  value={utm.campaign}
                  onChange={(e) => setUtm({ ...utm, campaign: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleShorten}
                disabled={isLoading}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Acortando...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Acortar URL
                  </>
                )}
              </button>

              <button
                onClick={clearForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
            </div>

            {shortUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Link className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">
                    ¡URL acortada exitosamente!
                  </h3>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Tu URL acortada:</p>
                  <div className="flex items-center justify-between">
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-medium break-all"
                    >
                      {shortUrl}
                    </a>
                    <div className="flex ml-2">
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Copiar URL"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Abrir URL"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {copied && (
                  <p className="text-green-600 text-sm">¡Copiado al portapapeles!</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Zap className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Rápido</h3>
              <p className="text-sm text-gray-600">
                Acorta tus URLs en segundos con nuestra interfaz intuitiva
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Link className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">UTM Ready</h3>
              <p className="text-sm text-gray-600">
                Agrega parámetros UTM automáticamente para tracking
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Copy className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Fácil de usar</h3>
              <p className="text-sm text-gray-600">
                Copia y comparte tus URLs acortadas con un solo click
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

