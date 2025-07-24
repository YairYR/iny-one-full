import { getShortenUrl } from "@/lib/utils/query";
import { Url } from "@/prisma/client";

interface Props {
  params: { short: string }
}

export const getServerSideProps = async ({ params }: Props) => {
  const { short } = params;

  try {
    const uri = await getShortenUrl(short);
    console.dir(uri, { depth: null });

    if (uri) {
      const destination = formatShortenUrl(uri);

      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }

    return {
      notFound: true,
    };
  } catch (error) {
    console.error('Error al leer URLs:', error);
    return {
      notFound: true,
    };
  }
}

const formatShortenUrl = (uri: Url) => {
  const url = new URL(uri.reference);

  if(uri.utm_source) url.searchParams.set("utm_source", uri.utm_source);
  if(uri.utm_medium) url.searchParams.set("utm_medium", uri.utm_medium);
  if(uri.utm_campain) url.searchParams.set("utm_campain", uri.utm_campain);
  if(uri.utm_content) url.searchParams.set("utm_content", uri.utm_content);
  if(uri.utm_term)url.searchParams.set("utm_term", uri.utm_term);
  if(uri.utm_id)url.searchParams.set("id", uri.utm_id);
  if(uri.utm_product)url.searchParams.set("utm_product", uri.utm_product);

  return url.toString();
}

const RedirectPage = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Redireccionando...</h1>
    </div>
  );
}
//aqui dejareun placeholder

export default RedirectPage;