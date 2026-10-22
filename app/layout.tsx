import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import UiSoundManager from '../components/UiSoundManager';
import SoundToggle from '../components/SoundToggle';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
  // Absolute origin for canonical URLs and social images. Set NEXT_PUBLIC_SITE_URL
  // in production (e.g. https://shelf.example).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Shelf — Keep your context',
  description: 'A home for the things you mean to keep.',
  icons: {
    icon: '/svg/favicon.svg',
    shortcut: '/svg/favicon.svg',
  },
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
      <body className={spaceGrotesk.className}><UiSoundManager />{children}<SoundToggle variant="corner" /></body>
    </html>
  );
}
