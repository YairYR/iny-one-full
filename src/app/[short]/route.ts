import { after, NextRequest, NextResponse } from 'next/server';
import { clickShortLink, getShortenUrl } from '@/lib/utils/query';
import { userAgentFromString } from 'next/server';
import { getGeoLocation } from '@/utils/client-info/geolocation';
import { headers as getHeaders } from "next/headers";
import { IS_PRODUCTION } from "@/constants";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ short: string }> }) {
  const { short } = await ctx.params;

  // Evita indexación de Google y otros buscadores
  const headers = new Headers();
  headers.set('X-Robots-Tag', 'noindex, nofollow');

  if (!short || short.length <= 0) {
    return new NextResponse('Not found', { status: 404, headers });
  }

  try {
    const { data, error } = await getShortenUrl(short);
    if (error || !data?.destination) {
      return new NextResponse('Not found', { status: 404, headers });
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
  } catch (err) {
    return new NextResponse('Unexpected error', { status: 500, headers });
  }
}

