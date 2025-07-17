import { urlDatabase } from './api/shorten';

export async function getServerSideProps(context) {
  const { id } = context.params;
  const entry = urlDatabase[id];

  if (entry) {
    entry.clicks += 1;
    return {
      redirect: {
        destination: entry.fullUrl,
        permanent: false,
      },
    };
  }

  return {
    notFound: true,
  };
}

export default function RedirectPage() {
  return <p>Redirigiendo...</p>;
}
