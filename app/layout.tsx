import './globals.css';
import type { Metadata } from 'next';
import { Caveat, DM_Sans, Inter, Manrope, Outfit, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

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
      <body className={`${inter.className} ${inter.variable} ${caveat.variable} ${spaceGrotesk.variable} ${manrope.variable} ${dmSans.variable} ${outfit.variable}`}>{children}</body>
    </html>
  );
}
