import React from 'react'

export const metadata = {
  title: 'Shelf CMS',
  description: 'Content admin for the Shelf blog.',
  robots: { index: false, follow: false },
}

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
