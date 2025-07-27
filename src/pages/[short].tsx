import { supabase } from '@/lib/supabase';

export const getServerSideProps = async ({ params }: any) => {
  const { short } = params;

  try {
    const { data, error } = await supabase
      .from('short_links')
      .select('destination')
      .eq('slug', short)
      .limit(1);

    if (error) {
      console.error('Error querying Supabase:', error.message);
      return { notFound: true };
    }

    if (data && data.length > 0) {
      return {
        redirect: {
          destination: data[0].destination,
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
