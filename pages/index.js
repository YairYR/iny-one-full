import { useEffect, useState } from 'react';
import { Copy, ExternalLink, Link, Zap } from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const [url, setUrl] = useState('');
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.startsWith('es')) setLang('es');
  }, []);

  const texts = {
    es: {
      metaTitle: 'Iny.One – Tiny URLs for anyone',
      metaDescription: 'iny.one te permite acortar enlaces fácilmente y agregar parámetros UTM para mejorar el seguimiento de tus campañas.',
      title: 'Iny One',
      subtitle: 'Tiny URLs for anyone',
      urlPlaceholder: 'https://ejemplo.com',
      urlLabel: 'URL a acortar',
      utmLabel: 'Parámetros UTM (opcional)',
      shortenBtn: 'Acortar URL',
      cleanBtn: 'Limpiar',
      success: '¡URL acortada exitosamente!',
      copy: 'Copiar URL',
      open: 'Abrir URL',
      copied: '¡Copiado al portapapeles!',
      requiredUrl: 'Por favor ingresa una URL',
      invalidUrl: 'La URL ingresada no es válida',
      fast: 'Rápido',
      utmReady: 'UTM Ready',
      easy: 'Fácil de usar',
      fastDesc: 'Acorta tus URLs en segundos con nuestra interfaz intuitiva',
      utmDesc: 'Agrega parámetros UTM automáticamente para tracking',
      easyDesc: 'Copia y comparte tus URLs acortadas con un solo click',
      shortening: 'Acortando...',
      footer: '¿Dudas o problemas? Contáctame por',
      linkedin: 'LinkedIn'
    },
    en: {
      metaTitle: 'Iny.One – Tiny URLs for anyone',
      metaDescription: 'iny.one lets you shorten links easily and add UTM parameters to improve your campaign tracking.',
      title: 'iny one',
      subtitle: 'Tiny URLs for anyone',
      urlPlaceholder: 'https://example.com',
      urlLabel: 'URL to shorten',
      utmLabel: 'UTM Parameters (optional)',
      shortenBtn: 'Shorten URL',
      cleanBtn: 'Clear',
      success: 'URL successfully shortened!',
      copy: 'Copy URL',
      open: 'Open URL',
      copied: 'Copied to clipboard!',
      requiredUrl: 'Please enter a URL',
      invalidUrl: 'The entered URL is not valid',
      fast: 'Fast',
      utmReady: 'UTM Ready',
      easy: 'Easy to use',
      fastDesc: 'Shorten your URLs in seconds with our intuitive interface',
      utmDesc: 'Automatically add UTM parameters for tracking',
      easyDesc: 'Copy and share your short URLs with one click',
      shortening: 'Shortening...',
      footer: 'Questions or issues? Contact me on',
      linkedin: 'LinkedIn'
    }
  };

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
      setError(texts[lang].requiredUrl);
      return;
    }

    if (!/^https?:\/\//i.test(cleanedUrl)) {
      cleanedUrl = 'https://' + cleanedUrl;
    }

    if (!validateUrl(cleanedUrl)) {
      setError(texts[lang].invalidUrl);
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

      if (!response.ok) throw new Error();

      const data = await response.json();
      setShortUrl(data.short);
    } catch {
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
  <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-blue-50 to-indigo-100">
    <Head>
      <title>{texts[lang].metaTitle}</title>
      <meta name="description" content={texts[lang].metaDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="UTF-8" />
    </Head>
    
    <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Link className="h-8 w-8 text-indigo-600 mr-2" />
              <h1 className="text-4xl font-bold text-gray-800">{texts[lang].title}</h1>
            </div>
            <p className="text-lg text-gray-600">{texts[lang].subtitle}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {texts[lang].urlLabel}
              </label>
              <input
                type="url"
                placeholder={texts[lang].urlPlaceholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {texts[lang].utmLabel}
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
                    {texts[lang].shortening}
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    {texts[lang].shortenBtn}
                  </>
                )}
              </button>

              <button
                onClick={clearForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {texts[lang].cleanBtn}
              </button>
            </div>

            {shortUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Link className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {texts[lang].success}
                  </h3>
                </div>

                <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">{texts[lang].copy}</p>
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
                        title={texts[lang].copy}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title={texts[lang].open}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {copied && (
                  <p className="text-green-600 text-sm">{texts[lang].copied}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Zap className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">{texts[lang].fast}</h3>
              <p className="text-sm text-gray-600">{texts[lang].fastDesc}</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Link className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">{texts[lang].utmReady}</h3>
              <p className="text-sm text-gray-600">{texts[lang].utmDesc}</p>
            </div>

            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <Copy className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">{texts[lang].easy}</h3>
              <p className="text-sm text-gray-600">{texts[lang].easyDesc}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-6 text-center text-sm text-gray-500">
        {texts[lang].footer}{' '}
        <a
          href="https://www.linkedin.com/in/yairyuhaniak"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {texts[lang].linkedin}
        </a>
      </footer>
    </div>
  );
}
