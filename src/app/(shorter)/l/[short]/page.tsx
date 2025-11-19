import dayjs from 'dayjs';
import { headers as getHeaders } from 'next/headers';
import { userAgentFromString } from 'next/server';
import { redirect, notFound } from 'next/navigation';
import { getShortenUrl, updateShortenUrl, clickShortLink } from '@/lib/utils/query';
import { getGeoLocation } from '@/utils/client-info/geolocation';
import { IS_PRODUCTION } from '@/constants';

type IData = {
  destination: string | null;
  expires_at: string | null;
};

export default async function Page({ params }: { params: Promise<{ short: string }> }) {
  const { short } = await params;
  if (!short || short.length <= 0) return notFound();

  let data: IData | null = null;
  const { data: result, error } = await getShortenUrl(short);
  if (error) {
    console.error('getShortenUrl error:', error);
    throw new Error('Error fetching short URL');
  }
  data = result;

  if (!data?.destination) return notFound();

  if (data.expires_at) {
    const now = dayjs();
    const expiresAt = dayjs(data.expires_at);
    if (expiresAt.isValid() && expiresAt.isBefore(now, 'hour')) {
      await updateShortenUrl(short, false);
      return notFound();
    }
  }

  // Registro en background (fire-and-forget)
  if (IS_PRODUCTION) {
    const headerList = await getHeaders();
    const geo = getGeoLocation(headerList as Readonly<Headers>);
    const userAgent = userAgentFromString((headerList as Readonly<Headers>).get('user-agent') || '');
    void clickShortLink(short, {
      ...geo,
      userAgent,
      referer: (headerList as Readonly<Headers>).get('referer'),
    });
  }

  try {
    return redirect(decodeURI(data.destination));
  } catch {
    return redirect(data.destination);
  }
}
