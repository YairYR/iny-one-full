import { getShortenUrl } from "@/lib/utils/query";
import { ShortenUrl } from "@/lib/types";

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

const formatShortenUrl = (uri: ShortenUrl) => {
  let formatted = `${uri.protocol}://`;

  if(uri.subdomain) formatted += `${uri.subdomain}.`;
  formatted += uri.domain;
  if(uri.path) formatted += uri.path;
  if(uri.hash) formatted += uri.hash;

  if(uri.utms.length > 0) {
    const utmParams = uri.utms.reduce((prev, current, index) => {
      if(index === 0) {
        return `?${current.name}=${current.content}`;
      }
      return prev + `&${current.name}=${current.content}`;
    }, '');

    formatted += utmParams;
  }

  return formatted;
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