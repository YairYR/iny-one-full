export async function getServerSideProps({ params }) {
  const { short } = params;

  try {
    const response = await fetch('https://raw.githubusercontent.com/YairYR/iny-one-full/main/data/urls.json');
    const urls = await response.json();

    const destination = urls[short];

    if (destination) {
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

export default function RedirectPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Redireccionando...</h1>
    </div>
  );
}
//aqui dejareun placeholder
