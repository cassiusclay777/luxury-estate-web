'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { SearchBar } from '@/components/ui/SearchBar'
import { ArrowDown } from 'lucide-react'
import Image from 'next/image'

function Counter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return <span ref={ref}>{count.toLocaleString('cs-CZ')}</span>
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Full-width background image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2940&auto=format&fit=crop"
          alt="Luxusní nemovitost"
          fill
          priority
          className="object-cover"
          quality={90}
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-32 pb-20">
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8 text-[#f5f5f5]"
        >
          Objevte svůj<br />vysněný domov
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="text-xl md:text-2xl text-[#a0a0a0] max-w-2xl mx-auto mb-12"
        >
          Nejprestižnější nemovitosti na jednom místě
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <SearchBar />
        </motion.div>

        {/* Stats with counter animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="grid grid-cols-3 gap-8 md:gap-16 mt-20 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[#f5f5f5] font-mono tabular-nums mb-2">
              <Counter end={2847} />+
            </div>
            <div className="text-sm md:text-base text-[#a0a0a0]">Nemovitostí</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[#f5f5f5] font-mono tabular-nums mb-2">
              <Counter end={12} />M Kč
            </div>
            <div className="text-sm md:text-base text-[#a0a0a0]">Průměrná cena</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-[#f5f5f5] font-mono tabular-nums mb-2">
              <Counter end={1523} />+
            </div>
            <div className="text-sm md:text-base text-[#a0a0a0]">Spokojení klienti</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-[#a0a0a0]"
        >
          <span className="text-sm">Scrollovat dolů</span>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}
