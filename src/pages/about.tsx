import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


export default function AboutPage() {
  const [lang, setLang] = useState<'en' | 'es'>('en');

  useEffect(() => {
    const userLang = navigator.language;
    if (userLang.startsWith('es')) setLang('es');
  }, []);

  const texts = {
    es: {
      title: 'Acerca de iny.one',
      metaTitle: 'Acerca de – iny.one',
      metaDescription: 'Conoce más sobre el propósito, visión y futuro de iny.one, un acortador de enlaces ligero y gratuito.',
      intro: 'iny.one es un acortador de URLs gratuito y ligero, pensado para marketers, desarrolladores y creadores de contenido que necesitan medir campañas fácilmente con parámetros UTM.',
      why: 'Este proyecto nació de la necesidad de compartir enlaces limpios, medibles y sin depender de plataformas pesadas. Quise construir una solución rápida, funcional y enfocada en privacidad.',
      futureTitle: '¿Qué sigue?',
      roadmap: [
        'Generador de códigos QR integrado',
        'Estadísticas básicas por enlace (clics, referer, etc.)',
        'Panel de gestión para usuarios registrados',
      ],
      contact: '¿Tienes ideas o detectaste un problema? Estoy abierto a sugerencias.',
      faqTitle: 'Preguntas Frecuentes',
      faqs: [
        {
          q: '¿Qué es iny.one?',
          a: 'Es una herramienta gratuita para acortar URLs y añadir parámetros UTM fácilmente, permitiendo un mejor seguimiento de campañas.'
        },
        {
          q: '¿iny.one es gratuito?',
          a: 'Sí, el servicio es completamente gratuito y no requiere registro.'
        },
        {
          q: '¿Qué son los parámetros UTM?',
          a: 'Los parámetros UTM permiten rastrear el origen del tráfico web en tus campañas de marketing.'
        },
        {
          q: '¿Puedo ver estadísticas de los enlaces?',
          a: 'Por ahora no, pero estamos trabajando en ello.'
        },
        {
          q: '¿iny.one guarda mis datos?',
          a: 'No recopilamos ni almacenamos datos personales. Las URLs acortadas se usan solo para redirección.'
        }
      ]
    },
    en: {
      title: 'About iny.one',
      metaTitle: 'About – iny.one',
      metaDescription: 'Learn about the purpose, vision, and future of iny.one, a lightweight and free URL shortener.',
      intro: 'iny.one is a free and lightweight URL shortener, designed for marketers, developers, and content creators who need to easily track campaigns using UTM parameters.',
      why: 'This project was born from the need to share clean, trackable links without relying on heavy platforms. I wanted to build a fast, privacy-focused and useful tool.',
      futureTitle: 'What’s next?',
      roadmap: [
        'Built-in QR code generator',
        'Basic link stats (clicks, referer, etc.)',
        'Dashboard for registered users',
      ],
      contact: 'Have ideas or found a bug? I’m open to feedback.',
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        {
          q: 'What is iny.one?',
          a: 'It’s a free tool to shorten URLs and add UTM parameters for better campaign tracking.'
        },
        {
          q: 'Is iny.one free?',
          a: 'Yes, the service is completely free and does not require registration.'
        },
        {
          q: 'What are UTM parameters?',
          a: 'UTM parameters let you track the origin of web traffic in your marketing campaigns.'
        },
        {
          q: 'Can I see stats for my links?',
          a: 'Not yet, but we’re working on it.'
        },
        {
          q: 'Does iny.one store my data?',
          a: 'We don’t collect or store personal data. Shortened URLs are used only for redirection.'
        }
      ]
    }
  };

  const t = texts[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: t.faqs.map(faq => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.a
                }
              }))
            })
          }}
        />
      </Head>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">{t.title}</h1>

        <p className="text-lg text-gray-700 mb-6">{t.intro}</p>
        <p className="text-lg text-gray-700 mb-6">{t.why}</p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.futureTitle}</h2>
        <ul className="list-disc list-inside text-gray-700 mb-6">
          {t.roadmap.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <p className="text-lg text-gray-700 mb-12">{t.contact}</p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{t.faqTitle}</h2>
        <div className="space-y-6 mb-10">
          {t.faqs.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-800">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
<Link
  href="/"
  className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
>
  <ArrowLeft className="h-4 w-4 mr-2" />
  Volver al inicio
</Link>

      </main>
    </div>
  );
}
