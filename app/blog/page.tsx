import Link from 'next/link';
import ContentPage from '../../components/ContentPage';

export const metadata = { title: 'Blog · Shelf', description: 'Product thinking, updates, and the messy middle of organizing life’s context.' };

const posts = [
  {
    slug: 'what-killed-the-ai-pin',
    category: 'Personal Context Infrastructure',
    title: 'What Killed the AI Pin: A Post-Mortem on Humane, Rabbit, and the Wearable Wave',
    summary: 'Humane, Rabbit and the wearable AI wave did not fail only because of poor execution. They were built on the wrong input layer: ambient voice.',
    date: 'Aug 11, 2026',
  },
  {
    slug: 'ai-that-knows-you',
    category: 'Personal Context Infrastructure',
    title: 'Why Every Attempt at “AI That Knows You” Has Bet on the Wrong Layer',
    summary: 'AI wearables focused on listening, but most personal context already lives in screenshots, links, notes and saved media. The missing layer is personal context infrastructure.',
    date: 'Jul 24, 2026',
  },
];

export default function BlogPage() {
  return (
    <ContentPage className="blog-content">
      <p className="page-eyebrow">Blog</p>
      <h1>Notes from building Shelf</h1>
      <p className="page-lead">Product thinking, updates, and the messy middle of organizing life’s context.</p>
      <div className="blog-list">
        {posts.map(post => (
          <article className="blog-card" key={post.slug}>
            <p className="blog-category">{post.category}</p>
            <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
            <p>{post.summary}</p>
            <p className="blog-meta">Divyaraj Chauhan <span aria-hidden="true">·</span> {post.date}</p>
            <Link className="blog-read-link" href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>Read article <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </div>
    </ContentPage>
  );
}
