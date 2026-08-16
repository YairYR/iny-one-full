/**
 * Plantilla HTML de las páginas que devuelve el resolver de enlaces cortos
 * (404 y 410). Se sirven fuera del árbol de React, así que van como cadena.
 *
 * Vive aquí y no dentro del route handler para que las dos variantes compartan
 * estilos en lugar de duplicarlos.
 */

export type StatusPageAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'soft' | 'plain';
  rel?: string;
};

export type StatusPageOptions = {
  lang: string;
  metaTitle: string;
  headline: string;
  subtitle: string;
  actions: StatusPageAction[];
  footer: string;
  icon?: 'link' | 'clock';
};

/** Los textos vienen de las traducciones, pero se interpolan en HTML crudo. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const ICONS = {
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',
  clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
} as const;

export function renderStatusPage({
  lang,
  metaTitle,
  headline,
  subtitle,
  actions,
  footer,
  icon = 'link',
}: StatusPageOptions): string {
  const buttons = actions
    .map(({ href, label, variant = 'plain', rel }) => {
      const cls = variant === 'plain' ? 'btn' : `btn ${variant}`;
      const relAttr = rel ? ` rel="${escapeHtml(rel)}"` : '';
      return `<a class="${cls}" href="${escapeHtml(href)}"${relAttr}>${escapeHtml(label)}</a>`;
    })
    .join('\n        ');

  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${escapeHtml(metaTitle)}</title>
    <meta name="robots" content="noindex" />
    <style>
      :root {
        --bg1: #eef4ff;
        --bg2: #dde8ff;
        --card: #ffffff;
        --border: rgba(15, 23, 42, 0.14);
        --shadow: 0 10px 26px rgba(15, 23, 42, 0.10);
        --text: #0f172a;
        --muted: rgba(15, 23, 42, 0.62);
        --primary: #4f46e5;
        --primaryHover: #4338ca;
        --radius: 16px;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg1: #0b1222;
          --bg2: #0a1020;
          --card: rgba(255, 255, 255, 0.06);
          --border: rgba(255, 255, 255, 0.14);
          --shadow: 0 18px 60px rgba(0, 0, 0, 0.50);
          --text: rgba(255, 255, 255, 0.92);
          --muted: rgba(255, 255, 255, 0.68);
          --primary: #6366f1;
          --primaryHover: #4f46e5;
        }
      }

      * { box-sizing: border-box; }
      html, body { height: 100%; }

      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        color: var(--text);
        background:
          radial-gradient(900px 560px at 30% 10%, rgba(79,70,229,0.16), transparent 62%),
          radial-gradient(820px 520px at 78% 12%, rgba(37,99,235,0.10), transparent 62%),
          linear-gradient(180deg, var(--bg1), var(--bg2));
        display: grid;
        place-items: center;
        padding: 32px 16px;
      }

      .card {
        width: min(720px, 100%);
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 22px;
        text-align: center;
      }

      .icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 10px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background: rgba(79, 70, 229, 0.10);
        border: 1px solid rgba(79, 70, 229, 0.18);
        color: var(--primary);
      }

      @media (prefers-color-scheme: dark) {
        .icon {
          background: rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.22);
        }
      }

      h1 {
        margin: 6px 0 6px;
        font-size: clamp(28px, 3.2vw, 44px);
        letter-spacing: -0.03em;
        line-height: 1.1;
      }

      p {
        margin: 0 auto 16px;
        max-width: 56ch;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.55;
      }

      .actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 8px;
      }

      .btn {
        text-decoration: none;
        font-weight: 800;
        font-size: 14px;
        padding: 11px 14px;
        border-radius: 12px;
        border: 1px solid var(--border);
        color: var(--text);
        background: transparent;
        transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;
      }

      .btn:hover { transform: translateY(-1px); }

      .btn.primary {
        background: var(--primary);
        border-color: transparent;
        color: #fff;
      }

      .btn.primary:hover { background: var(--primaryHover); }

      .btn.soft {
        background: rgba(79, 70, 229, 0.08);
        border-color: rgba(79, 70, 229, 0.18);
      }

      @media (prefers-color-scheme: dark) {
        .btn.soft {
          background: rgba(99, 102, 241, 0.14);
          border-color: rgba(99, 102, 241, 0.22);
        }
      }

      .foot {
        margin-top: 14px;
        font-size: 13px;
        color: var(--muted);
      }

      .foot a { color: var(--primary); font-weight: 800; text-decoration: none; }
      .foot a:hover { text-decoration: underline; }
    </style>
  </head>

  <body>
    <main class="card" role="region" aria-label="${escapeHtml(headline)}">
      <div class="icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${ICONS[icon]}
        </svg>
      </div>

      <h1>${escapeHtml(headline)}</h1>
      <p>${escapeHtml(subtitle)}</p>

      <div class="actions">
        ${buttons}
      </div>

      <div class="foot">
        <a href="/" rel="nofollow">iny.one</a> · ${escapeHtml(footer)}
      </div>
    </main>
  </body>
</html>`;
}
