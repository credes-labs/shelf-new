import { PageShell } from '@/components/site-shell';
import { notFound } from 'next/navigation';

const posts: Record<string, { title: string; date: string; kicker: string; body: string[] }> = {
  'small-things-worth-remembering': {
    title: 'Small things worth remembering',
    date: 'Sep 18, 2026',
    kicker: 'PERSONAL CONTEXT INFRASTRUCTURE',
    body: [
      'There is a particular kind of value in the small things — the receipt from a convenience store, the half-thought you wrote down at 2am, the link a friend sent that you never opened. None of it feels important in the moment. Together, it is the texture of a life.',
      'Most apps treat this material as noise. They ask you to file it, tag it, or decide immediately whether it matters. Shelf starts from the opposite assumption: save first, decide later. The structure can wait until the meaning becomes clear.',
      'When you can search across everything you have kept — photos, notes, links, files — the small things start to talk to each other. A receipt becomes part of a trip. A 2am thought becomes part of a project. Context emerges from the collection, not from a single item.',
      'That is the idea we are building toward: a shelf that holds the small things so you can revisit them when they turn out to have mattered.',
    ],
  },
  'the-right-context': {
    title: 'The right context, at the right time',
    date: 'Aug 11, 2026',
    kicker: 'PERSONAL CONTEXT INFRASTRUCTURE',
    body: [
      'The problem is rarely that you forgot to save something. The problem is that you saved it somewhere and cannot find it when it would be useful.',
      'A good memory tool should feel less like a search engine and more like a conversation with your past self. You should be able to ask in the messy way you remember things — “that photo from Osaka”, “the note about the hospital”, “that link about the Fuji trail” — and get back the right cluster of context.',
      'Shelf is designed around that moment. Collections group related captures together so finding one thing often surfaces the things you forgot you needed. Search reaches across every type of media so you are not guessing which app you used.',
      'The goal is simple: when something matters, the context is already there, waiting to be found.',
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  if (!post) notFound();
  return (
    <PageShell>
      <article className="editorial-page article-page content-width">
        <p className="page-kicker">{post.kicker}</p>
        <h1>{post.title}</h1>
        <small className="article-date">{post.date}</small>
        {post.body.map((para, i) => <p key={i} className="article-body">{para}</p>)}
      </article>
    </PageShell>
  );
}
