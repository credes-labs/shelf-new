import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import UiSoundManager from '../components/UiSoundManager';
import SoundToggle from '../components/SoundToggle';
import ReferralCapture from '../components/ReferralCapture';

const inter = localFont({
  src: './fonts/Inter-latin.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
  style: 'normal',
});
const playfair = localFont({
  src: [
    { path: './fonts/PlayfairDisplay-Normal-latin.woff2', weight: '400 900', style: 'normal' },
    { path: './fonts/PlayfairDisplay-Italic-latin.woff2', weight: '400 900', style: 'italic' },
  ],
  variable: '--font-serif',
  display: 'swap',
});

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
      <body className={`${inter.variable} ${playfair.variable}`}><UiSoundManager /><ReferralCapture />{children}<SoundToggle variant="corner" /></body>
    </html>
  );
}
