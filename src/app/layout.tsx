// /src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { LenisProvider } from '@/components/providers/LenisProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { ParticleField } from '@/components/effects/ParticleField'

export const metadata: Metadata = {
  title: 'LuxEstate | Luxusní nemovitosti budoucnosti',
  description: 'Objevte nejexkluzivnější nemovitosti s revolučním 3D zážitkem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className="noise">
        <ThemeProvider>
          <LenisProvider>
            <ParticleField />
            <Navbar />
            <main>{children}</main>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}