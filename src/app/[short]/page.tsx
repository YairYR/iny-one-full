import dayjs from 'dayjs';
import { headers as getHeaders } from 'next/headers';
import { userAgentFromString } from 'next/server';
import { redirect, notFound } from 'next/navigation';
import { getGeoLocation } from '@/lib/utils/geolocation';
import { getShorterRepository } from "@/infra/db/shorter.repository";
import { supabase_service } from "@/infra/db/supabase_service";

type IData = {
  destination: string | null;
  expires_at: string | null;
};

export default async function ShorterPage({ params }: { params: Promise<{ short: string }> }) {
  const { short } = await params;
  if (!short || short.length <= 0) return notFound();

  const shorterRepo = getShorterRepository(supabase_service);

  let data: IData | null = null;
  const { data: result, error } = await shorterRepo.getBySlug(short);
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
      await shorterRepo.setStatus(short, false);
      return notFound();
    }
  }

  // Registro en background (fire-and-forget)
  const headerList = await getHeaders();
  const geo = getGeoLocation(headerList as Readonly<Headers>);
  const userAgent = userAgentFromString((headerList as Readonly<Headers>).get('user-agent') || '');
  void shorterRepo.click(short, {
    ...geo,
    userAgent,
    referer: (headerList as Readonly<Headers>).get('referer'),
  });

  try {
    return redirect(decodeURI(data.destination));
  } catch {
    return redirect(data.destination);
  }
}
