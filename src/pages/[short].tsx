import fs from 'fs';
import path from 'path';

export const getServerSideProps = async ({ params }: any) => {
  const { short } = params;

  try {
    const filePath = path.join(process.cwd(), 'data', 'urls.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const urls = JSON.parse(fileContent);

    const destination = urls[short];

    if (destination) {
      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }

    return { notFound: true };
  } catch (error) {
    console.error('Error reading local urls.json:', error);
    return { notFound: true };
  }
};

const RedirectPage = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Redireccionando...</h1>
    </div>
  );
};

export default RedirectPage;
