import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentPage from '../../../components/ContentPage';

const articles = {
  'what-killed-the-ai-pin': {
    category: 'Personal Context Infrastructure',
    title: 'What Killed the AI Pin: A Post-Mortem on Humane, Rabbit, and the Wearable Wave',
    date: 'Aug 11, 2026',
    intro: 'Humane, Rabbit and the wearable AI wave did not fail only because of poor execution. They were built on the wrong input layer: ambient voice.',
    paragraphs: [
      'The promise was compelling: a small device that could understand the world around you and help without asking you to reach for a phone. But the bet underneath that promise was that voice could become the main way we give technology context.',
      'Voice works well when your hands are busy or when a request is short and clear. It is much less comfortable as an always-available interface. People move through shared spaces, noisy rooms, quiet moments, and conversations they do not want a device to interpret. An interaction that depends on speaking out loud asks for attention at exactly the moments technology promised to remove friction.',
      'There is another problem: most of the context we want help with is already visual and written. It lives in screenshots, links, notes, photos, documents, and messages. These are things we chose to keep. They have names, details, and relationships that a microphone cannot reliably infer from the room around us.',
      'The lesson is not that new hardware cannot work. It is that a new device needs a useful context layer before it can feel intelligent. Without a dependable way to collect and reconnect the things a person already cares about, a clever interface has very little to work with.',
      'Shelf starts with those artifacts. Save the thought, image, link, or file in the moment; give it a collection when that helps; and find it later through the context around it. The interface can change over time. The useful part is that your context stays yours and stays findable.',
    ],
  },
  'ai-that-knows-you': {
    category: 'Personal Context Infrastructure',
    title: 'Why Every Attempt at “AI That Knows You” Has Bet on the Wrong Layer',
    date: 'Jul 24, 2026',
    intro: 'AI wearables focused on listening, but most personal context already lives in screenshots, links, notes and saved media. The missing layer is personal context infrastructure.',
    paragraphs: [
      '“AI that knows you” is often described as a listening problem: collect enough conversation and a system will understand what matters. But a person’s day is not one continuous stream of speech. Important context is scattered across the things they deliberately save and the places they return to.',
      'A screenshot can hold a restaurant someone mentioned, a product to compare, or a line from an article. A note can be half a plan. A link can matter because of the conversation that sent it. None of those items makes sense in isolation, and none needs to be captured by recording everything around it.',
      'The missing layer is a personal place where those fragments can live together. It should accept different kinds of material without making people decide on a filing system first. Collections can add shape over time, while search helps connect details when the original reason for saving them has faded.',
      'That layer should also be useful on its own. An assistant may help interpret or act on context later, but it should not be the only way to reach it. People need to see what they saved, move it, and find it again without asking a model to reconstruct their history.',
      'We think the next step is less about making devices listen harder and more about making personal context durable. Capture freely, organize lightly, and let the right thing resurface when it becomes useful again.',
    ],
  },
} as const;

type ArticleSlug = keyof typeof articles;

export function generateStaticParams() {
  return Object.keys(articles).map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles[params.slug as ArticleSlug];
  return article ? { title: `${article.title} · Shelf`, description: article.intro } : { title: 'Article · Shelf' };
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug as ArticleSlug];
  if (!article) notFound();

  return (
    <ContentPage className="article-content">
      <Link className="article-back" href="/blog">← All notes</Link>
      <p className="blog-category">{article.category}</p>
      <h1>{article.title}</h1>
      <p className="page-lead">{article.intro}</p>
      <p className="blog-meta">Divyaraj Chauhan <span aria-hidden="true">·</span> {article.date}</p>
      <div className="article-body">{article.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    </ContentPage>
  );
}
