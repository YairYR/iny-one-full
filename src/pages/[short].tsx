import type { GetServerSideProps } from "next";
import { clickShortLink, getShortenUrl } from "@/lib/utils/query";
import { userAgentFromString } from 'next/server';
import { getGeoLocation } from "@/utils/client-info/geolocation";

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
      const headers = context.req.headers;
      const geolocation = getGeoLocation(headers);
      const userAgent = userAgentFromString(headers['user-agent']);
      await clickShortLink(short, {
        ...geolocation,
        userAgent,
        referer: headers['referer'],
      });

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

