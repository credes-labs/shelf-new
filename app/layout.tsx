import './globals.css';
import type { Metadata } from 'next';
import { Caveat, Instrument_Serif, Inter, JetBrains_Mono, Playfair_Display, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' });
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: ['400'], variable: '--font-instrument-serif' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair-display' });

export const metadata: Metadata = {
  title: 'Shelf — Keep your context',
  description: 'Save notes, links, screenshots, ideas, and moments into organized collections you can revisit anytime.',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${caveat.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} ${playfairDisplay.variable}`}>{children}</body>
    </html>
  );
}
