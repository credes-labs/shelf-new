import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Called by the Payload CMS after a post changes. Clears the cached blog
 * fetches and the affected static pages so edits appear without a redeploy.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  const provided = request.headers.get('x-revalidate-secret')

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let slug: string | undefined
  try {
    const body = (await request.json()) as { slug?: unknown }
    if (typeof body.slug === 'string' && /^[a-z0-9-]{1,96}$/.test(body.slug)) slug = body.slug
  } catch {
    /* An empty body is fine: it just refreshes the index. */
  }

  revalidateTag('blog')
  revalidatePath('/blog')
  if (slug) revalidatePath(`/blog/${slug}`)

  return NextResponse.json({ revalidated: true, slug: slug ?? null, now: Date.now() })
}
