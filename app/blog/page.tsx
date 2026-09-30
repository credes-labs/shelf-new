import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageShell } from '@/components/site-shell';

const posts = [{ slug: 'small-things-worth-remembering', title: 'Small things worth remembering', excerpt: 'A note on collecting the details that make an ordinary day feel like yours.', date: 'Sep 18, 2026' }, { slug: 'the-right-context', title: 'The right context, at the right time', excerpt: 'Why the best personal tools help you reconnect the dots instead of adding more noise.', date: 'Aug 11, 2026' }];

export default function BlogPage() { return <PageShell><article className="editorial-page blog-page content-width"><p className="page-kicker">BLOG</p><h1>Notes from building Shelf</h1><p className="page-lede">Product thinking, updates, and the messy middle of organizing life&apos;s context.</p><div className="post-list">{posts.map((post) => <Link className="post-card" href={`/blog/${post.slug}`} key={post.slug}><div><span>PERSONAL CONTEXT INFRASTRUCTURE</span><h2>{post.title}</h2><p>{post.excerpt}</p><small>{post.date}</small></div><ArrowRight size={24} /></Link>)}</div></article></PageShell>; }
