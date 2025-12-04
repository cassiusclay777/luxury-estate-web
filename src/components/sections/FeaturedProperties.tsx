'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { Property, supabase } from '@/lib/supabase'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) throw error

        setProperties(data || [])
      } catch (error) {
        console.error('Failed to fetch properties:', error)
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  return (
    <section ref={containerRef} className="relative py-32 overflow-hidden" id="nemovitosti">
      {/* Background decoration */}
      <motion.div
        style={{ y }}
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[var(--purple-light)]/10 blur-[150px] -z-10"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--gold)]/10 blur-[100px] -z-10"
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-[var(--gold)]" />
              <span className="text-[var(--gold)] font-medium uppercase tracking-wider text-sm">
                Vybrané nemovitosti
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold font-['Syne']">
              <span className="text-white">Exkluzivní </span>
              <span className="text-gradient">nabídka</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href="/search"
              className="mt-6 md:mt-0 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              Zobrazit všechny
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Property grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[400px] rounded-3xl glass animate-pulse"
              />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-20"
          >
            <p className="text-white/60 text-lg">
              Zatím nejsou k dispozici žádné nemovitosti.
            </p>
            <p className="text-white/40 text-sm mt-2">
              Spusťte seed script: npm run seed
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        )}

        {/* Load more */}
        {!loading && properties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mt-16"
          >
            <Link href="/search">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 rounded-full bg-gradient-to-r from-[var(--gold)] via-[var(--purple-light)] to-[var(--cyan)] text-white font-bold text-lg glow-gold"
              >
                Načíst další nemovitosti
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
