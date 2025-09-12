import type { GetServerSideProps } from "next";
import { clickShortUrl, getShortenUrl } from "@/lib/utils/query";

type Params = {
  short: string;
}

export const getServerSideProps: GetServerSideProps<never, Params> = async (context) => {
  const { short } = context?.params ?? {};

  // Evita indexación de Google y otros buscadores
  context.res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if(!short || short.length <= 0) {
    return { notFound: true };
  }

  try {
    const { data, error } = await getShortenUrl(short);

    if (error) {
      console.error('Error querying Supabase:', error.message);
      return { notFound: true };
    }

    if (data?.destination) {
      await clickShortUrl(short);

      return {
        redirect: {
          destination: decodeURI(data.destination),
          permanent: false,
        },
      };
    }

    return { notFound: true };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { notFound: true };
  }
};

const RedirectPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Redireccionando...</h1>
  </div>
);

export default RedirectPage;

