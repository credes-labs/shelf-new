import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
const WRITE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RATE_LIMIT = 6
const RATE_WINDOW_MS = 10 * 60 * 1000

// Per-instance best effort. Vercel may run several instances; the database
// unique constraint is the real duplicate protection.
const recentHits = new Map<string, number[]>()

let client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !WRITE_KEY) return null
  if (!client) {
    client = createClient(SUPABASE_URL, WRITE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { 'x-application-name': 'shelf-site' } },
    })
  }
  return client
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (recentHits.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS)
  if (hits.length >= RATE_LIMIT) {
    recentHits.set(ip, hits)
    return true
  }
  hits.push(now)
  recentHits.set(ip, hits)

  if (recentHits.size > 5000) {
    recentHits.forEach((times, key) => {
      if (!times.some((at) => now - at < RATE_WINDOW_MS)) recentHits.delete(key)
    })
  }
  return false
}

function clean(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

async function readCount(supabase: SupabaseClient): Promise<number | null> {
  try {
    const { data, error } = await supabase.rpc('waitlist_count')
    if (!error) {
      const parsed = typeof data === 'number' ? data : typeof data === 'string' ? Number(data) : null
      if (parsed !== null && Number.isFinite(parsed)) return parsed
    }
  } catch {
    /* fall through to the service-role count */
  }

  try {
    const { count, error } = await supabase
      .from('waitlist_submissions')
      .select('id', { count: 'exact', head: true })
    if (!error && typeof count === 'number') return count
  } catch {
    /* the counter is decorative; never fail the request for it */
  }

  return null
}

export async function GET() {
  const supabase = getClient()
  const count = supabase ? await readCount(supabase) : null
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } })
}

type SignupBody = {
  name?: unknown
  email?: unknown
  country?: unknown
  phone?: unknown
  notify?: unknown
  source?: unknown
  referrer?: unknown
  company?: unknown
}

export async function POST(request: Request) {
  const supabase = getClient()

  if (!supabase) {
    // Local development without keys should still exercise the UI, but a
    // deployed site must never pretend a signup was saved.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'The waitlist is not accepting signups right now. Please try again later.' },
        { status: 503 },
      )
    }
    console.warn('[waitlist] Supabase env vars are missing; signup was not persisted.')
    return NextResponse.json({ success: true, count: null, persisted: false })
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': '600' } },
    )
  }

  let body: SignupBody
  try {
    body = (await request.json()) as SignupBody
  } catch {
    return NextResponse.json({ error: 'Send a valid JSON body.' }, { status: 400 })
  }

  // Honeypot: real people never fill this in. Answer 200 so bots move on.
  if (clean(body.company, 1).length > 0) {
    return NextResponse.json({ success: true, count: null })
  }

  const name = clean(body.name, 120)
  const email = clean(body.email, 320).toLowerCase()
  const country = clean(body.country, 8).toUpperCase() || null
  const phone = clean(body.phone, 32) || null
  const notify = body.notify === true
  const source = clean(body.source, 200) || null
  const referrer = clean(body.referrer, 1000) || null
  const userAgent = clean(request.headers.get('user-agent'), 500) || null

  if (!name) return NextResponse.json({ error: 'Enter your name.' }, { status: 400 })
  if (!email || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (phone && !/^[+\d][\d\s().-]{4,30}$/.test(phone)) {
    return NextResponse.json({ error: 'Enter a valid phone number, or leave it blank.' }, { status: 400 })
  }

  const { error } = await supabase.from('waitlist_submissions').insert({
    email,
    name,
    country_code: country,
    phone,
    notify_opt_in: notify,
    source,
    referrer,
    user_agent: userAgent,
  })

  if (error) {
    // 23505 = unique_violation: already on the list, which is a success for
    // the visitor. Do not reveal anything else about the existing row.
    if (error.code === '23505') {
      const count = await readCount(supabase)
      return NextResponse.json({ success: true, alreadyJoined: true, count })
    }

    console.error('[waitlist] insert failed', error.code, error.message)
    return NextResponse.json(
      { error: 'Unable to join the waitlist right now. Please try again.' },
      { status: 500 },
    )
  }

  const count = await readCount(supabase)
  return NextResponse.json({ success: true, count })
}
