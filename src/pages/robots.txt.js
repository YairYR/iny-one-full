export async function getServerSideProps({ res }) {
  const content = `User-agent: *
Allow: /

Sitemap: https://iny.one/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain');
  res.write(content);
  res.end();

  return { props: {} };
}

export default function Robots() {
  return null;
}
