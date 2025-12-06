// /src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { LenisProvider } from '@/components/providers/LenisProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AIProvider } from '@/components/providers/AIProvider'
import { Navbar } from '@/components/layout/Navbar'
import { ParticleField } from '@/components/effects/ParticleField'

export const metadata: Metadata = {
  title: 'LuxEstate | Luxusní nemovitosti budoucnosti',
  description: 'Objevte nejexkluzivnější nemovitosti s revolučním 3D zážitkem a AI stagingem. Prodej a pronájem luxusních bytů, domů a vil v Praze, Brně a celé ČR.',
  keywords: ['luxusní nemovitosti', 'prodej bytů Praha', 'pronájem vil', 'AI staging', '3D prohlídky', 'luxusní byty', 'investiční nemovitosti'],
  authors: [{ name: 'Patrik Jedlička', url: 'https://luxestate.cz' }],
  creator: 'Patrik Jedlička',
  publisher: 'LuxEstate',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: 'https://luxestate.cz',
    title: 'LuxEstate | Luxusní nemovitosti budoucnosti',
    description: 'Objevte nejexkluzivnější nemovitosti s revolučním 3D zážitkem a AI stagingem.',
    siteName: 'LuxEstate',
    images: [
      {
        url: 'https://luxestate.cz/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LuxEstate - Luxusní nemovitosti',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxEstate | Luxusní nemovitosti budoucnosti',
    description: 'Objevte nejexkluzivnější nemovitosti s revolučním 3D zážitkem a AI stagingem.',
    images: ['https://luxestate.cz/twitter-image.jpg'],
    creator: '@luxestate_cz',
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0a]">
        <ThemeProvider>
          <LenisProvider>
            <ParticleField />
            <Navbar />
            <main>{children}</main>
            <AIProvider />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
