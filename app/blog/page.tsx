import { PageShell } from '@/components/site-shell';

const posts = [
  {
    slug: 'small-things-worth-remembering',
    title: 'Small things worth remembering',
    date: 'Sep 18, 2026',
    excerpt: 'A note on collecting the details that make an ordinary day feel like yours.',
    body: [
      'There is a particular kind of value in the small things — the receipt from a convenience store, the half-thought you wrote down at 2am, the link a friend sent that you never opened. None of it feels important in the moment. Together, it is the texture of a life.',
      'Most apps treat this material as noise. They ask you to file it, tag it, or decide immediately whether it matters. Shelf starts from the opposite assumption: save first, decide later. The structure can wait until the meaning becomes clear.',
      'When you can search across everything you have kept — photos, notes, links, files — the small things start to talk to each other. A receipt becomes part of a trip. A 2am thought becomes part of a project. Context emerges from the collection, not from a single item.',
      'That is the idea we are building toward: a shelf that holds the small things so you can revisit them when they turn out to have mattered.',
    ],
  },
  {
    slug: 'the-right-context',
    title: 'The right context, at the right time',
    date: 'Aug 11, 2026',
    excerpt: 'Why the best personal tools help you reconnect the dots instead of adding more noise.',
    body: [
      'The problem is rarely that you forgot to save something. The problem is that you saved it somewhere and cannot find it when it would be useful.',
      'A good memory tool should feel less like a search engine and more like a conversation with your past self. You should be able to ask in the messy way you remember things — “that photo from Osaka”, “the note about the hospital”, “that link about the Fuji trail” — and get back the right cluster of context.',
      'Shelf is designed around that moment. Collections group related captures together so finding one thing often surfaces the things you forgot you needed. Search reaches across every type of media so you are not guessing which app you used.',
      'The goal is simple: when something matters, the context is already there, waiting to be found.',
    ],
  },
];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>;
}) {
  const { post: openPost } = await searchParams;

  return (
    <PageShell>
      <article className="blog-page content-width">
        <p className="eyebrow">The Shelf journal</p>
        <h1>Notes from building Shelf.</h1>
        <p className="blog-intro">Product thinking, updates, and the messy middle of organizing life&apos;s context.</p>
        <div className="post-list">
          {posts.map((post) => (
            <details className="blog-post" id={post.slug} key={post.slug} open={openPost === post.slug}>
              <summary>
                <span className="post-date">{post.date}</span>
                <span className="post-title">{post.title}</span>
                <span className="post-excerpt">{post.excerpt}</span>
                <span className="post-toggle" aria-hidden="true">+</span>
              </summary>
              <div className="post-body">
                {post.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </details>
          ))}
        </div>
      </article>
    </PageShell>
  );
}
