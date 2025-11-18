import { after, NextRequest, NextResponse } from 'next/server';
import { clickShortLink, getShortenUrl, updateShortenUrl } from '@/lib/utils/query';
import { userAgentFromString } from 'next/server';
import { getGeoLocation } from '@/utils/client-info/geolocation';
import { headers as getHeaders } from "next/headers";
import { IS_PRODUCTION } from "@/constants";
import dayjs from "dayjs";

type IData = {
  destination: string | null;
  expires_at: string | null;
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ short: string }> }) {
  const { short } = await ctx.params;

  // Evita indexación de Google y otros buscadores
  const headers = new Headers();
  headers.set('X-Robots-Tag', 'noindex, nofollow');

  if (!short || short.length <= 0) {
    return new NextResponse('Not found', { status: 404, headers });
  }

  let data: IData|null;
  try {
    const { data: result, error } = await getShortenUrl(short);
    if (error) throw error;
    data = result;
  } catch (err) {
    console.error(err);
    return new NextResponse('Unexpected error', { status: 500, headers });
  }

  const get404URL = () => {
    const url = new URL(_req.url);
    url.pathname = '/404';
    return url;
  }

  if (!data?.destination) {
    // return new NextResponse('Not found', { status: 404, headers });
    return NextResponse.redirect(get404URL(), { status: 302, headers });
    // return notFound();
  }

  if(data.expires_at) {
    const now = dayjs();
    const expiresAt = dayjs(data.expires_at);

    if(expiresAt.isValid() && expiresAt.isBefore(now, 'hour')) {
      await updateShortenUrl(short, false);
      // return new NextResponse('Not found', { status: 404, headers });
      return NextResponse.redirect(get404URL(), { status: 302, headers });
      // notFound();
    }
  }

  // Obtener info de headers
  const headerList = await getHeaders();
  after(async () => {
    if(IS_PRODUCTION) {
      const geo = getGeoLocation(headerList);
      const userAgent = userAgentFromString(_req.headers.get('user-agent') || '');
      await clickShortLink(short, {
        ...geo,
        userAgent,
        referer: _req.headers.get('referer'),
      });
    }
  });

  return NextResponse.redirect(decodeURI(data.destination), { status: 302, headers });
}

