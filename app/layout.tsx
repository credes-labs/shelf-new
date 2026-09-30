import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shelf — Keep your context',
  description: 'Save notes, links, screenshots, ideas, and moments into collections you can revisit anytime.',
  icons: { icon: '/svg/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
