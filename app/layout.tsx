import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import UiSoundManager from '../components/UiSoundManager';
import SoundToggle from '../components/SoundToggle';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const metadata: Metadata = {
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
