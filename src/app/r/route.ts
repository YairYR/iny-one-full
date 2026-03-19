import { NextRequest, NextResponse } from "next/server";
import { supabase_service } from "@/infra/db/supabase_service";
import { getShorterRepository } from "@/infra/db/shorter.repository";

type IData = {
  destination: string | null;
  expires_at: string | null;
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  if (!params || !params.has('target') || !params.has('to')) {
    return NextResponse.redirect('/#error');
  }

  const target = params.get('target')!;
  const short = params.get('to')!;

  if (target !== 'page') {
    return NextResponse.redirect('/#error');
  }

  if (!short || !(/[A-Za-z0-9]/.test(short))) {
    return NextResponse.redirect('/#error');
  }

  const shorterRepo = getShorterRepository(supabase_service);
  let data: IData | null = null;
  const { data: result, error } = await shorterRepo.getBySlug(short);
  if (error) {
    console.error('getShortenUrl error:', error);
    // throw new Error('Error fetching short URL');
    return NextResponse.redirect('/#error');
  }
  data = result;

  if (!data?.destination) {
    return NextResponse.redirect('/#error');
  }

  const destination = decodeURI(data.destination);
  const response = NextResponse.redirect(destination, 307);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}