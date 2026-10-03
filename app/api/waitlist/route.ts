import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getWaitlistCount(): Promise<number | null> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !apiKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/waitlist_submissions?select=email`, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Prefer: 'count=exact',
        Range: '0-0',
      },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const total = response.headers.get('content-range')?.match(/\/(\d+)$/)?.[1];
    return total === undefined ? null : Number(total);
  } catch {
    return null;
  }
}

export async function GET() {
  const count = await getWaitlistCount();
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; name?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Enter your name.' }, { status: 400 });
    }

    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/waitlist_submissions`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY ?? '',
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY ?? ''}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) return NextResponse.json({ error: 'Unable to join the waitlist.' }, { status: 500 });
    const count = await getWaitlistCount();
    return NextResponse.json({ success: true, count });
  } catch {
    return NextResponse.json({ error: 'Unable to join the waitlist.' }, { status: 500 });
  }
}
