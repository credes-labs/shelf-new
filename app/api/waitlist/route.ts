import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
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
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to join the waitlist.' }, { status: 500 });
  }
}
