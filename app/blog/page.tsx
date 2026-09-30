import { PageShell } from '@/components/site-shell';

const posts = [
  {
    slug: 'small-things-worth-remembering',
    title: 'Small things worth remembering',
    date: '18 SEP 2026',
    excerpt: 'A note on collecting the ephemeral details that make an ordinary day feel like yours.',
    body: [
      'There is a particular kind of value in the small things — the receipt from a convenience store in Kyoto, the half-thought you wrote down at 2am, the link a friend sent that you never opened. None of it feels monumental in the moment. Together, it is the texture of an intellectual life.',
      'Most software treats this material as disposable noise. Apps ask you to file it, tag it into rigid taxonomies, or decide immediately whether it matters. Shelf starts from the opposite assumption: save first with spatial freedom, decide later.',
      'When you can search across everything you have kept — photos, notes, links, files — the fragments begin to cross-pollinate. A receipt becomes part of a trip dossier. A 2am thought becomes part of a monograph. Context emerges from the collection, not from a rigid folder tree.',
      'That is the idea we are building toward: a shelf that holds the small things so you can revisit them when they turn out to have mattered all along.',
    ],
  },
  {
    slug: 'the-right-context',
    title: 'The right context, at the right time',
    date: '11 AUG 2026',
    excerpt: 'Why the best tools for thought help you reconnect forgotten traces instead of generating algorithmic chatter.',
    body: [
      'The problem is rarely that you forgot to bookmark a page. The problem is that you saved it into a black hole of four thousand unorganized bookmarks and cannot find it when it would actually change your mind.',
      'A good memory tool should feel less like an enterprise database and more like an intimate dialogue with your past self. You should be able to navigate in the visual, sensory way you remember things — “that blueprint from Osaka”, “the essay on computer interfaces”, “that typographic specimen from Milan” — and immediately retrieve the surrounding cluster.',
      'Shelf is designed around that cognitive retrieval loop. Collections preserve the temporal and visual context of your discovery, so finding one idea effortlessly surfaces the inspirations you forgot you needed.',
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
      <section className="editorial-page-stage" style={{ background: 'var(--blue)' }}>
        <div className="page-container-narrow">
          <div className="section-kicker mono">
            <span>FIELD NOTES // THE SHELF JOURNAL</span>
          </div>

          <h1 className="editorial-h1">
            NOTES ON <span className="serif" style={{ textTransform: 'none', fontWeight: 400 }}>memory,</span> RETENTION & ARCHIVES.
          </h1>

          <p className="editorial-lead">
            Product design philosophies, technical specs, and dispatches on curating digital traces in the modern era.
          </p>

          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {posts.map((post) => (
              <details 
                key={post.slug} 
                id={post.slug} 
                open={openPost === post.slug}
                style={{
                  border: '1px solid var(--line-blue)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '24px',
                  borderRadius: '2px',
                }}
              >
                <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                  <div className="mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                    {post.date} // DISPATCH
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
                    {post.excerpt}
                  </p>
                </summary>

                <div 
                  className="editorial-body-prose" 
                  style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line-blue-subtle)' }}
                >
                  {post.body.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
