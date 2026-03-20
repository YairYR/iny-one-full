import dayjs from 'dayjs';
import { headers as getHeaders } from 'next/headers';
import { after, NextRequest, NextResponse, userAgentFromString } from 'next/server';
import { getGeoLocation } from '@/lib/utils/geolocation';
import { getShorterRepository } from "@/infra/db/shorter.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { ROUTES } from "@/lib/routes";
import { getTranslations, getLocale } from "next-intl/server";

type IData = {
  destination: string | null;
  expires_at: string | null;
};

export async function GET(request: NextRequest, ctx: RouteContext<'/[short]'>) {
  const { short } = await ctx.params;
  if (!short || short.length <= 0) return render404();

  const shorterRepo = getShorterRepository(supabase_service);

  let data: IData | null = null;
  const { data: result, error } = await shorterRepo.getBySlug(short);
  if (error) {
    console.error('getShortenUrl error:', error);
    return render404();
  }
  data = result;

  if (!data?.destination) return render404();

  if (data.expires_at) {
    const now = dayjs();
    const expiresAt = dayjs(data.expires_at);
    if (expiresAt.isValid() && expiresAt.isBefore(now, 'hour')) {
      await shorterRepo.setStatus(short, false);
      return render404();
    }
  }

  if (!data?.destination) {
    return render404();
  }

  // Registro en background (fire-and-forget)
  const headerList = await getHeaders();
  after(async () => {
    const geo = getGeoLocation(headerList as Readonly<Headers>);
    const userAgent = userAgentFromString((headerList as Readonly<Headers>).get('user-agent') || '');
    await shorterRepo.click(short, {
      ...geo,
      userAgent,
      referer: (headerList as Readonly<Headers>).get('referer'),
    });
  });

  const destination = decodeURI(data.destination);
  const response = NextResponse.redirect(destination, 307);
  response.headers.set('X-Robots-Tag', 'noindex');
  return response;
}

async function render404() {
  const html = await get404();
  return new NextResponse(html, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "X-Robots-Tag": "noindex"
    },
  });
}

async function get404() {
  const locale = await getLocale();
  const t = await getTranslations('404');
  const texts = {
    head: {
      lang: locale,
      title: t('metaTitle'),
      description: t('metaDescription'),
    },
    title: t('title'),
    subtitle: t('subtitle'),
    goBack: t('goBack'),
    goHome: t('goHome'),
    goDashboard: t('goDashboard'),
    footer: t('footer'),
  };
  const links = {
    goBack: 'javascript:history.back()',
    goHome: ROUTES.HOME,
    goDashboard: ROUTES.DASHBOARD,
  }

  return `<!doctype html>
<html lang="${texts.head.lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <title>${texts.head.title}</title>
    <meta name="title" />
    <meta name="robots" content="noindex" />
    <style>
      :root {
        /* Alineado a tu estética: fondo frío + acento índigo/violeta */
        --bg1: #eef4ff;
        --bg2: #dde8ff;

        --card: #ffffff;
        --border: rgba(15, 23, 42, 0.14);
        --shadow: 0 10px 26px rgba(15, 23, 42, 0.10);

        --text: #0f172a;
        --muted: rgba(15, 23, 42, 0.62);

        --primary: #4f46e5;
        --primaryHover: #4338ca;

        /* Complementario “amable” para detalles */
        --accent: #2563eb;

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
          --accent: #60a5fa;
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
        font-size: clamp(32px, 3.5vw, 52px);
        letter-spacing: -0.03em;
        line-height: 1.05;
      }

      p {
        margin: 0 auto 16px;
        max-width: 60ch;
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
    <main class="card" role="region" aria-label="404">
      <div class="icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link h-8 w-8 text-indigo-600 mr-2" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </div>

      <h1>${texts.title}</h1>
      <p>${texts.subtitle}</p>

      <div class="actions">
        <a class="btn primary" href="${links.goHome}">${texts.goHome}</a>
        <a class="btn soft" href="${links.goDashboard}">${texts.goDashboard}</a>
        <a class="btn" href="${links.goBack}" rel="nofollow">${texts.goBack}</a>
      </div>

      <div class="foot">
        <a href="${links.goHome}" rel="nofollow">iny.one</a> · ${texts.footer}
      </div>
    </main>
  </body>
</html>`;
}
