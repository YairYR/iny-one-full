import { headers as getHeaders } from 'next/headers';
import { after, NextRequest, NextResponse, userAgentFromString } from 'next/server';
import { getGeoLocation } from '@/lib/utils/geolocation';
import { getShorterRepository } from "@/infra/db/shorter.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { ROUTES } from "@/lib/routes";
import { getTranslations, getLocale } from "next-intl/server";
import { isReservedSlug, normalizeSlug } from '@/lib/reserved-slugs';
import { safeDecodeURI } from '@/lib/utils/url';
import { resolveLinkState } from '@/lib/short-links/resolve-link-state';
import { renderStatusPage } from '@/lib/short-links/status-page';
import { logger } from '@/lib/logger';

const log = logger.child({ route: '[short]' });

export async function GET(request: NextRequest, ctx: RouteContext<'/[short]'>) {
  const { short } = await ctx.params;
  if (!short || short.length <= 0) return render404();

  if (isReservedSlug(normalizeSlug(short))) {
    return render404();
  }

  const shorterRepo = getShorterRepository(supabase_service);
  const { data, error } = await shorterRepo.getBySlug(short);

  if (error) {
    log.error('failed to resolve short link', { slug: short, error });
    return render404();
  }

  const state = resolveLinkState(data);

  if (state === 'expired') {
    // Sólo la primera visita tras caducar necesita escribir; después `status`
    // ya es false y repetirlo sería un write por cada visita.
    if (data?.status === true) {
      await shorterRepo.setStatus(short, false);
    }
    return renderExpired();
  }

  if (state === 'not-found') return render404();

  const headerList = await getHeaders();

  after(async () => {
    const geo = getGeoLocation(headerList as Readonly<Headers>);
    const userAgent = userAgentFromString(
      (headerList as Readonly<Headers>).get('user-agent') || ''
    );

    await shorterRepo.click(short, {
      ...geo,
      userAgent,
      referer: (headerList as Readonly<Headers>).get('referer'),
    });
  });

  // safeDecodeURI: un destino con un `%` suelto haría que `decodeURI` lance
  // URIError y convertiría cada visita al link en un 500.
  const destination = safeDecodeURI(data!.destination!);
  const response = NextResponse.redirect(destination, 307);
  response.headers.set('X-Robots-Tag', 'noindex');
  return response;
}

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "no-store",
  "X-Robots-Tag": "noindex",
} as const;

async function render404() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('404')]);

  const html = renderStatusPage({
    lang: locale,
    metaTitle: t('metaTitle'),
    headline: t('title'),
    subtitle: t('subtitle'),
    footer: t('footer'),
    icon: 'link',
    actions: [
      { href: ROUTES.HOME, label: t('goHome'), variant: 'primary' },
      { href: ROUTES.DASHBOARD, label: t('goDashboard'), variant: 'soft' },
      { href: 'javascript:history.back()', label: t('goBack'), rel: 'nofollow' },
    ],
  });

  return new NextResponse(html, { status: 404, headers: HTML_HEADERS });
}

/**
 * Un enlace que caducó existió: responde 410 Gone, que le dice a los buscadores
 * que lo desindexen en lugar de reintentarlo como haría un 404.
 *
 * Es además la única página del sitio que recibe tráfico de alguien que ya
 * conocía un enlace de iny.one, así que la acción principal invita a registrarse.
 */
async function renderExpired() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations('linkExpired')]);

  const html = renderStatusPage({
    lang: locale,
    metaTitle: t('metaTitle'),
    headline: t('title'),
    subtitle: t('subtitle'),
    footer: t('footer'),
    icon: 'clock',
    actions: [
      { href: ROUTES.REGISTER, label: t('cta'), variant: 'primary' },
      { href: ROUTES.HOME, label: t('goHome'), variant: 'soft' },
    ],
  });

  return new NextResponse(html, { status: 410, headers: HTML_HEADERS });
}
