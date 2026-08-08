import { generateMetadata } from '@/app/ui/(main)/page';

jest.mock('next/navigation');

// La home compone `SubscriptionUpgrade`, que arrastra el DTO de usuario y con él
// el cliente de Supabase (ESM sin transformar en Jest). Se corta en esa
// frontera: aquí se prueba la página, no el acceso a datos.
jest.mock('@/data/dto/user-dto', () => ({
  getCurrentUserDTO: jest.fn().mockResolvedValue(null),
  isLoggedIn: jest.fn().mockResolvedValue(false),
}));

/**
 * La home es un Server Component asíncrono, así que renderizarla con
 * @testing-library/react no produce marcado (React no resuelve componentes
 * servidor en el cliente). Lo que sí es verificable —y lo que de verdad importa
 * en esta página— es la metadata: canonical y hreflang sostienen toda la
 * estrategia SEO descrita en el README.
 */
describe('home page metadata', () => {
  it('declares the canonical url and both hreflang alternates', async () => {
    const metadata = await generateMetadata();

    expect(metadata.alternates).toEqual({
      canonical: 'https://iny.one',
      languages: {
        en: 'https://iny.one',
        es: 'https://iny.one/es',
        'x-default': 'https://iny.one',
      },
    });
  });

  it('exposes an OpenGraph card pointing at the canonical url', async () => {
    const metadata = await generateMetadata();

    expect(metadata.openGraph).toMatchObject({
      url: 'https://iny.one',
      siteName: 'iny.one',
      type: 'website',
    });
  });
});
