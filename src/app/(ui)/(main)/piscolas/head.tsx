export default function Head() {
  const title = 'Calculadora de Piscolas | iny.one';
  const description = 'Calcula cuántas botellas de pisco y Coca-Cola comprar según personas, receta, tamaños de botella y presupuesto estimado.';
  const url = 'https://iny.one/piscolas';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="calculadora de piscolas,piscola,pisco coca cola,cuanto pisco comprar,cuanta coca cola comprar,calculadora fiesta chile" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://www.iny.one/og-image.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.iny.one/og-image.png" />
    </>
  );
}
