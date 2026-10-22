import { fallbackPosts, getFallbackPost, type FallbackPost } from './blog-fallback'
import { blocksToLexical, estimateReadingTime, type LexicalValue } from './lexical'
import { mediaUrl } from './media'

/**
 * Blog data comes from Payload when PAYLOAD_URL is set. If the CMS is missing
 * or unreachable the site keeps rendering the bundled articles, so a CMS
 * outage (or a local checkout with no env) never breaks the blog.
 */

const PAYLOAD_URL = (process.env.PAYLOAD_URL || '').replace(/\/+$/, '')
const REVALIDATE_SECONDS = Number.parseInt(process.env.PAYLOAD_REVALIDATE_SECONDS || '60', 10)

export const cmsConfigured = Boolean(PAYLOAD_URL)

type CmsMedia = {
  id: string | number
  url?: string | null
  alt?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<string, { url?: string | null; width?: number | null; height?: number | null } | undefined>
}

type CmsCategory = { id: string | number; title?: string | null; slug?: string | null }

type CmsPost = {
  id: string | number
  title: string
  slug: string
  excerpt?: string | null
  category?: CmsCategory | string | number | null
  coverImage?: CmsMedia | string | number | null
  tags?: string[] | null
  author?: string | null
  publishedAt?: string | null
  readingTime?: number | null
  featured?: boolean | null
  seriesNote?: string | null
  content?: LexicalValue | null
  meta?: {
    title?: string | null
    description?: string | null
    image?: CmsMedia | string | number | null
  } | null
}

type CmsList = { docs?: CmsPost[] }

export type BlogImage = {
  url: string
  alt: string
  caption: string | null
  width: number | null
  height: number | null
}

export type BlogPost = {
  slug: string
  title: string
  category: string
  excerpt: string
  dateLabel: string
  publishedAt: string
  author: string
  readingTime: number
  cover: BlogImage | null
  tags: string[]
  seriesNote: string | null
  content: LexicalValue
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
  seo: { title: string; description: string; image: string | null }
  featured: boolean
  source: 'cms' | 'fallback'
}

export type BlogIndex = {
  posts: BlogPost[]
  usingFallback: boolean
  cmsConfigured: boolean
}

const EMPTY_CONTENT: LexicalValue = {
  root: { type: 'root', children: [] } as unknown as LexicalValue['root'],
}

function formatDate(iso?: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function imageFromMedia(media: CmsMedia | string | number | null | undefined): BlogImage | null {
  if (!media || typeof media !== 'object') return null
  const hero = media.sizes?.hero
  const url = mediaUrl(hero?.url ?? media.url)
  if (!url) return null
  return {
    url,
    alt: media.alt?.trim() || '',
    caption: media.caption?.trim() || null,
    width: hero?.width ?? media.width ?? null,
    height: hero?.height ?? media.height ?? null,
  }
}

async function cmsGet<T>(path: string): Promise<T | null> {
  if (!PAYLOAD_URL) return null
  try {
    const response = await fetch(`${PAYLOAD_URL}/api${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: Number.isFinite(REVALIDATE_SECONDS) ? REVALIDATE_SECONDS : 60, tags: ['blog'] },
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

function neighbors(posts: BlogPost[], slug: string): Pick<BlogPost, 'prev' | 'next'> {
  const chronological = [...posts].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  )
  const index = chronological.findIndex((post) => post.slug === slug)
  return {
    prev: index > 0 ? { slug: chronological[index - 1].slug, title: chronological[index - 1].title } : null,
    next:
      index >= 0 && index < chronological.length - 1
        ? { slug: chronological[index + 1].slug, title: chronological[index + 1].title }
        : null,
  }
}

function normalizeCmsPost(doc: CmsPost): BlogPost {
  const category = doc.category && typeof doc.category === 'object' ? doc.category.title ?? 'Notes' : 'Notes'
  const cover = imageFromMedia(doc.coverImage)
  const seoImage = imageFromMedia(doc.meta?.image)
  const publishedAt = doc.publishedAt ?? new Date().toISOString()
  return {
    slug: doc.slug,
    title: doc.title,
    category,
    excerpt: doc.excerpt ?? '',
    dateLabel: formatDate(publishedAt),
    publishedAt,
    author: doc.author?.trim() || 'Divyaraj Chauhan',
    readingTime: doc.readingTime && doc.readingTime > 0 ? doc.readingTime : 1,
    cover,
    tags: Array.isArray(doc.tags) ? doc.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    seriesNote: doc.seriesNote?.trim() || null,
    content: doc.content ?? EMPTY_CONTENT,
    prev: null,
    next: null,
    seo: {
      title: doc.meta?.title?.trim() || `${doc.title} · Shelf`,
      description: doc.meta?.description?.trim() || doc.excerpt || '',
      image: seoImage?.url ?? cover?.url ?? null,
    },
    featured: Boolean(doc.featured),
    source: 'cms',
  }
}

function normalizeFallback(post: FallbackPost): BlogPost {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.intro,
    dateLabel: formatDate(post.publishedAt) || post.date,
    publishedAt: post.publishedAt,
    author: 'Divyaraj Chauhan',
    readingTime: estimateReadingTime(post.content),
    cover: null,
    tags: post.tags,
    seriesNote: post.series ?? null,
    content: blocksToLexical(post.content),
    prev: post.prev ?? null,
    next: post.next ?? null,
    seo: {
      title: `${post.title} · Shelf`,
      description: post.intro,
      image: null,
    },
    featured: post.featured,
    source: 'fallback',
  }
}

function fallbackIndex(): BlogIndex {
  return {
    posts: fallbackPosts.map(normalizeFallback),
    usingFallback: true,
    cmsConfigured,
  }
}

/** Sort so pinned posts lead the index, otherwise newest first. */
function orderForIndex(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })
}

export async function loadBlogIndex(): Promise<BlogIndex> {
  if (!PAYLOAD_URL) return fallbackIndex()

  const data = await cmsGet<CmsList>('/posts?limit=200&depth=2&sort=-publishedAt')
  if (!data || !Array.isArray(data.docs)) return fallbackIndex()

  const normalized = data.docs.map((doc) => normalizeCmsPost(doc))
  // Second pass now that every post exists, so prev/next see the full list.
  for (const post of normalized) {
    const links = neighbors(normalized, post.slug)
    post.prev = links.prev
    post.next = links.next
  }

  return { posts: orderForIndex(normalized), usingFallback: false, cmsConfigured }
}

export async function loadBlogPost(slug: string): Promise<{ post: BlogPost | null; usingFallback: boolean }> {
  const index = await loadBlogIndex()
  const post = index.posts.find((entry) => entry.slug === slug) ?? null
  if (!post && index.usingFallback) {
    const fallback = getFallbackPost(slug)
    if (fallback) return { post: normalizeFallback(fallback), usingFallback: true }
  }
  return { post, usingFallback: index.usingFallback }
}

export async function loadBlogSlugs(): Promise<string[]> {
  const index = await loadBlogIndex()
  return index.posts.map((post) => post.slug)
}
