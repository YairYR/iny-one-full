import { renderStatusPage } from '@/lib/short-links/status-page';

const base = {
  lang: 'es',
  metaTitle: 'Enlace caducado | iny.one',
  headline: 'Este enlace ha caducado',
  subtitle: 'Los enlaces creados sin cuenta caducan a los 180 días.',
  footer: 'Acortador de URLs con UTM',
  actions: [
    { href: '/auth/register', label: 'Crear cuenta gratis', variant: 'primary' as const },
    { href: '/', label: 'Acortar otro enlace', variant: 'soft' as const },
  ],
};

describe('renderStatusPage', () => {
  it('renders the copy and the language', () => {
    const html = renderStatusPage(base);

    expect(html).toContain('<html lang="es">');
    expect(html).toContain('<title>Enlace caducado | iny.one</title>');
    expect(html).toContain('Este enlace ha caducado');
    expect(html).toContain('Los enlaces creados sin cuenta caducan a los 180 días.');
  });

  it('always asks not to be indexed', () => {
    expect(renderStatusPage(base)).toContain('<meta name="robots" content="noindex" />');
  });

  it('renders every action with its variant', () => {
    const html = renderStatusPage(base);

    expect(html).toContain('<a class="btn primary" href="/auth/register">Crear cuenta gratis</a>');
    expect(html).toContain('<a class="btn soft" href="/">Acortar otro enlace</a>');
  });

  it('renders a plain action and its rel attribute', () => {
    const html = renderStatusPage({
      ...base,
      actions: [{ href: 'javascript:history.back()', label: 'Atrás', rel: 'nofollow' }],
    });

    expect(html).toContain('class="btn"');
    expect(html).toContain('rel="nofollow"');
  });

  // Los textos vienen de las traducciones, pero se interpolan en HTML crudo.
  it('escapes text so it cannot inject markup', () => {
    const html = renderStatusPage({
      ...base,
      headline: '<script>alert(1)</script>',
      subtitle: 'comillas " y ampersand &',
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&quot;');
    expect(html).toContain('&amp;');
  });

  it('picks the icon requested', () => {
    expect(renderStatusPage({ ...base, icon: 'clock' })).toContain('<circle cx="12" cy="12" r="10">');
    expect(renderStatusPage({ ...base, icon: 'link' })).toContain('M10 13a5 5 0');
  });
});
