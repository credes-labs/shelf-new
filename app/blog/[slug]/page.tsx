import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ContentPage from '../../../components/ContentPage'
import RichText from '../../../components/RichText'
import { loadBlogPost, loadBlogSlugs } from '../../../lib/payload'

export const revalidate = 60

type Params = { params: { slug: string } }

export async function generateStaticParams() {
  const slugs = await loadBlogSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { post } = await loadBlogPost(params.slug)
  if (!post) return { title: 'Article · Shelf' }

  const description = post.seo.description || post.excerpt
  const image = post.seo.image
  return {
    title: post.seo.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seo.title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: image ? [{ url: image, alt: post.cover?.alt || post.title }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: post.seo.title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function BlogArticlePage({ params }: Params) {
  const { post } = await loadBlogPost(params.slug)
  if (!post) notFound()

  const hasFooter = Boolean(post.seriesNote || post.prev || post.next)
  const socialImage = post.seo.image || post.cover?.url
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Shelf' },
    ...(socialImage ? { image: socialImage } : {}),
    mainEntityOfPage: `/blog/${post.slug}`,
    articleSection: post.category,
    keywords: post.tags.join(', '),
  }

  return (
    <ContentPage
      className="article-content"
      visual="/right_visual_blog.jpg"
      visualAlt="Shelf blog visual: planning a meeting"
    >
      <Link className="article-back" href="/blog">← All notes</Link>
      <p className="blog-category">{post.category}</p>
      <h1>{post.title}</h1>
      <p className="page-lead">{post.excerpt}</p>
      <p className="blog-meta">
        {post.author} <span aria-hidden="true">·</span> {post.dateLabel}
        <span aria-hidden="true">·</span> {post.readingTime} min read
      </p>

      {post.cover && (
        <figure className="article-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover.url}
            alt={post.cover.alt}
            width={post.cover.width ?? 1600}
            height={post.cover.height ?? 1000}
          />
          {post.cover.caption && <figcaption>{post.cover.caption}</figcaption>}
        </figure>
      )}

      <div className="article-body">
        <RichText value={post.content} />
      </div>

      {post.tags.length > 0 && (
        <ul className="article-tags" aria-label="Topics">
          {post.tags.map(tag => <li key={tag}>{tag}</li>)}
        </ul>
      )}

      {hasFooter && (
        <footer className="article-series">
          {post.seriesNote && <p>{post.seriesNote}</p>}
          <nav aria-label="Series navigation">
            {post.prev && <Link href={`/blog/${post.prev.slug}`}>← Previously: {post.prev.title}</Link>}
            {post.next && <Link href={`/blog/${post.next.slug}`}>Next: {post.next.title} →</Link>}
          </nav>
        </footer>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </ContentPage>
  )
}
