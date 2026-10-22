import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '')
// Supabase now labels the anon key as a "publishable key". Accept both names
// so existing projects and newly-created projects can use the same route.
// Server-only values first: they are least-privilege (the RPC is SECURITY
// DEFINER) and cannot be replaced by a NEXT_PUBLIC_* value at build time.
// The service-role key remains a fallback for older deployments.
const WRITE_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  ''

const RATE_LIMIT = 6
const RATE_WINDOW_MS = 10 * 60 * 1000
const REFERRAL_PATTERN = /^[A-Z0-9]{4,16}$/

// Per-instance best effort. Vercel may run several instances; the database
// unique index is the real duplicate protection.
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

function normalizeReferral(value: unknown): string | null {
  const code = clean(value, 32).toUpperCase()
  return REFERRAL_PATTERN.test(code) ? code : null
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

const SignupSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(120, 'That name is too long.'),
  email: z.string().trim().max(320).email('Enter a valid email address.'),
  country: z.string().trim().max(8).optional().nullable(),
  phone: z
    .string()
    .trim()
    .max(32, 'That phone number is too long.')
    .optional()
    .nullable()
    .refine(
      (value) => !value || /^[+\d][\d\s().-]{4,30}$/.test(value),
      'Enter a valid phone number, or leave it blank.',
    ),
  notify: z.boolean().optional(),
  source: z.string().max(200).optional().nullable(),
  referrer: z.string().max(1000).optional().nullable(),
  ref: z.string().trim().max(32).optional().nullable(),
  // Honeypot: a real person leaves this empty.
  company: z.string().max(200).optional().nullable(),
})

type JoinRow = {
  id?: string
  position?: number | string | null
  referral_code?: string | null
  already_joined?: boolean | null
}

function siteOrigin(request: Request) {
  return (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/+$/, '')
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': '600', 'Cache-Control': 'no-store' } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Send a valid JSON body.' }, { status: 400 })
  }

  const parsed = SignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Please check your details and try again.' },
      { status: 400 },
    )
  }

  // Honeypot: answer 200 so bots move on. The UI never fills this in.
  if (clean(parsed.data.company, 200).length > 0) {
    return NextResponse.json({ success: true, persisted: false })
  }

  const supabase = getClient()
  if (!supabase) {
    console.error('[waitlist] Supabase env vars are missing; signup was not persisted.')
    return NextResponse.json(
      { error: 'The waitlist is not accepting signups right now. Please try again later.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const name = clean(parsed.data.name, 120)
  const email = clean(parsed.data.email, 320).toLowerCase()
  const country = clean(parsed.data.country, 8).toUpperCase() || null
  const phone = clean(parsed.data.phone, 32) || null
  const source = clean(parsed.data.source, 200) || null
  const referrer = clean(parsed.data.referrer, 1000) || null
  const referredBy = normalizeReferral(parsed.data.ref)
  const userAgent = clean(request.headers.get('user-agent'), 500) || null

  const { data, error } = await supabase.rpc('waitlist_join', {
    p_name: name,
    p_email: email,
    p_country: country,
    p_phone: phone,
    p_notify: parsed.data.notify === true,
    p_source: source,
    p_referrer: referrer,
    p_user_agent: userAgent,
    p_referred_by: referredBy,
  })

  if (error) {
    if (error.code === '22023') {
      return NextResponse.json({ error: 'Please check your name and email address.' }, { status: 400 })
    }

    console.error('[waitlist] join failed', error.code, error.message)
    return NextResponse.json(
      { error: 'Unable to join the waitlist right now. Please try again.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  const row = (Array.isArray(data) ? data[0] : data) as JoinRow | null
  const position = typeof row?.position === 'string' ? Number(row.position) : row?.position

  if (
    !row ||
    typeof position !== 'number' ||
    !Number.isFinite(position) ||
    typeof row.referral_code !== 'string' ||
    !row.referral_code
  ) {
    console.error('[waitlist] join returned an unexpected shape')
    return NextResponse.json(
      { error: 'Unable to join the waitlist right now. Please try again.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return NextResponse.json(
    {
      success: true,
      position,
      referralCode: row.referral_code,
      referralUrl: `${siteOrigin(request)}/?ref=${encodeURIComponent(row.referral_code)}`,
      alreadyJoined: row.already_joined === true,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
