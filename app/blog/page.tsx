import Link from 'next/link'
import ContentPage from '../../components/ContentPage'
import { loadBlogIndex } from '../../lib/payload'

export const metadata = {
  title: 'Blog · Shelf',
  description: 'Product thinking, updates, and the messy middle of organizing life’s context.',
}

export const revalidate = 60

export default async function BlogPage() {
  const { posts } = await loadBlogIndex()

  return (
    <ContentPage
      className="blog-content"
      visual="/right_visual_blog.jpg"
      visualAlt="Shelf blog visual: planning a meeting"
    >
      <p className="page-eyebrow">Blog</p>
      <h1>Notes from building Shelf</h1>
      <p className="page-lead">Product thinking, updates, and the messy middle of organizing life’s context.</p>

      {posts.length === 0 ? (
        <p className="blog-empty">No notes yet. The first one is on its way.</p>
      ) : (
        <div className="blog-list">
          {posts.map(post => (
            <article className="blog-card" key={post.slug}>
              <p className="blog-category">{post.category}</p>
              <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
              <p>{post.excerpt}</p>
              <p className="blog-meta">
                {post.author} <span aria-hidden="true">·</span> {post.dateLabel}
                <span aria-hidden="true">·</span> {post.readingTime} min read
              </p>
              <Link className="blog-read-link" href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
                Read article <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </ContentPage>
  )
}
