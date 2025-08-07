import { getShortenUrl } from "@/lib/utils/query";

interface Props {
  params: {
    short: string;
  }
}

export const getServerSideProps = async ({ params }: Props) => {
  const { short } = params;

  try {
    const { data, error } = await getShortenUrl(short);

    if (error) {
      console.error('Error querying Supabase:', error.message);
      return { notFound: true };
    }

    if (data?.destination) {
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

