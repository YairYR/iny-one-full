import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function AboutPage() {
  const [lang, setLang] = useState<'en' | 'es'>('en');

  useEffect(() => {
    const userLang = navigator.language || navigator.userLanguage;
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
    },
  };

  const t = texts[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

        <p className="text-lg text-gray-700">{t.contact}</p>
      </main>
    </div>
  );
}
