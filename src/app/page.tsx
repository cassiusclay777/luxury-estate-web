// /src/app/page.tsx
import { Hero } from '@/components/sections/Hero'
import { AboutSection } from '@/components/sections/AboutSection'
import { FeaturedProperties } from '@/components/sections/FeaturedProperties'

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <FeaturedProperties />
    </>
  )
}
