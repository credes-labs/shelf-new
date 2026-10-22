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
  applicationName: 'Shelf',
  icons: {
    icon: [
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/shelf-icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icons/favicon-32x32.png',
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'Shelf',
    title: 'Shelf — Keep your context',
    description: 'A home for the things you mean to keep.',
    url: '/',
    images: [
      {
        url: '/og/shelf-og.png',
        width: 1200,
        height: 630,
        alt: 'Shelf — Keep your context',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shelf — Keep your context',
    description: 'A home for the things you mean to keep.',
    images: [
      {
        url: '/og/shelf-og.png',
        alt: 'Shelf — Keep your context',
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
