import { PageShell } from '@/components/site-shell';

const features = [
  ['Organize', 'Build collections that match how your mind works, without rigid folders getting in the way.'],
  ['Find', 'Search across photos, notes, web links, and files to bring the right context back.'],
  ['Use', 'Reconnect the details you saved and carry them into your next decision, trip, project, or story.'],
];

export default function FeaturesPage() {
  return (
    <PageShell>
      <article className="simple-page content-width">
        <p className="eyebrow">Features</p>
        <h1>Keep it. Find it. Use it.</h1>
        <p>Shelf is a home for the things you want to remember. Capture freely, organize lightly, and find useful context again.</p>
        <div className="feature-list">
          {features.map(([title, text]) => <p key={title}><strong>{title}.</strong> {text}</p>)}
        </div>
      </article>
    </PageShell>
  );
}
