import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  console.log('============ webhook ============');
  console.log('--- HEADERS ---');
  console.log(request.headers);
  console.log('--- BODY ---');
  console.log(body);

  return NextResponse.json({});
}