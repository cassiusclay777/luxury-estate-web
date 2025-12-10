'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { PropertyCard } from '../../components/ui/PropertyCard'
import { MapView } from '../../components/map/MapView'
import { searchProperties, type SearchFilters } from '../../lib/search'
import type { Property } from '../../lib/supabase'
import { Loader2, Map, Grid3X3, SlidersHorizontal } from 'lucide-react'

function SearchContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function performSearch() {
      setLoading(true)

      const query = searchParams.get('q') || ''
      const priceRange = searchParams.get('price')

      const filters: SearchFilters = {
        query: query
      }

      // Parse price range
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number)
        filters.minPrice = min
        filters.maxPrice = max
      }

      try {
        const result = await searchProperties(filters)
        setProperties(result.properties)
        setTotal(result.total)
      } catch (error) {
        console.error('Search failed:', error)
        setProperties([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[var(--gold)] animate-spin" />
          <p className="text-white/70">Hledám nemovitosti...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold font-['Syne'] mb-2">
                <span className="text-gradient">Výsledky hledání</span>
              </h1>
              <p className="text-white/60">
                Nalezeno {total} {total === 1 ? 'nemovitost' : total < 5 ? 'nemovitosti' : 'nemovitostí'}
                {searchParams.get('q') && ` pro "${searchParams.get('q')}"`}
              </p>
            </div>

            {/* View mode toggle */}
            <div className="flex gap-2 glass rounded-xl p-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'map'
                    ? 'bg-gradient-to-r from-[var(--gold)] to-[var(--purple-light)] text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <button className="px-4 py-2 glass rounded-xl text-white/70 hover:text-white transition-colors flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filtry
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-2">Žádné výsledky</h2>
            <p className="text-white/60">Zkuste upravit vyhledávací dotaz nebo filtry</p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[600px] rounded-3xl overflow-hidden"
          >
            <MapView
              properties={properties}
              center={
                properties[0]?.lng && properties[0]?.lat
                  ? [properties[0].lng, properties[0].lat]
                  : [16.6068, 49.1951]
              }
              zoom={12}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[var(--gold)] animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
