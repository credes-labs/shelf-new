import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const siteURL = (): string => (process.env.SITE_URL || '').replace(/\/+$/, '')
const secret = (): string => process.env.REVALIDATE_SECRET || ''

/**
 * Tell the Next.js site that a post changed so it can rebuild the affected
 * static pages. Best effort: a CMS save must never fail because the site is
 * down, mid-deploy, or not configured yet.
 */
async function pingSite(slug?: string): Promise<void> {
  if (!siteURL() || !secret() || !slug) return
  try {
    const response = await fetch(`${siteURL()}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret(),
      },
      body: JSON.stringify({ slug }),
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) throw new Error(`site responded ${response.status}`)
    console.info(`[payload] Revalidated /blog/${slug}`)
  } catch (error) {
    console.warn('[payload] Could not revalidate the site:', error instanceof Error ? error.message : error)
  }
}

export const revalidatePost: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  const slugs = new Set<string>()
  if (typeof doc?.slug === 'string') slugs.add(doc.slug)
  if (typeof previousDoc?.slug === 'string') slugs.add(previousDoc.slug)
  await Promise.all([...slugs].map((slug) => pingSite(slug)))
  return doc
}

export const revalidatePostAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await pingSite(typeof doc?.slug === 'string' ? doc.slug : undefined)
  return doc
}
